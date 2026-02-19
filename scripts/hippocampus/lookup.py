"""HIPPOCAMPUS Inference-Time Lookup — Fast retrieval from pre-computed index."""

import json
import re
import time
from pathlib import Path
from typing import Optional

import numpy as np

from .config import (
    INDEX_PATH, EMBEDS_PATH, SEM_THETA, MAX_CHUNKS, WORKSPACE
)
from .embed import embed, embed_cached, cosine_similarity

# ─── Index cache (loaded once, kept in memory) ──────────────────────────
_index_cache: Optional[dict] = None
_anchor_embeds_cache: Optional[dict] = None  # {anchor_text: np.ndarray}


def load_index(path: Path = INDEX_PATH) -> dict:
    """Load the HIPPOCAMPUS index from disk (cached)."""
    global _index_cache
    if _index_cache is None:
        path = Path(path)
        if not path.exists():
            return {}
        with open(path) as f:
            _index_cache = json.load(f)
    return _index_cache


def load_anchor_embeds(path: Path = EMBEDS_PATH) -> dict:
    """Load cached anchor embeddings (cached)."""
    global _anchor_embeds_cache
    if _anchor_embeds_cache is None:
        path = Path(path)
        if not path.exists():
            return {}
        data = np.load(path, allow_pickle=True)
        texts = data["anchor_texts"]
        embeds = data["anchor_embeds"]
        _anchor_embeds_cache = {
            str(texts[i]): embeds[i] for i in range(len(texts))
        }
    return _anchor_embeds_cache


def invalidate_cache():
    """Invalidate the in-memory caches (call after index rebuild)."""
    global _index_cache, _anchor_embeds_cache
    _index_cache = None
    _anchor_embeds_cache = None


def lookup(
    user_message: str,
    project_anchors: Optional[list[str]] = None,
    index_path: Path = INDEX_PATH,
    embeds_path: Path = EMBEDS_PATH,
    sem_theta: float = SEM_THETA,
    max_chunks: int = MAX_CHUNKS,
    use_semantic: bool = True,
) -> list[dict]:
    """Retrieve relevant memory chunks for a user message.
    
    Algorithm:
    1. Tokenize user message
    2. Lexical anchor detection (exact match)
    3. Semantic anchor expansion (O(|V|) cosine similarity)
    4. Pronoun expansion via project context
    5. Merge candidate chunks from all matched anchors
    6. Deduplicate by path
    7. Re-rank candidates against user message
    8. Return top max_chunks
    
    Returns list of dicts: [{path, score, source, preview, line, final_score}]
    """
    start = time.perf_counter()
    
    index = load_index(index_path)
    if not index:
        return []
    
    # 1. Tokenize
    msg_lower = user_message.lower()
    tokens = set(re.findall(r'\b\w+\b', msg_lower))
    # Also extract bigrams/trigrams for multi-word anchor matching
    words = msg_lower.split()
    phrases = set()
    for n in (2, 3):
        for i in range(len(words) - n + 1):
            phrases.add(" ".join(words[i:i+n]))
    
    # 2. Lexical anchor detection
    detected = set()
    for anchor in index:
        if anchor in tokens or anchor in phrases or anchor in msg_lower:
            detected.add(anchor)
    
    # 3. Semantic anchor expansion
    if use_semantic and sem_theta > 0:
        anchor_embeds = load_anchor_embeds(embeds_path)
        if anchor_embeds:
            query_vec = embed(user_message)
            for anchor_text, anchor_vec in anchor_embeds.items():
                if anchor_text in index and anchor_text not in detected:
                    sim = cosine_similarity(query_vec, anchor_vec)
                    if sim >= sem_theta:
                        detected.add(anchor_text)
    
    # 4. Pronoun expansion via project context
    if project_anchors:
        for pa in project_anchors:
            pa_lower = pa.lower()
            if pa_lower in index:
                detected.add(pa_lower)
    
    if not detected:
        return []
    
    # 5. Merge candidates (keep highest anchor score per path)
    candidates = {}
    for anchor in detected:
        if anchor not in index:
            continue
        for entry in index[anchor]:
            path = entry["path"]
            if path not in candidates or entry["score"] > candidates[path]["score"]:
                candidates[path] = dict(entry)
                candidates[path]["matched_anchor"] = anchor
    
    if not candidates:
        return []
    
    # 6. Re-rank against user message
    query_vec = embed(user_message)  # may already be computed
    for path, entry in candidates.items():
        preview_vec = embed_cached(entry.get("preview", ""))
        rerank_score = cosine_similarity(query_vec, preview_vec)
        entry["final_score"] = round(0.5 * entry["score"] + 0.5 * rerank_score, 4)
    
    # 7. Sort by final_score, return top max_chunks
    ranked = sorted(candidates.values(), key=lambda x: x["final_score"], reverse=True)
    
    elapsed_ms = (time.perf_counter() - start) * 1000
    for entry in ranked:
        entry["lookup_ms"] = round(elapsed_ms, 1)
    
    return ranked[:max_chunks]
