"""HIPPOCAMPUS Index Builder — Nightly full rebuild (semantic tier)."""

import json
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import numpy as np

from .config import (
    WORKSPACE, SOURCES, K, THETA, INDEX_PATH, EMBEDS_PATH, META_PATH,
    SKIP_DIRS, SKIP_FILES, MAX_ANCHORS
)
from .chunker import chunk_file, discover_files, Chunk
from .anchors import extract_anchors_from_chunks
from .embed import embed_batch, cosine_similarity_matrix


def save_atomic(path: Path, data):
    """Atomic write: write to temp file, then rename."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    if isinstance(data, (dict, list)):
        content = json.dumps(data, indent=2, ensure_ascii=False)
        suffix = ".json"
    else:
        raise TypeError(f"Unsupported data type: {type(data)}")
    
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=suffix, dir=path.parent, delete=False
    ) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    
    Path(tmp_path).rename(path)


def build_index(
    sources: Optional[list[Path]] = None,
    workspace: Optional[Path] = None,
    output_index: Optional[Path] = None,
    output_embeds: Optional[Path] = None,
    output_meta: Optional[Path] = None,
    k: int = K,
    theta: float = THETA,
    verbose: bool = False,
) -> dict:
    """Build the full HIPPOCAMPUS index.
    
    Returns the index dict: {anchor_text: [{path, score, source, preview, line}]}
    """
    ws = workspace or WORKSPACE
    srcs = sources or SOURCES
    idx_path = output_index or INDEX_PATH
    emb_path = output_embeds or EMBEDS_PATH
    met_path = output_meta or META_PATH
    
    start_time = time.time()
    
    # 1. Discover files
    files = discover_files(srcs, SKIP_DIRS, SKIP_FILES)
    if verbose:
        print(f"[hippocampus] Found {len(files)} files")
    
    # 2. Chunk all files
    all_chunks: list[Chunk] = []
    for f in files:
        all_chunks.extend(chunk_file(f, ws))
    if verbose:
        print(f"[hippocampus] Extracted {len(all_chunks)} chunks")
    
    if not all_chunks:
        if verbose:
            print("[hippocampus] No chunks found, writing empty index")
        index = {}
        _save_outputs(index, np.array([]), [], met_path, idx_path, emb_path,
                      0, 0, start_time)
        return index
    
    # 3. Extract anchor vocabulary
    anchors = extract_anchors_from_chunks(all_chunks)
    if verbose:
        print(f"[hippocampus] Vocabulary: {len(anchors)} anchors "
              f"({sum(1 for a in anchors if ' ' in a)} multi-word)")
    
    if not anchors:
        index = {}
        _save_outputs(index, np.array([]), [], met_path, idx_path, emb_path,
                      len(files), len(all_chunks), start_time)
        return index
    
    # 4. Embed anchors and chunks (batch for efficiency)
    if verbose:
        print(f"[hippocampus] Embedding {len(anchors)} anchors...")
    anchor_embeds = embed_batch(anchors)
    
    if verbose:
        print(f"[hippocampus] Embedding {len(all_chunks)} chunks...")
    # Embed chunk text (use first 500 chars of each chunk for efficiency)
    chunk_texts = [c.text[:500] for c in all_chunks]
    chunk_embeds = embed_batch(chunk_texts)
    
    # 5. Build similarity matrix via vectorized matmul
    if verbose:
        print(f"[hippocampus] Computing {len(anchors)}×{len(all_chunks)} similarity matrix...")
    sim_matrix = cosine_similarity_matrix(anchor_embeds, chunk_embeds)
    
    # 6. For each anchor, keep top-K chunks above THETA
    index = {}
    for i, anchor in enumerate(anchors):
        scores = sim_matrix[i]
        top_indices = np.argsort(scores)[::-1][:k]
        entries = []
        for idx in top_indices:
            score = float(scores[idx])
            if score >= theta:
                chunk = all_chunks[idx]
                entries.append({
                    "path": chunk.path,
                    "line": chunk.start_line,
                    "score": round(score, 4),
                    "source": chunk.source,
                    "preview": chunk.text[:120].replace("\n", " "),
                })
        if entries:
            index[anchor] = entries
    
    if verbose:
        print(f"[hippocampus] Index: {len(index)} anchors with entries "
              f"(avg {np.mean([len(v) for v in index.values()]):.1f} chunks/anchor)")
    
    # 7. Save outputs atomically
    _save_outputs(index, anchor_embeds, anchors, met_path, idx_path, emb_path,
                  len(files), len(all_chunks), start_time)
    
    if verbose:
        elapsed = time.time() - start_time
        print(f"[hippocampus] Build complete in {elapsed:.1f}s")
    
    return index


def _save_outputs(index, anchor_embeds, anchors, met_path, idx_path, emb_path,
                  n_files, n_chunks, start_time):
    """Save index, embeddings, and metadata atomically."""
    save_atomic(idx_path, index)
    
    if len(anchor_embeds) > 0:
        # Save embeddings as npz
        emb_path = Path(emb_path)
        emb_path.parent.mkdir(parents=True, exist_ok=True)
        np.savez(emb_path,
                 anchor_texts=np.array(anchors, dtype=object),
                 anchor_embeds=anchor_embeds)
    
    save_atomic(met_path, {
        "built_at": datetime.now(timezone.utc).isoformat(),
        "n_anchors": len(index),
        "n_chunks": n_chunks,
        "n_files": n_files,
        "multi_word_anchors": sum(1 for a in index if ' ' in a),
        "build_time_s": round(time.time() - start_time, 2),
    })


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Build HIPPOCAMPUS index")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()
    build_index(verbose=True)
