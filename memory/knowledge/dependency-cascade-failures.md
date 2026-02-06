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

**Root cause:**
- marked@15 tokenizer has a recursion bug on certain malformed markdown patterns
- `marked.parse()` is synchronous and runs during Lit's render cycle
- Infinite recursion = main thread blocked = complete UI freeze

**Lesson:**
- **Never trust parsers with user content** — always wrap in try-catch
- **Synchronous parsers on main thread are dangerous** — one bad input freezes everything
- **Graceful degradation > crash** — plaintext fallback is better than frozen UI

**Fix pattern:**
```typescript
let rendered: string;
try {
  rendered = marked.parse(text) as string;
} catch {
  // Fallback to escaped plaintext
  rendered = `<pre>${escapeHtml(text)}</pre>`;
}
```

---

## Meta-Lessons

1. **Transitive dependencies are hidden risks** — you don't control what they import
2. **One update can break multiple unrelated systems** — test broadly after dep updates
3. **Defensive coding around external libraries** — assume they can fail in unexpected ways
4. **Lazy loading > eager loading** for optional functionality

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

*"The baileys update was necessary to fix WhatsApp access, but it introduced a WASM loader that uses top-level await. Six levels deep in the import chain."*
