# Message Bubbles Removal

*Removing decorative boxes from webchat messages.*

---

## Status
✅ Closed (2026-02-02)

## What Was Done

Removed all decorative bubbles and boxes from the webchat interface.

### Files Modified
- `ui/src/ui/chat/grouped-render.ts` — Removed avatar icons, name labels
- `ui/src/styles/components.css` — Transparent backgrounds, minimal borders

### Before
- Messages wrapped in colored boxes
- Robot face / gear icons for different roles
- "JarvisOne" name labels on every message
- Timestamps visible on every message

### After
- Clean, transparent message display
- Role obvious from position (left = assistant, right = user)
- No redundant labels
- Timestamps removed (not actionable information)

## Oscar's Principle

> "Every UI element should add information. If position shows role, don't repeat it."

---

*Completed: 2026-02-02*
*Commit: 9553e70dc*
