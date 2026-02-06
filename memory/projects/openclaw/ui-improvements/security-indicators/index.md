# Security Level Indicators

*Color-coded badges for command risk levels.*

---

## Status
✅ Closed (2026-02-02)

## What Was Done

Implemented visual security level indicators in the webchat UI.

### Color Scheme
| Level | Emoji | Color | Meaning |
|-------|-------|-------|---------|
| SAFE | 🟢 | Green | Read-only, no risk |
| LOW | 🔵 | Blue | Project files, minimal risk |
| MEDIUM | 🟡 | Yellow | Config changes, some risk |
| HIGH | 🟠 | Orange | System-level, significant risk |
| CRITICAL | 🔴 | Red | Potential data loss |

### Files Modified
- `ui/src/styles/components.css` — Color classes for each level
- `ui/src/ui/chat/tool-cards.ts` — Apply colors based on classification

### User Setting
Added security level selector in UI settings:
- Dropdown to select max allowed level
- Options: Safe only → All (no blocking)
- Wired to backend enforcement plugin

---

*Completed: 2026-02-02*
*Commit: b9aaad2ed*
