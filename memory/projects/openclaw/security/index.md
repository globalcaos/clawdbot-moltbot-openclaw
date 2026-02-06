# Sprint: Security

*Ensuring safe command execution with human oversight.*

**📖 See also:** [philosophy.md](./philosophy.md) — Security principles and level definitions

---

## Goal

Layered security: hard rules + heuristics + user control.

## Key Principle

**Code enforcement > documentation** — Rules I might forget need hooks/plugins.

## Improvements

| Improvement | Description | Status |
|-------------|-------------|--------|
| [security-levels](./security-levels/) | 🟢→🔴 classification system | ✅ Closed |
| [code-enforcement](./code-enforcement/) | Backend plugin enforcement | ✅ Closed |

## Security Level Definitions

| Level | Examples | Behavior |
|-------|----------|----------|
| 🟢 SAFE | `cat`, `ls`, `grep` | Auto-approved |
| 🔵 LOW | Project file edits | Auto-approved |
| 🟡 MEDIUM | `pip install`, configs | Ask first |
| 🟠 HIGH | `sudo`, `git push` | Explicit approval |
| 🔴 CRITICAL | `rm -rf`, data loss | Strong warning |

---

*Last updated: 2026-02-04*
