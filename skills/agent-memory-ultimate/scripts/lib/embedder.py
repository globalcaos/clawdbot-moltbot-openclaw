"""
Local ONNX embedder using all-MiniLM-L6-v2.
Singleton pattern — model loads once, reused across calls.
"""
import numpy as np
from functools import lru_cache

_model = None

def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def embed(text: str) -> np.ndarray:
    """Embed a single text string. Returns 384-dim float32 array."""
    return _get_model().encode([text], show_progress_bar=False)[0]

def embed_batch(texts: list[str]) -> np.ndarray:
    """Embed multiple texts. Returns (N, 384) float32 array."""
    if not texts:
        return np.array([], dtype=np.float32).reshape(0, 384)
    return _get_model().encode(texts, show_progress_bar=False, batch_size=64)

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors."""
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))

def cosine_search(query_vec: np.ndarray, all_vecs: np.ndarray, top_k: int = 5) -> list[tuple[int, float]]:
    """
    Search for top_k most similar vectors.
    Returns list of (index, similarity_score).
    """
    if len(all_vecs) == 0:
        return []
    norms = np.linalg.norm(all_vecs, axis=1) + 1e-8
    sims = np.dot(all_vecs, query_vec) / (norms * np.linalg.norm(query_vec) + 1e-8)
    top_indices = np.argsort(sims)[-top_k:][::-1]
    return [(int(idx), float(sims[idx])) for idx in top_indices]
