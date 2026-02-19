# HIPPOCAMPUS Implementation Plan

**Goal:** Production-ready HIPPOCAMPUS system for OpenClaw, implementing the architecture described in the paper (v5).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    HIPPOCAMPUS                        │
│                                                       │
│  ┌──────────────┐    ┌──────────────┐                │
│  │  Nightly      │    │  Real-Time    │                │
│  │  Index Build  │    │  Incremental  │                │
│  │  (semantic    │    │  Update       │                │
│  │   tier)       │    │  (episodic    │                │
│  │              │    │   tier)       │                │
│  └──────┬───────┘    └──────┬───────┘                │
│         │                    │                        │
│         ▼                    ▼                        │
│  ┌──────────────────────────────────┐                │
│  │     hippocampus-index.json       │                │
│  │  anchor → [{path, score, src}]   │                │
│  └──────────────┬───────────────────┘                │
│                  │                                    │
│                  ▼                                    │
│  ┌──────────────────────────────────┐                │
│  │     Inference-Time Lookup        │                │
│  │  1. Lexical anchor detection     │                │
│  │  2. Semantic anchor expansion    │                │
│  │  3. Candidate merge + dedup      │                │
│  │  4. Post-retrieval re-ranking    │                │
│  └──────────────────────────────────┘                │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
scripts/hippocampus/
├── build-index.py          # Nightly full rebuild (semantic tier)
├── incremental-update.py   # Real-time episodic tier update
├── lookup.py               # Inference-time retrieval
├── rerank.py               # Post-retrieval re-ranking
├── embed.py                # Embedding helper (local or API)
├── config.py               # Hyperparameters + defaults
├── test_hippocampus.py     # Unit + integration tests
└── benchmark.py            # CORF benchmark runner (ablations)

memory/
├── hippocampus-index.json  # The index (anchor → chunk lists)
├── hippocampus-embeds.npz  # Cached anchor embeddings (numpy)
└── hippocampus-meta.json   # Build metadata (timestamp, stats)
```

---

## Module Specifications

### 1. `config.py` — Hyperparameters

```python
# Defaults from paper Section 4.9
K = 20              # Top-K chunks per anchor
THETA = 0.80        # Anchor→chunk inclusion threshold
SEM_THETA = 0.75    # Semantic anchor expansion threshold
K_MAX = 50          # Hard cap per-anchor list (real-time updates)
MAX_CHUNKS = 30     # Max chunks injected into context
EMBED_MODEL = "gemini"  # or "local" (sentence-transformers)
EMBED_DIM = 768
INDEX_PATH = "memory/hippocampus-index.json"
EMBEDS_PATH = "memory/hippocampus-embeds.npz"
META_PATH = "memory/hippocampus-meta.json"

# Sources to index
SOURCES = [
    "memory/",
    "memory/archive/chatgpt-import/",
    "bank/",
    "docs/papers/",
    "memory/projects/",
    "memory/knowledge/",
    "memory/work/",
]

# Denylist (never trigger retrieval)
ANCHOR_DENYLIST = []

# Source allowlist (prevent injection from untrusted sources)
SOURCE_ALLOWLIST = None  # None = all sources allowed
```

### 2. `embed.py` — Embedding Helper

```python
"""Unified embedding interface. Supports Gemini API and local models."""

import numpy as np
from functools import lru_cache

def embed(text: str, model: str = "gemini") -> np.ndarray:
    """Embed a single text string. Returns (EMBED_DIM,) array."""
    if model == "gemini":
        return _embed_gemini(text)
    elif model == "local":
        return _embed_local(text)

@lru_cache(maxsize=2000)
def embed_cached(text: str, model: str = "gemini") -> np.ndarray:
    """Cached embedding for anchors (called many times with same text)."""
    return embed(text, model)

def embed_batch(texts: list[str], model: str = "gemini") -> np.ndarray:
    """Batch embedding. Returns (N, EMBED_DIM) array."""
    # Gemini supports batch embedding natively
    # Local: sentence-transformers batch encode
    pass

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
```

### 3. `build-index.py` — Nightly Full Rebuild (Semantic Tier)

```python
"""
Nightly HIPPOCAMPUS index build.
Run via cron at 04:15 (or after memory consolidation).

Algorithm:
1. Scan all SOURCES for .md files
2. Chunk each file (split by ## headers or fixed-size)
3. Extract anchor vocabulary from chunk content
4. For each anchor, compute similarity to all chunks
5. Keep top-K chunks per anchor (score >= THETA)
6. Save index + embeddings atomically
"""

