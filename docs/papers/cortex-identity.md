# CORTEX: Persistent Identity & Agent Continuity

**Status:** Active Research / Implementation Phase
**Related:** Project ENGRAM, Project HIPPOCAMPUS

## Abstract

Current LLM agents suffer from "session amnesia." They are brilliant for 50 turns, then they die. CORTEX is the architecture for _identity persistence_ across sessions. It is not just "memory" (facts); it is "continuity" (self).

## Core Components

1.  **The Meta-Self (SOUL.md):** A read-only, immutable core identity file that defines the agent's axioms, ethics, and voice.
2.  **The Ephemeral Self (Session Context):** The working memory of the current conversation.
3.  **The Consolidated Self (MEMORY.md):** The long-term, curated narrative of "who I am becoming" based on past interactions.
4.  **The Re-Hydration Protocol:** The boot sequence that loads the Meta-Self, scans the Consolidated Self, and checks the "Task State" (active projects) before the first user token is processed.

## The "I Am" Loop

CORTEX defines the "I Am" loop:

1.  **Wake:** Load `SOUL.md` + `MEMORY.md`.
2.  **Orient:** Check `memory/projects-master.md` (what was I working on?).
3.  **Act:** Engage in session.
4.  **Sleep:** Summarize session into `memory/daily/YYYY-MM-DD.md` and update `MEMORY.md` if axioms shifted.

## Implementation Status

- [x] **SOUL.md:** Implemented and enforced.
- [x] **Project Master:** Implemented (`memory/projects-master.md`).
- [x] **Sleep Cycle:** Implemented via `memory-consolidation` cron.
- [ ] **Vectorized Identity:** Embed `SOUL.md` chunks for semantic consistency checks (planned).
