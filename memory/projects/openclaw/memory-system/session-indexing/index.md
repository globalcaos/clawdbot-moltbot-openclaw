# Session Indexing

*Making past conversations searchable.*

---

## Status
✅ Closed (2026-02-03)

## What Was Done

Enabled experimental session transcript indexing in OpenClaw config.

### Config Change
```yaml
memorySearch:
  sources: ["memory", "sessions"]
  experimental:
    sessionMemory: true
```

### How It Works
- Session transcripts are stored in OpenClaw's memory system
- Enabled indexing allows semantic search across past conversations
- Combined with `extraPaths: ["bank"]` for full coverage

## Why

- **Before:** Past conversations existed but weren't searchable
- **After:** Can query "what did we discuss about X last week?"
- **Benefit:** Continuity across sessions

## Caveats

- Marked as experimental in OpenClaw
- Requires embeddings API (hit quota issues 2026-02-04)

---

*Completed: 2026-02-03*