def build_index():
    # 1. Discover files
    files = discover_files(SOURCES)

    # 2. Chunk files
    chunks = []
    for f in files:
        chunks.extend(chunk_file(f))

    # 3. Extract anchor vocabulary
    # - Multi-word anchors from: section headers, bold terms, entity names
    # - Single-word anchors from: high-TF-IDF terms across corpus
    anchors = extract_anchors(chunks)

    # 4. Compute embeddings (batch for efficiency)
    anchor_embeds = embed_batch([a.text for a in anchors])
    chunk_embeds = embed_batch([c.text for c in chunks])

    # 5. Build similarity matrix (|V| × n) via matmul
    # similarity = anchor_embeds @ chunk_embeds.T  # (|V|, n)
    similarity = np.dot(anchor_embeds, chunk_embeds.T)

    # 6. For each anchor, keep top-K chunks above THETA
    index = {}
    for i, anchor in enumerate(anchors):
        scores = similarity[i]
        top_indices = np.argsort(scores)[::-1][:K]
        entries = []
        for idx in top_indices:
            if scores[idx] >= THETA:
                entries.append({
                    "path": chunks[idx].path,
                    "line": chunks[idx].start_line,
                    "score": round(float(scores[idx]), 4),
                    "source": chunks[idx].source,
                    "preview": chunks[idx].text[:100],
                })
        if entries:
            index[anchor.text] = entries

    # 7. Atomic save
    save_atomic(INDEX_PATH, index)
    np.savez(EMBEDS_PATH,
             anchor_texts=[a.text for a in anchors],
             anchor_embeds=anchor_embeds)
    save_atomic(META_PATH, {
        "built_at": datetime.utcnow().isoformat(),
        "n_anchors": len(index),
        "n_chunks": len(chunks),
        "n_files": len(files),
        "multi_word_anchors": sum(1 for a in index if ' ' in a),
    })

def extract_anchors(chunks):
    """Extract anchor vocabulary from corpus.

    Multi-word anchors (highest quality):
    - ## section headers
    - **bold terms**
    - Entity names from bank/entities/
    - Project names from projects-master.md

    Single-word anchors:
    - Top TF-IDF terms (exclude stopwords)
    - Minimum document frequency: 2
    """
    pass

def chunk_file(path):
    """Split a markdown file into chunks.

    Strategy:
    - Split on ## headers (each section = one chunk)
    - If section > 512 tokens, split at paragraph boundaries
    - Minimum chunk size: 50 tokens
    - Each chunk carries: path, start_line, source, text
    """
    pass
```

### 4. `incremental-update.py` — Real-Time Episodic Tier

```python
"""
Called whenever a new memory is stored (hook into mem.py store).
Updates the index incrementally without full rebuild.

Algorithm:
1. Load current index (from memory cache)
2. Chunk the new file/content
3. Embed new chunks
4. For each existing anchor, compute similarity to new chunks
5. If score >= THETA, insert into anchor's list (maintain sorted, cap at K_MAX)
6. Extract any new anchors from the content
7. For new anchors, scan existing chunk embeddings
8. Save index atomically
"""

def incremental_update(new_content: str, source_path: str):
    index = load_index_cached()
    anchor_embeds = load_anchor_embeds_cached()

    # Chunk and embed new content
    new_chunks = chunk_text(new_content, source_path)
    new_embeds = embed_batch([c.text for c in new_chunks])

    # Update existing anchors
    for anchor_text, anchor_embed in zip(index.keys(), anchor_embeds):
        for i, chunk in enumerate(new_chunks):
            score = cosine_similarity(anchor_embed, new_embeds[i])
            if score >= THETA:
                insert_sorted(index[anchor_text], {
                    "path": chunk.path,
                    "score": round(score, 4),
                    "source": chunk.source,
                    "preview": chunk.text[:100],
                }, cap=K_MAX)

    # Extract new anchors from content
    new_anchors = extract_anchors_from_text(new_content)
    # For new anchors, we'd need to scan all existing chunks
    # → Defer to nightly rebuild (new anchors are episodic-tier only)

    save_atomic(INDEX_PATH, index)
```

### 5. `lookup.py` — Inference-Time Retrieval

```python
"""
Core inference-time retrieval. Called on every user message.
Must be FAST: target <60ms p95.

Algorithm:
1. Tokenize user message
2. Lexical anchor detection (exact match)
3. Semantic anchor expansion (O(|V|) cosine similarity)
4. Pronoun expansion via project context
5. Merge candidate chunks from all matched anchors
6. Deduplicate by path
7. Re-rank candidates against user message
8. Return top max_chunks
"""

