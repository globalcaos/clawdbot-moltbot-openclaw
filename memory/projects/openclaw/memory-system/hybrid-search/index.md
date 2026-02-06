# Hybrid Search

*Combining vector similarity with keyword matching.*

---

## Status
✅ Closed (2026-02-03)

## What Was Done

Enabled hybrid search mode in OpenClaw config.

### Config Change
```yaml
memorySearch:
  query:
    hybrid:
      enabled: true
      # Default weights: 70% vector, 30% keyword
```

### How It Works
- **Vector search (70%):** Semantic similarity via embeddings
- **Keyword search (30%):** BM25 text matching
- Combined scoring improves recall for both conceptual and literal queries

## Why

- **Vector alone:** Misses exact terms, acronyms, code
- **Keyword alone:** Misses semantic similarity
- **Hybrid:** Best of both worlds

## Technical Details

OpenClaw's LanceDB store supports:
- Embedding cache (50k entries max)
- SQLite-vec acceleration
- BM25 + vector hybrid scoring

---

*Completed: 2026-02-03*
