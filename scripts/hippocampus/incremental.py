"""HIPPOCAMPUS Incremental Update — Real-time episodic tier.

Called when new memory is stored. Updates the index without full rebuild.
"""

import json
import time
from pathlib import Path
from typing import Optional

import numpy as np

from .config import (
    INDEX_PATH, EMBEDS_PATH, THETA, K_MAX, WORKSPACE
)
from .chunker import chunk_text, Chunk
from .embed import embed_batch, cosine_similarity, embed_cached
from .builder import save_atomic
from .lookup import invalidate_cache


def incremental_update(
    new_content: str,
    source_path: str,
    index_path: Path = INDEX_PATH,
    embeds_path: Path = EMBEDS_PATH,
    theta: float = THETA,
    k_max: int = K_MAX,
    verbose: bool = False,
) -> dict:
    """Update the HIPPOCAMPUS index incrementally with new content.
    
    Algorithm:
    1. Load current index + anchor embeddings
    2. Chunk the new content
    3. Embed new chunks
    4. For each existing anchor, compute similarity to new chunks
    5. If score >= theta, insert into anchor's list (maintain sorted, cap at k_max)
    6. Save index atomically
    7. Invalidate lookup cache
    
    Returns: stats dict {chunks_added, anchors_updated, elapsed_ms}
    """
    start = time.perf_counter()
    
    # 1. Load current index
    idx_path = Path(index_path)
    if not idx_path.exists():
        if verbose:
            print("[hippocampus-inc] No index found, skipping incremental update")
        return {"chunks_added": 0, "anchors_updated": 0, "elapsed_ms": 0}
    
    with open(idx_path) as f:
        index = json.load(f)
    
    # Load anchor embeddings
    emb_path = Path(embeds_path)
    if not emb_path.exists():
        if verbose:
            print("[hippocampus-inc] No embeddings found, skipping")
        return {"chunks_added": 0, "anchors_updated": 0, "elapsed_ms": 0}
    
    data = np.load(emb_path, allow_pickle=True)
    anchor_texts = list(data["anchor_texts"])
    anchor_embeds = data["anchor_embeds"]
    
    # 2. Chunk the new content
    source = source_path.split("/")[0] if "/" in source_path else "unknown"
    chunks = chunk_text(new_content, source_path, source)
    
    if not chunks:
        if verbose:
            print("[hippocampus-inc] No chunks from new content, skipping")
        return {"chunks_added": 0, "anchors_updated": 0, "elapsed_ms": 0}
    
    if verbose:
        print(f"[hippocampus-inc] {len(chunks)} new chunks from {source_path}")
    
    # 3. Embed new chunks
    chunk_texts = [c.text[:500] for c in chunks]
    chunk_embeds = embed_batch(chunk_texts)
    
    # 4. For each anchor, check similarity to new chunks
    anchors_updated = 0
    for i, anchor_text in enumerate(anchor_texts):
        if str(anchor_text) not in index:
            continue
        
        anchor_vec = anchor_embeds[i]
        updated = False
        
        for j, chunk in enumerate(chunks):
            score = cosine_similarity(anchor_vec, chunk_embeds[j])
            if score >= theta:
                entry = {
                    "path": chunk.path,
                    "line": chunk.start_line,
                    "score": round(float(score), 4),
                    "source": chunk.source,
                    "preview": chunk.text[:120].replace("\n", " "),
                }
                # Insert maintaining sorted order by score, cap at k_max
                entries = index[str(anchor_text)]
                _insert_sorted(entries, entry, k_max)
                updated = True
        
        if updated:
            anchors_updated += 1
    
    # 5. Save atomically
    save_atomic(idx_path, index)
    
    # 6. Invalidate lookup cache
    invalidate_cache()
    
    elapsed_ms = (time.perf_counter() - start) * 1000
    
    stats = {
        "chunks_added": len(chunks),
        "anchors_updated": anchors_updated,
        "elapsed_ms": round(elapsed_ms, 1),
    }
    
    if verbose:
        print(f"[hippocampus-inc] Updated {anchors_updated} anchors with "
              f"{len(chunks)} chunks in {elapsed_ms:.0f}ms")
    
    return stats


def _insert_sorted(entries: list, new_entry: dict, cap: int):
    """Insert an entry into a sorted-by-score list, maintaining cap."""
    # Check if path already exists (update if higher score)
    for i, e in enumerate(entries):
        if e["path"] == new_entry["path"] and e.get("line") == new_entry.get("line"):
            if new_entry["score"] > e["score"]:
                entries[i] = new_entry
            return
    
    # Find insertion point (descending order)
    insert_at = len(entries)
    for i, e in enumerate(entries):
        if new_entry["score"] > e["score"]:
            insert_at = i
            break
    
    entries.insert(insert_at, new_entry)
    
    # Cap at k_max
    while len(entries) > cap:
        entries.pop()
