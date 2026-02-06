# UI Philosophy

*Principles governing all UI improvements.*

---

## Core Principle

> **Every element must earn its screen space.**

If something doesn't add information value, remove it.

---

## Oscar's Preferences (learned 2026-02-02)

| Preference | Rationale |
|------------|-----------|
| No decorative boxes/bubbles | Visual noise, no information value |
| No redundant labels | If position shows role, don't repeat it |
| Compact one-liners | Scannable > verbose |
| Information density | More data per pixel |

---

## Design Decisions

### What We Removed
- Avatar icons (robot face, gear) — Role obvious from position
- Name labels ("JarvisOne") — Redundant with avatar
- Timestamps on every message — Not actionable
- Colored bubble backgrounds — Decorative, not informative

### What We Added
- Security level colors — Actionable information
- Compact tool format — More info, less space
- Purpose parameter — Context for commands

---

## Format Standards

### Tool Execution Display
```
🟢 ✓ command │ LEVEL │ purpose/description
```

Components:
- **Color emoji** — Security level (🟢🔵🟡🟠🔴)
- **Status** — ✓ success, ✗ error
- **Command** — What was executed
- **Level** — SAFE/LOW/MEDIUM/HIGH/CRITICAL
- **Purpose** — Why it was run

### Voice Transcripts
```html
**Jarvis:** <span class="jarvis-voice">spoken text</span>
```
Purple italic styling, distinct from regular text.

---

## Anti-Patterns

❌ Boxes around everything
❌ Icons that repeat what text says
❌ Timestamps nobody reads
❌ Multi-line where one-line works
❌ Decorative > functional

---

*Applies to all improvements in this folder.*
