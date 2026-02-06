# Security Philosophy

*Principles governing all security work.*

---

## Core Principle

> **Code enforcement > documentation.**

Rules I might forget need hooks and plugins, not just markdown files.

---

## The Three Layers

| Layer | What | Who Controls |
|-------|------|--------------|
| **Hard rules** | Command pattern database | Human-curated, immutable |
| **Heuristics** | AI classification of unknown commands | AI judgment |
| **User control** | Max allowed security level | User setting |

---

## Security Level Definitions

| Level | Emoji | Examples | Default Action |
|-------|-------|----------|----------------|
| SAFE | 🟢 | `cat`, `ls`, `grep`, `pwd` | Auto-allow |
| LOW | 🔵 | Project file edits, `git status` | Auto-allow |
| MEDIUM | 🟡 | `pip install`, `npm install`, configs | Warn |
| HIGH | 🟠 | `sudo`, `git push`, `chmod` | Ask |
| CRITICAL | 🔴 | `rm -rf`, `dd`, `mkfs` | Block |

---

## Why Backend Enforcement?

- Documentation can be ignored
- UI can be bypassed
- AI can "forget" rules mid-session
- Only code enforcement is authoritative

The security classification plugin intercepts commands server-side. I cannot fake my own security levels.

---

## Human Stays in Control

Users can configure their risk tolerance:
- 🟢 Safe only — Maximum caution
- 🔵 Up to Low — Minimal trust
- 🟡 Up to Medium — Balanced (default)
- 🟠 Up to High — High trust
- 🔴 All — No blocking (power user)

---

## Pattern Matching Notes

- Exact matches take priority
- Word boundaries matter (`dd` shouldn't match `git add`)
- Arguments affect classification (`rm` vs `rm -rf`)
- Unknown commands default to MEDIUM for AI classification

---

*Applies to all security improvements in this folder.*
