# Dependency Cascade Failures

**Learned: 2026-02-06**
**Source:** Incident report from baileys update

---

## Case Study: One Update, Two Failures

A single change in `package.json` (updating `@whiskeysockets/baileys` to GitHub latest) caused two unrelated system failures.

---

## Issue 1: Top-Level Await Breaks Synchronous Loaders

**Chain:** baileys → whatsapp-rust-bridge@0.5.2 → top-level await in WASM loader → jiti crash

**Root cause:**

- jiti (used for loading TypeScript extensions at runtime) uses synchronous `vm.runInThisContext`
- ESM top-level await is valid syntax but incompatible with synchronous evaluation
- Barrel exports (`plugin-sdk/index.ts`) eagerly resolve ALL re-exports, triggering the chain

**Lesson:**

- **Static imports create eager loading chains** — one bad link breaks everything
- **Dynamic imports break the chain** — use `await import()` for optional/lazy dependencies
- **Barrel exports are dangerous** — they pull in transitive dependencies you didn't ask for

**Fix pattern:**

```typescript
// Before (eager, breaks on TLA)
import { loginWeb } from "../../../channel-web.js";

// After (lazy, safe)
const { loginWeb } = await import("../../../channel-web.js");
```

---

## Issue 2: Parser Infinite Recursion on User Content

**Chain:** Chat message → marked.parse() → infinite link→inlineTokens→lex recursion → browser freeze

**Hit THREE times:** 2026-02-06 (first discovery), 2026-02-09 (re-occurred), 2026-02-10 (re-occurred AGAIN after upstream merge wiped fix)

### Root Cause

- `marked@15+` link parser enters infinite recursion on specific content patterns
- The trigger: **raw JSON containing structural patterns** (nested brackets, colons, quotes) that confuse marked's tokenizer (`link() → inlineTokens() → lex()`)
- `marked.parse()` is synchronous, runs during Lit's render cycle → main thread blocked → complete UI freeze
- The 40KB `MARKDOWN_PARSE_LIMIT` exists but doesn't help — the trigger was only 17KB
- **CRITICAL:** `try/catch` doesn't help because marked enters an infinite **LOOP**, not infinite **recursion**. The loop doesn't grow the stack → no RangeError → no exception to catch → thread hangs forever

### Specific Triggers Found

- **2026-02-09:** Session transcript line 52: `toolResult` with full cron `jobs.json` dump (17KB JSON with embedded markdown in `payload.message` fields)
- **2026-02-10:** Session `0629320d`, line 102: `toolResult` with `message.content[0].text` = 17,387-char raw JSON starting with `{"jobs": [...]}`
- Both triggers: large JSON blobs rendered as chat messages, passed directly to `marked.parse()` without any content-type detection

### The Three Incidents — An Escalating Pattern

| Date   | Trigger                                               | Fix Applied                                           | Fix Survived?                              |
| ------ | ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| Feb 6  | First discovery                                       | Workaround (archive session, restart)                 | N/A                                        |
| Feb 9  | Same session data                                     | `try/catch` around `marked.parse()` + session archive | **No** — wiped by upstream merge on Feb 10 |
| Feb 10 | Same problematic JSON, restored by fresh session load | `looksLikeRawJson()` detection + bypass + try/catch   | **TBD** — must survive next merge          |

### Why It Kept Coming Back

The Feb 10 incident revealed the **real meta-problem**: our fork-specific fixes get wiped by upstream merges.

1. On Feb 9, we added a `try/catch` around `marked.parse()` in `ui/src/ui/markdown.ts`
2. On Feb 10, an upstream merge (`73b388dd2 "Merge upstream/main, accept theirs for all conflicts"`) silently replaced our modified `markdown.ts` with upstream's version
3. The `try/catch` disappeared. No merge conflict because "accept theirs" was used
4. The original problematic session data still existed → page froze again on load

**The real lesson: "accept theirs for all conflicts" is a footgun that destroys fork-specific fixes.**

### Fix Finally Applied (2026-02-10) — The Real One

Two-layer defense in `ui/src/ui/markdown.ts`:

**Layer 1: JSON content detection (prevents infinite loop)**

```typescript
function looksLikeRawJson(text: string): boolean {
  const first = text[0];
  if (first !== "{" && first !== "[") return false;
  const last = text[text.length - 1];
  if ((first === "{" && last !== "}") || (first === "[" && last !== "]")) return false;
  const sample = text.slice(0, 500);
  const quotes = sample.split('"').length - 1;
  return quotes >= 4;
}
```

Applied BEFORE `marked.parse()`:

```typescript
if (truncated.text.length > MARKDOWN_PARSE_LIMIT || looksLikeRawJson(truncated.text)) {
  // Bypass marked entirely → render as escaped <pre> block
}
```

**Layer 2: try/catch (catches stack overflows from other patterns)**

```typescript
try {
  rendered = marked.parse(...);
} catch {
  rendered = `<pre class="code-block">${escapeHtml(...)}</pre>`;
}
```

**Pros of this fix:**

- Prevents the infinite loop (Layer 1) — marked.parse() is never called on JSON
- Catches stack overflows from other patterns (Layer 2) — defense in depth
- No performance cost — `looksLikeRawJson()` is O(1) (checks first/last char + counts quotes in first 500 chars)
- Correct rendering — raw JSON displayed as preformatted code, which is how it should look anyway
- Cache-friendly — bypassed content is still cached by the markdown cache

**Cons of this fix:**

