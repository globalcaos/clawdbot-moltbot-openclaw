# Sprint: UI Improvements

*Making the webchat interface cleaner and more information-dense.*

**📖 See also:** [philosophy.md](./philosophy.md) — Principles governing all UI work

---

## Goal

Every element must earn its screen space. No decorative fluff.

## Oscar's Preferences (learned 2026-02-02)

- No decorative boxes/bubbles around messages
- No redundant labels (if context shows role, don't repeat it)
- Compact one-liners over multi-line displays
- Tool output: `🟢 ✓ command │ LEVEL │ description`

## Improvements

| Improvement | Description | Status |
|-------------|-------------|--------|
| [message-bubbles](./message-bubbles/) | Removed decorative bubbles | ✅ Closed |
| [compact-tool-display](./compact-tool-display/) | One-liner format for tool output | ✅ Closed |
| [security-indicators](./security-indicators/) | 🟢🔵🟡🟠🔴 level badges | ✅ Closed |

## Ideas / Backlog

| Idea | Description | Status |
|------|-------------|--------|
| Collapsible sections | Fold/unfold tool output | 🟡 Open |
| Syntax highlighting | Code block coloring | 🟡 Open |
| Hover timestamps | Show time only on hover | 🟡 Open |

---

*Last updated: 2026-02-04*
