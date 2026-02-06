# Security Level Classification

*Categorizing commands by risk level.*

---

## Status
✅ Closed (2026-02-02)

## What Was Done

Created comprehensive command classification database.

### Files Created
- `.openclaw/extensions/exec-display/command-patterns.json` — 100+ hardcoded commands

### Classification Logic

**Level Definitions:**
| Level | Action | Examples |
|-------|--------|----------|
| 🟢 SAFE | Auto-allow | `cat`, `ls`, `grep`, `pwd`, `whoami` |
| 🔵 LOW | Auto-allow | Project file edits, `git status` |
| 🟡 MEDIUM | Warn | `pip install`, `npm install`, config changes |
| 🟠 HIGH | Ask | `sudo`, `git push`, `chmod` |
| 🔴 CRITICAL | Block | `rm -rf`, `dd`, `mkfs`, data destruction |

### Pattern Matching
Commands matched against patterns:
- Exact matches (e.g., `rm -rf`)
- Prefix matches (e.g., `sudo *`)
- Argument analysis (e.g., `rm` without `-rf` is lower risk)

### Bug Fixed
`dd` pattern was matching "add" in "git add" — fixed with word boundary matching.

---

*Completed: 2026-02-02*
