# Compact Tool Display

*One-liner format for tool execution output.*

---

## Status
✅ Closed (2026-02-02)

## What Was Done

Redesigned tool output cards to use compact one-liner format.

### Files Modified
- `ui/src/ui/chat/tool-cards.ts` — New compact renderer with security classification

### Format
```
🟢 ✓ whoami │ SAFE │ Read-only information gathering
🟡 ✓ pip install │ MEDIUM │ Installing dependencies
```

Components:
- **Color emoji:** Security level indicator
- **Status:** ✓ success, ✗ error
- **Command:** What was run
- **Level:** SAFE/LOW/MEDIUM/HIGH/CRITICAL
- **Purpose:** Contextual explanation (added later)

### Before
- Multi-line cards with headers
- Verbose descriptions
- Visual noise

### After
- Single line per command
- All information at a glance
- Scannable execution history

## Purpose Parameter (added same day)

Added `purpose` parameter to exec tool for contextual explanations:
- Before: `🟢 ✓ git status │ SAFE │ Read-only information gathering`
- After: `🟢 ✓ git status │ SAFE │ Checking which files changed`

---

*Completed: 2026-02-02*
*Commit: 9553e70dc, b9aaad2ed*
