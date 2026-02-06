# Code Enforcement

*Enforcing security rules via backend plugin, not just UI.*

---

## Status
✅ Closed (2026-02-02)

## What Was Done

Created backend plugin that enforces security classifications server-side.

### Files Created
- `.openclaw/extensions/exec-display/index.ts` — Backend enforcement plugin

### How It Works
1. Agent requests command execution
2. Plugin intercepts request
3. Classifies command against database
4. Compares to user's max allowed level
5. Blocks or warns based on policy

### Key Principle

> **"Code enforcement > documentation"** — Rules I might forget need hooks/plugins.

From Oscar's pallet-scan project:
> "If you can enforce it with code, don't rely on documentation."

### Why This Matters
- Documentation can be ignored or forgotten
- UI can be bypassed
- Backend enforcement is authoritative
- AI cannot fake security levels

### Layers
1. **Hard rules (database)** — Immutable, human-curated
2. **Heuristics (AI)** — For unknown commands
3. **User control (settings)** — Configurable threshold

---

*Completed: 2026-02-02*
