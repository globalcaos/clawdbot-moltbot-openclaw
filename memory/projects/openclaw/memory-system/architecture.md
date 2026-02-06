# Memory Architecture

*How JarvisOne's memory system is structured.*

---

## Inspired By

- **Letta (MemGPT)** — Core memory + archival memory distinction
- **Human memory** — Working memory, long-term memory, episodic vs semantic

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MEMORY SYSTEM                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Daily     │  │   Entity    │  │    Typed        │ │
│  │   Logs      │  │   Pages     │  │    Memory       │ │
│  │             │  │             │  │                 │ │
│  │ YYYY-MM-DD  │  │ bank/       │  │ world.md        │ │
│  │   .md       │  │ entities/   │  │ experience.md   │ │
│  │             │  │             │  │ opinions.md     │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│        │                │                   │          │
│        └────────────────┼───────────────────┘          │
│                         ▼                              │
│              ┌─────────────────────┐                   │
│              │   Project Memory    │                   │
│              │                     │                   │
│              │  memory/projects/   │                   │
│              │   ├── openclaw/     │                   │
│              │   ├── inventions/   │                   │
│              │   └── ...           │                   │
│              └─────────────────────┘                   │
│                         │                              │
│                         ▼                              │
│              ┌─────────────────────┐                   │
│              │   Search Layer      │                   │
│              │                     │                   │
│              │  70% vector         │                   │
│              │  30% keyword        │                   │
│              │  + session index    │                   │
│              └─────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Memory Types

| Type | Location | Purpose |
|------|----------|---------|
| **Daily logs** | `memory/YYYY-MM-DD.md` | Raw session notes, chronological |
| **Entity pages** | `bank/entities/` | Profiles of people, projects |
| **World facts** | `bank/world.md` | Objective knowledge |
| **Experience** | `bank/experience.md` | What I've done |
| **Opinions** | `bank/opinions.md` | Beliefs with confidence scores |
| **Project memory** | `memory/projects/` | Project-centric context |
| **Long-term** | `MEMORY.md` | Curated summary, gateway |

---

## Search Configuration

```yaml
memorySearch:
  sources: ["memory", "sessions"]
  extraPaths: ["bank"]
  experimental:
    sessionMemory: true  # Index past conversations
  query:
    hybrid:
      enabled: true      # 70% vector + 30% keyword
```

---

## Consolidation Flow

```
Daily logs → Review → Extract patterns → Update:
                                         ├── Entity pages (people facts)
                                         ├── Project folders (project context)
                                         ├── Opinions (beliefs learned)
                                         └── MEMORY.md (curated summary)
```

---

## Key Insight

> **Daily logs are raw notes; structured memory is curated wisdom.**

Don't just accumulate — consolidate and organize.

---

*Applies to all memory system improvements in this folder.*
