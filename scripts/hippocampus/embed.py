"""HIPPOCAMPUS Embedding Helper — Unix socket interface to local embedding server."""

import json
import socket
import numpy as np
from typing import Optional
from .config import SOCKET_PATH, EMBED_DIM

# ─── In-memory cache ────────────────────────────────────────────────────
_embed_cache: dict[str, np.ndarray] = {}


def _socket_request(payload: dict, timeout: float = 10.0) -> dict:
    """Send a JSON request to the embedding server via Unix socket."""
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    try:
        sock.connect(SOCKET_PATH)
        sock.settimeout(timeout)
        request = json.dumps(payload) + "\n"
        sock.sendall(request.encode())
        buf = b""
        while True:
            chunk = sock.recv(65536)
            if not chunk:
                break
            buf += chunk
            if b"\n" in buf:
                break
        return json.loads(buf.decode().strip())
    finally:
        sock.close()


def embed(text: str) -> np.ndarray:
    """Embed a single text string. Returns (EMBED_DIM,) array."""
    resp = _socket_request({"action": "embed", "text": text[:2000]})
    if "embedding" not in resp:
        raise RuntimeError(f"Embedding failed: {resp}")
    return np.array(resp["embedding"], dtype=np.float32)


def embed_cached(text: str) -> np.ndarray:
    """Cached embedding — avoids re-embedding the same anchor text."""
    if text not in _embed_cache:
        _embed_cache[text] = embed(text)
    return _embed_cache[text]


def embed_batch(texts: list[str]) -> np.ndarray:
    """Batch embedding. Returns (N, EMBED_DIM) array."""
    if not texts:
        return np.zeros((0, EMBED_DIM), dtype=np.float32)
    
    resp = _socket_request(
        {"action": "embed_batch", "texts": [t[:2000] for t in texts]},
        timeout=60.0
    )
    if "embeddings" not in resp:
        raise RuntimeError(f"Batch embedding failed: {resp}")
    return np.array(resp["embeddings"], dtype=np.float32)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def cosine_similarity_matrix(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """Cosine similarity matrix between two sets of vectors.
    A: (M, D), B: (N, D) → returns (M, N) similarity matrix.
    """
    norm_A = np.linalg.norm(A, axis=1, keepdims=True)
    norm_B = np.linalg.norm(B, axis=1, keepdims=True)
    # Avoid division by zero
    norm_A = np.where(norm_A == 0, 1e-10, norm_A)
    norm_B = np.where(norm_B == 0, 1e-10, norm_B)
    A_normed = A / norm_A
    B_normed = B / norm_B
    return A_normed @ B_normed.T


def clear_cache():
    """Clear the embedding cache."""
    _embed_cache.clear()


def cache_stats() -> dict:
    """Return cache statistics."""
    return {"entries": len(_embed_cache)}
