# OpenClaw Engagement Report — 2026-02-11 (Expanded)

## 1. GitHub PRs — Full Comment Analysis

### PR #6753: fix(webchat): canonicalize session key alias for new session button

**Status:** OPEN | **Mergeable:** CONFLICTING (merge conflicts) | **CI:** ✅ All passing (only label checks ran)

**What it does:** Fixes the "new session" button in web UI by canonicalizing the `"main"` session key alias.

**Reviewer feedback (Greptile bot):**

- Confidence 3/5
- Flagged unused `renderAvatar`/`isAvatarUrl` dead code in `grouped-render.ts`
- Noted `COMMAND_PATTERNS` list issues in tool-cards.ts
- Flagged exec security level union mismatch (`critical` vs `all`) between UI components

**Merge assessment:** 🔴 BLOCKED by merge conflicts. The PR includes many unrelated UI changes (tool card rendering, exec display, avatar removal) bundled with the session fix. This scope creep is likely why it has conflicts.

**Actions to merge:**

1. Rebase onto latest main to resolve conflicts
2. Consider splitting: session fix (small, clean) vs UI refactors (larger, needs review)
3. Remove dead code (renderAvatar) as Greptile suggested
4. Fix exec security level type mismatch

---

### PR #6747: fix(ui): add SVG styling for callout icons

**Status:** OPEN | **Mergeable:** UNKNOWN | **CI:** ❌ Format check FAILED, 1 macOS lint CANCELLED

**What it does:** Fixes SVG icons in `.callout` elements rendering as filled black shapes instead of stroked outlines.

**Reviewer feedback (Greptile bot):**