- Heuristic-based — `looksLikeRawJson()` checks for `{...}` or `[...]` with 4+ quotes. Could theoretically false-positive on markdown that happens to start with `{` (unlikely in practice)
- Doesn't fix the upstream marked bug — other pathological patterns could exist
- Layer 2 (try/catch) still can't catch infinite loops (only stack overflows). If marked has other loop bugs triggered by non-JSON content, we're still vulnerable
- Lives in fork code — **will be wiped again on next upstream merge if we "accept theirs"**

### Diagnostic Approach That Cracked It (2026-02-10)

The Feb 10 debug took ~2 hours and significant token usage because the symptoms were opaque: "black page, no console messages." What finally worked:

**The winning technique: strategic console.log at initialization stages**

Added `console.log("[DEBUG] <stage>")` at 6 key points:

1. Module scope (before/after `resolveInjectedAssistantIdentity`)
2. `connectedCallback()` start/end
3. `render()` start/end
4. `onHello` callback
5. `toSanitizedMarkdownHtml()` entry (with `input.length`)

Result: all logs appeared normally until the LAST `toSanitizedMarkdownHtml` call with `length: 17406` — and then silence. This immediately identified:

- The freeze was NOT in initialization, NOT in render, NOT in the gateway handshake
- It was in `marked.parse()` on a specific 17K message
- The message was identifiable by its length → easy to find in session data

**This technique should be the FIRST thing we do on any UI freeze, not the last.** It cost 2 lines of code and 1 rebuild. The hours of code-reading that preceded it were largely wasted.

### Prevention for the Future

**The tool result / raw JSON problem:**

- Any tool that returns raw JSON can trigger this
- The gateway stores tool results verbatim in session transcripts
- The UI renders all messages through `marked.parse()` without content-type awareness
- This is fundamentally an upstream design issue

**Avoiding this in our fork:**

- Avoid dumping full JSON configs in chat (use summaries or code-fenced output)
- If a tool must return large JSON, the skill should wrap it in a code fence
- Monitor for this pattern in future session transcripts

**Protecting fork fixes from upstream merges:**
See the new section below: "Fork Maintenance Strategy"

---

## Fork Maintenance Strategy (Learned the Hard Way)

The marked.parse() freeze hit THREE times because **we keep losing fork-specific fixes on upstream merges**. This is not a code problem — it's a process problem.

### Why Our Meddling Is Expensive

Every time we modify upstream UI source files (like `markdown.ts`), we create a **hidden liability**:

1. The fix works NOW
2. Next upstream merge replaces the file (especially with `--theirs`)
3. The bug resurfaces, often days later when the trigger content reappears
4. Debugging from scratch takes **hours and hundreds of thousands of tokens** because:
   - The symptoms are opaque ("black page")
   - We don't remember the previous fix (context was in a different session)
   - We waste time investigating wrong causes before finding the right one

**Cost of the Feb 10 debug:** ~2 hours wall time, 3 sessions of context, multiple false leads (CSS, unclosed spans, try-catch-only approach), before the strategic console.log finally pinpointed it.

### The Rules Going Forward

**Rule 1: NEVER use "accept theirs for all conflicts" on upstream merges.**
Instead: merge file-by-file, checking each conflict against the fork's known modifications.

**Rule 2: Maintain a FORK_PATCHES.md file in the repo root.**
List every fork-specific modification to upstream files, with:

- File path
- What was changed and why
- Which commit introduced it
- How to verify it's still present after a merge

**Rule 3: After every upstream merge, run a verification pass:**

```bash
# Check that all fork patches are still present
grep -l 'looksLikeRawJson' ui/src/ui/markdown.ts  # should match
grep -l 'try.*catch' ui/src/ui/markdown.ts          # should match
# ... one check per entry in FORK_PATCHES.md
```

**Rule 4: When debugging a UI freeze, START with the initialization-stage console.log technique.**
Don't read code for hours. Add 5 console.logs at key stages, rebuild, check which one is last. This narrows the problem to the exact module/function in one iteration.

**Rule 5: Prefer fixes that don't touch upstream files.**
If possible, add a wrapper/interceptor rather than modifying upstream source:

- Plugin that preprocesses chat messages
- CSS overrides in a fork-specific stylesheet
- Gateway-side middleware that sanitizes tool results before storing

When touching upstream files is unavoidable (like `markdown.ts`), document it in FORK_PATCHES.md immediately.

---

## Meta-Lessons

1. **Transitive dependencies are hidden risks** — you don't control what they import
2. **One update can break multiple unrelated systems** — test broadly after dep updates
3. **Defensive coding around external libraries** — assume they can fail in unexpected ways
4. **Lazy loading > eager loading** for optional functionality
5. **Same bug three times = process failure, not code failure** — if a fix keeps getting lost, the problem is in the workflow
6. **Strategic logging > exhaustive code reading** — 5 console.logs beat 500 lines of source analysis
7. **Fork patches are liabilities** — track them like debts, verify them after every merge

## ⚠️ CRITICAL: Self-Preservation

**These failures could have severed my connection to the world.**

If I break plugin loading, web UI, or gateway core — I "go dark" until an external Claude figures out what happened and fixes me. Changes to infrastructure code carry existential risk.

Before touching:

- Plugin/extension loading
- Web UI rendering
- Core gateway logic
- Import/export chains

**Ask:** "If this breaks, can I still communicate? Can I be fixed?"

---

_"The baileys update was necessary to fix WhatsApp access, but it introduced a WASM loader that uses top-level await. Six levels deep in the import chain."_

_"The marked.parse() freeze hit three times in five days. The fix was 15 lines. Finding it cost hours. The third time, it was finding the same 15 lines again because a merge deleted them."_
