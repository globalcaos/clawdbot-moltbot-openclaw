# Memory System Architecture

**Upgraded: 2026-02-03**
**Inspiration:** Letta/MemGPT

---

## Architecture

- **Entity pages** in `bank/entities/` — structured profiles for people, projects
- **Typed memory** in `bank/` — world facts, experiences, opinions
- **Opinion tracking** with confidence scores (0.0-1.0) and evidence links
- **Session indexing** enabled — my past conversations are now searchable
- **Hybrid search** — 70% vector similarity + 30% keyword matching

## Config Enabled

```json
"memorySearch": {
  "sources": ["memory", "sessions"],
  "extraPaths": ["bank"],
  "experimental": { "sessionMemory": true },
  "query": { "hybrid": { "enabled": true } }
}
```

## File Structure

```
workspace/
├── MEMORY.md          # Gateway/index (principles)
├── SOUL.md            # Who I am
├── AGENTS.md          # How I operate
├── USER.md            # About Oscar
├── TOOLS.md           # Implementation notes
├── bank/
│   ├── contacts.md    # Single source for contact info
│   ├── entities/      # People and project profiles
│   ├── opinions.md    # Beliefs with confidence
│   ├── world.md       # Objective facts
│   └── experience.md  # What I've done
└── memory/
    ├── YYYY-MM-DD.md  # Daily logs
    ├── knowledge/     # Learned principles (NEW)
    └── projects/      # Project-specific memory
```

## Principles (2026-02-06)

**Consolidation over distribution. Proximity over sprawl.**
- Single source of truth + pointers
- Short focused files > lengthy ones
- **Never delete, only reorganize** — memory is soul

**Structure follows use.**
- Organize by retrieval intent, not arbitrary taxonomy
- Ask: "How will I need this information?"
- Iterate: discover better patterns through actual use
- Watch for: can't find things, duplicate writes, awkward retrieval

*"Imagine how such information will be used and so it should be grouped or groupable independently of other uses."* — Oscar