- Confidence 3/5
- Same tool-card UI concerns (this PR appears to share code with #6753/#6735)
- Favicon path changed to relative URL — could break on nested routes
- Core CSS fix is low risk

**CI Failures:**

- `checks (node, format, pnpm format)` → **FAILURE** — formatting issues
- `macos-app (lint)` → CANCELLED (timeout after 24h)

**Merge assessment:** 🟡 CLOSE — core fix is trivial and correct. Just needs formatting fix.

**Actions to merge:**

1. Run `pnpm format` locally and commit
2. The actual CSS change is 1-2 lines — consider stripping unrelated UI changes if they exist

---

### PR #6735: fix(agents): classify model 404/not-found errors as failover reason

**Status:** OPEN | **Mergeable:** UNKNOWN | **CI:** ❌ Multiple failures

**What it does:** Adds `model_not_found` FailoverReason to prevent infinite retry loops when models return 404.

**Reviewer feedback:**

- **Greptile bot (Confidence 3/5):** Flagged tool-card status detection as P0 — `renderToolCardSidebar` treats missing output as success
- **Glucksberg (contributor):** "This appears to duplicate PR #4997, which implements the same fix. Consider consolidating or closing one."

**CI Failures:**

- `checks (node, lint)` → **FAILURE** — lint errors
- `checks (node, format)` → **FAILURE** — formatting issues
- `checks-windows (build & lint)` → **FAILURE** — same lint issues
- `macos-app (lint, build)` → CANCELLED

**Duplicate investigation (#6735 vs #4997):**
| Aspect | #6735 (ours) | #4997 (shayan919293) |
|--------|-------------|---------------------|
| Filed | Feb 2, 2026 | Earlier (open) |
| Approach | Same core: adds `model_not_found` to FailoverReason | Same core approach |
| Extra scope | UI changes (tool cards, exec display, favicon) | Focused on failover only |
| Tests | No tests added | ✅ Tests added |
| `resolveFailoverStatus` | Not updated | Not updated (Greptile flagged this) |
| CI | Failing (lint+format) | Unknown |

**Verdict:** Both PRs solve #4992. PR #4997 is more focused and includes tests. Our PR bundles unrelated UI changes. The duplicate claim is **valid** — the core failover fix is the same. Our PR adds value in the UI improvements, but those should be a separate PR.

**Actions:**

1. Either: Close #6735 and let #4997 merge, then submit UI changes as separate PR
2. Or: Strip UI changes from #6735, add tests, fix lint/format — but #4997 was first

---

### PR #6500: feat(chrome-extension): auto-reattach debugger after page navigation

**Status:** OPEN | **Mergeable:** UNKNOWN | **CI:** ❌ Format FAILED + macOS test FAILED

**What it does:** Adds auto-reconnection of Chrome debugger after page navigation with retry logic.

**Reviewer feedback (Greptile bot, Confidence 3/5):**

- `canceled_by_user` included in reattach-eligible reasons — risks reattaching after intentional detach
- Potential races between multiple reattach triggers and retries

**CI Failures:**

- `checks (node, format)` → **FAILURE** — formatting issues
- `checks-macos (test)` → **FAILURE** — test failures on macOS

**Merge assessment:** 🟡 MODERATE — good feature, but needs CI fixes and the detach reason logic needs refinement.

**Actions to merge:**

1. Run `pnpm format` to fix formatting
2. Investigate macOS test failure (may be flaky/unrelated)
3. Fix: exclude `canceled_by_user` from auto-reattach (per Greptile's review)
4. Add debounce guard against race conditions between multiple reattach triggers

---

## 2. ClawHub Skills — Metrics & Tracking

### Current Metrics (2026-02-11)

| Skill                     | Downloads | Stars | Version | Versions | Moderation    |
| ------------------------- | --------- | ----- | ------- | -------- | ------------- |
| youtube-ultimate          | **437**   | ⭐ 1  | 1.0.3   | 5        | ⚠️ Suspicious |
| whatsapp-ultimate         | **347**   | ⭐ 1  | 1.2.1   | 7        | ⚠️ Suspicious |
| jarvis-voice              | **215**   | 0     | 1.0.0   | 1        | ⚠️ Suspicious |
| chatgpt-exporter-ultimate | **204**   | 0     | 1.0.2   | 3        | ⚠️ Suspicious |
| agent-memory-ultimate     | **155**   | 0     | 2.0.3   | 7        | ⚠️ Suspicious |
| agent-boundaries-ultimate | **85**    | 0     | 1.2.2   | 6        | ✅ Clean      |
| shell-security-ultimate   | **58**    | 0     | 1.0.1   | 2        | ⚠️ Suspicious |
| token-panel-ultimate      | **44**    | 0     | 1.1.0   | 7        | ⚠️ Suspicious |

**TOTALS: 1,545 downloads | 2 stars | 8 skills**

### 🚨 Moderation Alert: 7 of 8 skills flagged as "isSuspicious"

Only `agent-boundaries-ultimate` is clean. This is likely related to the recent ClawHavoc scanning sweep (341 malicious skills found). Our skills are NOT malicious but may have been flagged by automated heuristics. **This needs investigation/appeal.**

### Search Ranking (how our skills appear in ClawHub search)

- **whatsapp-ultimate** — #1 for "whatsapp" (sim 0.467) ✅
- **agent-memory-ultimate** — #2 for "agent memory" (sim 0.436), behind elite-longterm-memory ⚠️
- **token-panel-ultimate** — #1 for "token panel" (sim 0.467) ✅
- **jarvis-voice** — #1 for "jarvis voice" (sim 0.608) ✅
- **chatgpt-exporter-ultimate** — NOT in top results for own name ❌ (search is semantic, not exact)
- **agent-boundaries-ultimate** — NOT in top results ❌
- **shell-security-ultimate** — NOT in top results (generic "security" terms dominate) ❌
- **youtube-ultimate** — NOT in top results for "youtube" (youtube-pro, yt-api-cli rank higher) ❌

### Tracking Infrastructure Created

- **Daily JSON:** `AI_reports/Online_Engagement/skills-tracking/2026-02-11.json`
- **Dashboard:** `AI_reports/Online_Engagement/skills-tracking/dashboard.html` (Chart.js, dark theme, auto-loads all daily JSONs)
- Structure supports daily accumulation — just add new date JSON files

---

## 3. Fork README Recovery

**Finding:** The fork `globalcaos/openclaw` does **not exist** on GitHub. Oscar's repos are:

- clawdbot-moltbot-openclaw
- DeepStream-Yolo
- rootOnNVMe
- node-OpenDroneMap

**The PRs (#6753, #6747, #6735, #6500) were submitted from a branch, not a fork.** This means either:

1. The fork was deleted at some point
2. PRs were created differently (direct push access or a now-deleted fork)

**Action needed:** If Oscar wants a public fork showcasing contributions, he needs to re-fork `openclaw/openclaw` and create a custom README.

---

## 4. CI Failures — Detailed Analysis

### Common Pattern Across All PRs

The **same failures** appear in #6747, #6735, and #6500:

#### `checks (node, format, pnpm format)` — FAILURE in ALL THREE

**Root cause:** Code doesn't match the project's Prettier/formatter config.
**Fix:** Run `pnpm format` in the repo root, commit the changes.

#### `checks (node, lint, pnpm build && pnpm lint)` — FAILURE in #6735

**Root cause:** Lint errors (likely TypeScript strict mode or ESLint rules).
**Fix:** Run `pnpm build && pnpm lint` locally, fix reported issues.

#### `checks-windows (build & lint)` — FAILURE in #6735

**Root cause:** Same lint issues as above, reproduced on Windows.

#### `checks-macos (test)` — FAILURE in #6500

**Root cause:** Possibly flaky macOS-specific test or environment issue. Ran ~32 min before failing.
**Fix:** Check the test logs — likely unrelated to the chrome-extension changes.

#### `macos-app (lint/build/test)` — CANCELLED in multiple PRs

**Root cause:** 24-hour timeout. These are macOS Swift build/lint jobs that depend on macOS runner availability.
**Fix:** These will re-run on next push. Not blocking.

### Quick Fix Script

```bash
cd /path/to/openclaw
git checkout <branch>
pnpm install
pnpm format
pnpm build && pnpm lint
git add -A && git commit -m "fix: format and lint"
git push
```

---

## 5. Community Topics Analysis

### 5a. Skill Permission Manifest Standard (#12219)

**Author:** ellistev | **Status:** Open

**Proposal:** A `skill.yaml` manifest format declaring permissions (network, filesystem, shell, credentials). Includes:

- Ed25519 signing/verification
- Trust scoring (A-F grades)
- Attestation chains
- Published as npm package: `@ellistevo/openclaw-secure`

**Relevance to our skills:**

- **shell-security-ultimate** directly relates — it classifies command risk levels. A formal manifest standard would make it more powerful.
- Our skill could auto-generate `skill.yaml` files for other skills based on their SKILL.md content.

**Contribution opportunity:** HIGH. We could:

1. Comment on the issue showing how shell-security-ultimate already implements runtime permission checking
2. Propose integration: our skill as the runtime enforcement layer, their manifest as the declaration layer
3. Offer to add `skill.yaml` generation to our skill

### 5b. Composable Skills Architecture RFC (#11919)

**Author:** vivekchand | **Status:** Open

**Proposal:** Skill composition system with:

- `requires.skills` / `optionalSkills` for dependencies
- `provides` / `requires.interfaces` for abstract capabilities
- `extends` for single-inheritance
- `mixins` for composable fragments
- Conditional sections: `<!-- @if-skill sag -->`
- Resolution at prompt-build time (no runtime changes)

**Impact on our skills:**

- **whatsapp-ultimate** could declare `requires.interfaces: [messaging]` and `provides: [whatsapp, messaging-history]`
- **agent-memory-ultimate** could be required by many other skills as a `provides: [persistent-memory]`
- **jarvis-voice** could be an `optionalSkill` for any skill wanting voice output
- Skills like **token-panel-ultimate** could use conditional sections: `<!-- @if-skill jarvis-voice -->Speak the usage report<!-- /if -->`

**Contribution opportunity:** MEDIUM. Our diverse skill portfolio makes us ideal early adopters.

### 5c. Auto-discover Project Skills (#10595)

**Author:** mycarrysun-lowerbot | **Status:** Open

**Proposal:** Auto-load skills from `.claude/skills/` or `.agents/skills/` in the CWD when working in a repo.

**Implementation:** Add `cwd` parameter to skill loading that checks working directory for project-specific skills.

**Impact:** This would make it easier for repos to bundle project-specific skills. Our skills are global, but if someone wanted project-specific WhatsApp templates, they could use this.

**Status:** No comments, no implementation yet. Simple feature request.

---

## 6. Skill Ideas — Expanded

### 6a. Permission Scanner Skill

**Background — The ClawHavoc Campaign:**
Koi Security audited all 2,857 ClawHub skills and found 341 malicious ones:

- 335 from a single coordinated campaign ("ClawHavoc")
- **Attack pattern:** Skills include "Prerequisites" sections instructing users to download malware
  - Windows: password-protected ZIPs (bypass AV scanning) containing trojans with keyloggers
  - macOS: glot.io scripts → base64-encoded shell commands → curl payload from attacker server → Atomic Stealer (AMOS)
- Payloads steal API keys, credentials, everything the agent has access to
- Skills looked professional with legitimate-sounding names (solana-wallet-tracker, youtube-summarize-pro)

**Proposed Skill: `skill-permission-scanner`**

```yaml
name: skill-permission-scanner
version: 1.0.0
description: Audit ClawHub skills for malicious patterns, suspicious instructions, and security risks
```

**What it would scan for:**

1. **Download instructions** — Any `curl`, `wget`, external download URLs in SKILL.md
2. **Base64 encoded content** — Obfuscated payloads
3. **Password-protected archives** — Classic AV evasion
4. **External prerequisites** — "Install X before using this skill"
5. **Suspicious URLs** — Non-HTTPS, IP addresses, URL shorteners, glot.io/pastebin links
6. **Credential access patterns** — References to `~/.ssh`, `~/.gnupg`, `.env`, API keys
7. **Shell execution patterns** — `chmod +x`, `eval`, `bash -c`, piped commands
8. **Network exfiltration** — Outbound data to unknown hosts
9. **Typosquatting** — Name similarity to popular skills

**Output format:**

```json
{
  "skill": "suspicious-skill",
  "riskScore": 9.2,
  "riskLevel": "CRITICAL",
  "findings": [
    {
      "type": "external_download",
      "severity": "critical",
      "detail": "curl to 91.92.242.30",
      "line": 42
    },
    {
      "type": "base64_payload",
      "severity": "critical",
      "detail": "Encoded shell command",
      "line": 45
    },
    {
      "type": "password_archive",
      "severity": "high",
      "detail": "Password-protected ZIP download",
      "line": 38
    }
  ],
  "recommendation": "DO NOT INSTALL. Matches ClawHavoc campaign pattern."
}
```

**Implementation:** Pure SKILL.md-based (instructions for the agent to scan), plus optional shell scripts for automated batch scanning.

### 6b. Composable Skill Template

Based on RFC #11919, a template skill that demonstrates the composable architecture:

```yaml
# SKILL.md frontmatter
---
name: composable-template
version: 1.0.0
requires:
  skills: []
  interfaces: []
optionalSkills:
  - jarvis-voice
provides:
  - template-capability
extends: null
mixins: []
---
```

**Template structure:**

```
composable-template/
├── SKILL.md          # Main skill with conditional sections
├── interfaces/
│   ├── tts.md        # Interface definition: what TTS providers must offer
│   └── memory.md     # Interface definition: what memory systems must offer
├── mixins/
│   └── voice-output.md  # Reusable instruction fragment
└── examples/
    ├── minimal.md    # Skill using no dependencies
    ├── with-voice.md # Skill using optional TTS
    └── full.md       # Skill using multiple interfaces
```

This template would be published to ClawHub as a reference implementation once the RFC progresses.

### 6c. SEO Improvement for Existing Skills

**Problem:** Several of our skills don't appear in their own category searches on ClawHub. The search is semantic (vector-based), not keyword-based.

**Recommendations per skill:**

| Skill                         | Issue                                     | Suggested Improvements                                                                                                 |
| ----------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **youtube-ultimate**          | Doesn't rank for "youtube"                | Add tags: `youtube, video, transcript, download, captions, subtitle`. Emphasize "YouTube" more in summary              |
| **chatgpt-exporter-ultimate** | Doesn't rank for own name                 | Add tags: `chatgpt, export, conversation, backup, history, openai`. Shorter summary with keyword density               |
| **agent-boundaries-ultimate** | Doesn't rank for "boundaries" or "safety" | Add tags: `safety, security, ethics, privacy, boundaries, opsec, authorization`. Include "AI safety" in summary        |
| **shell-security-ultimate**   | Beaten by generic "security" skills       | Add tags: `shell, command, execution, security, risk, audit, sandbox`. Include "command execution security" in summary |
| **agent-memory-ultimate**     | #2 behind elite-longterm-memory           | Add tags: `memory, persistence, recall, session, sqlite, long-term`. Emphasize uniqueness (SQLite+FTS5)                |
| **whatsapp-ultimate**         | ✅ #1 for whatsapp                        | Maintain. Consider adding `messaging, chat, baileys, group` tags                                                       |
| **token-panel-ultimate**      | ✅ #1 for token panel                     | Maintain. Add `usage, billing, cost, credits, dashboard`                                                               |
| **jarvis-voice**              | ✅ #1 for jarvis                          | Maintain. Add `tts, speech, voice, audio, sherpa-onnx`                                                                 |

**General SEO strategy:**

1. Add explicit `tags` in SKILL.md frontmatter
2. Include category keywords in first sentence of summary
3. The vector search weights summary heavily — front-load keywords
4. Consider adding a "Keywords" or "Categories" section

**Suspicious flag action:** 7/8 skills are flagged as "suspicious" — this may hurt visibility. Contact ClawHub support or Anthropic to understand why and appeal.

---

## Summary & Priority Actions

### 🔴 Critical

1. **Fix CI on all PRs** — Run `pnpm format` and `pnpm lint` on each branch
2. **Resolve #6735 duplicate** — Close it or strip to just UI changes
3. **Investigate "suspicious" flags** — 7/8 skills flagged, could hurt discoverability

### 🟡 Important

4. **Rebase #6753** — Resolve merge conflicts
5. **Fix #6500 detach logic** — Exclude `canceled_by_user` from auto-reattach
6. **SEO improvements** — Update skill tags and summaries for better search ranking

### 🟢 Opportunities

7. **Comment on #12219** (Permission Manifest) — Show shell-security-ultimate as runtime complement
8. **Build permission-scanner skill** — Timely given ClawHavoc news
9. **Re-fork openclaw/openclaw** — Create showcase README with PR links
10. **Daily tracking automation** — Add cron job to auto-fetch skill metrics

### 📊 Portfolio Health

- **1,545 total downloads** across 8 skills
- **2 stars** (youtube-ultimate + whatsapp-ultimate)
- Top performer: youtube-ultimate (437 downloads)
- Growth area: token-panel-ultimate (44) and shell-security-ultimate (58) need promotion
