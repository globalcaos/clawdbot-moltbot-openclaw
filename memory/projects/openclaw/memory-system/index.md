# Sprint: Memory System

*Improving how JarvisOne remembers and recalls information.*

**📖 See also:** [architecture.md](./architecture.md) — Full memory architecture diagram

---

## Goal

Build a robust, searchable, structured memory that persists across sessions.

## Improvements

| Improvement | Description | Status |
|-------------|-------------|--------|
| [entity-pages](./entity-pages/) | Structured profiles in `bank/entities/` | ✅ Closed |
| [session-indexing](./session-indexing/) | Past conversations searchable | ✅ Closed |
| [hybrid-search](./hybrid-search/) | 70% vector + 30% keyword | ✅ Closed |
| [project-folders](./project-folders/) | Project-based memory organization | ✅ Closed |

## Timeline

- **2026-02-03:** Letta/MemGPT research, entity pages concept
- **2026-02-03:** Session indexing enabled in config
- **2026-02-04:** Project-based memory organization

## Key Insights

- Daily logs are raw notes; MEMORY.md is curated wisdom
- Entity pages prevent information scatter
- Opinion tracking with confidence scores enables belief revision

## Open Questions

- How often should memory consolidation run?
- Should opinions auto-decay without reinforcement?

---

*Last updated: 2026-02-04*