def lookup(user_message: str, project_anchors: list[str] = None) -> list[dict]:
    index = load_index_cached()

    # 1. Tokenize
    tokens = set(user_message.lower().split())
    phrases = extract_phrases(user_message)  # bigrams, trigrams

    # 2. Lexical anchor detection
    detected = [a for a in index if a in tokens or a in phrases]

    # 3. Semantic anchor expansion
    if SEM_THETA > 0:
        query_vec = embed(user_message)
        anchor_embeds = load_anchor_embeds_cached()
        for anchor_text, anchor_vec in anchor_embeds.items():
            if cosine_similarity(query_vec, anchor_vec) >= SEM_THETA:
                detected.append(anchor_text)

    # 4. Pronoun expansion
    if project_anchors:
        detected.extend(project_anchors)

    detected = list(set(detected))

    # 5. Merge candidates
    candidates = {}
    for anchor in detected:
        if anchor in index:
            for entry in index[anchor]:
                key = entry["path"]
                if key not in candidates or entry["score"] > candidates[key]["score"]:
                    candidates[key] = entry

    # 6. Re-rank against user message
    if candidates:
        query_vec = embed(user_message)  # already computed above
        for key, entry in candidates.items():
            # Combine anchor score with query-chunk similarity
            chunk_vec = embed_cached(entry["preview"])
            rerank_score = cosine_similarity(query_vec, chunk_vec)
            entry["final_score"] = 0.5 * entry["score"] + 0.5 * rerank_score

        # Sort by final_score, return top max_chunks
        ranked = sorted(candidates.values(), key=lambda x: x["final_score"], reverse=True)
        return ranked[:MAX_CHUNKS]

    return []
```

### 6. `benchmark.py` — CORF Benchmark Runner

```python
"""
Run the CORF benchmark from Section 7.
Supports ablations A1-A3.
Outputs metrics: CORF-Recall@K, IIR, SCR, Latency.
"""

def run_benchmark(test_set_path: str, ablation: str = None):
    """
    ablation: None (full system), "no-pronoun", "no-rerank", "nightly-only"
    """
    test_queries = load_test_set(test_set_path)
    results = []

    for query in test_queries:
        start = time.perf_counter()
        chunks = lookup(
            query.text,
            project_anchors=None if ablation == "no-pronoun" else query.project_anchors,
            use_rerank=ablation != "no-rerank",
            use_realtime=ablation != "nightly-only",
        )
        latency = time.perf_counter() - start

        # Check if ground-truth chunk is in results
        hit = any(c["path"] == query.ground_truth_path for c in chunks[:20])

        results.append({
            "query_id": query.id,
            "hit": hit,
            "latency_ms": latency * 1000,
            "n_chunks": len(chunks),
            "sources_covered": len(set(c["source"] for c in chunks)),
        })

    # Compute metrics
    recall_at_20 = sum(r["hit"] for r in results) / len(results)
    p95_latency = np.percentile([r["latency_ms"] for r in results], 95)

    return {
        "ablation": ablation or "full",
        "corf_recall_at_20": recall_at_20,
        "p95_latency_ms": p95_latency,
        "n_queries": len(results),
    }
```

---

## Integration Points

### 1. OpenClaw Memory Search Hook

Wire `lookup()` into OpenClaw's `memory_search` pipeline:

- File: `src/memory/memory-search.ts` (or equivalent)
- Call `lookup()` as an additional retrieval source alongside vector search
- Merge results, deduplicate, re-rank

### 2. Nightly Cron Job

```json
{
  "name": "hippocampus-rebuild",
  "schedule": { "kind": "cron", "expr": "15 4 * * *", "tz": "Europe/Madrid" },
  "payload": { "kind": "agentTurn", "message": "Run: python3 scripts/hippocampus/build-index.py" },
  "sessionTarget": "isolated"
}
```

### 3. Real-Time Update Hook

When `mem.py store` is called → also call `incremental_update()` with the new content.

### 4. CORF Benchmark Dataset

Create from deployment logs:

- 512 organic queries where retrieval failed
- 100 synthetic paraphrases
- Each annotated with ground-truth chunk path + failure mode

---

## Implementation Order

| Phase     | What                                | Effort        | Priority |
| --------- | ----------------------------------- | ------------- | -------- |
| 1         | `config.py` + `embed.py`            | 30 min        | Must     |
| 2         | `build-index.py` (nightly rebuild)  | 2 hours       | Must     |
| 3         | `lookup.py` (inference-time)        | 1.5 hours     | Must     |
| 4         | `rerank.py`                         | 45 min        | Must     |
| 5         | `incremental-update.py` (real-time) | 1.5 hours     | Should   |
| 6         | OpenClaw integration hook           | 1 hour        | Must     |
| 7         | `benchmark.py` + CORF dataset       | 2 hours       | Should   |
| 8         | `test_hippocampus.py`               | 1 hour        | Should   |
| **Total** |                                     | **~10 hours** |          |

---

## Key Design Decisions

1. **Python, not TypeScript.** The existing `build-hippocampus-index.py` is Python. Embedding libraries (numpy, sentence-transformers) are Python-native. Keep it Python.

2. **Gemini embeddings by default.** We already use Gemini for memory_search. Consistent embedding space. Free tier covers our volume (~50K chunks).

3. **JSON index, not SQLite.** At ~50K chunks and ~400 anchors, the index fits in memory (~2MB). JSON is human-readable and debuggable. Switch to SQLite only if we exceed 100K chunks.

4. **Atomic writes everywhere.** Write to temp file, then rename. Prevents corruption from crashes during write.

5. **Embed caching.** Anchor embeddings are cached in `.npz` format. Chunk embeddings computed on-the-fly during build (too many to cache). At inference time, only anchor embeddings are loaded.
