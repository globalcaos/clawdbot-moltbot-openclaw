"""HIPPOCAMPUS Configuration — Hyperparameters and paths."""

from pathlib import Path
import os

# ─── Paths ──────────────────────────────────────────────────────────────
WORKSPACE = Path(os.environ.get("OPENCLAW_WORKSPACE",
    Path.home() / ".openclaw" / "workspace"))

INDEX_PATH = WORKSPACE / "memory" / "hippocampus-index.json"
EMBEDS_PATH = WORKSPACE / "memory" / "hippocampus-embeds.npz"
META_PATH = WORKSPACE / "memory" / "hippocampus-meta.json"
SOCKET_PATH = "/tmp/openclaw-embed.sock"

# ─── Sources to index ───────────────────────────────────────────────────
SOURCES = [
    WORKSPACE / "memory",
    WORKSPACE / "bank",
    WORKSPACE / "docs" / "papers",
]

SKIP_DIRS = {"archive", "node_modules", ".git", "__pycache__", "hippo_test_data"}
SKIP_FILES = {"memory-index.md"}

# ─── Hyperparameters (from paper Section 4.9) ──────────────────────────
K = 20                # Top-K chunks per anchor
THETA = 0.30          # Anchor→chunk inclusion threshold (384-dim cosine scores are lower)
SEM_THETA = 0.35      # Semantic anchor expansion threshold
K_MAX = 50            # Hard cap per-anchor list (real-time updates)
MAX_CHUNKS = 30       # Max chunks injected into context
EMBED_DIM = 384       # sentence-transformers all-MiniLM-L6-v2

# ─── Chunking ──────────────────────────────────────────────────────────
MIN_CHUNK_CHARS = 100     # Minimum chunk size (skip tiny fragments)
MAX_CHUNK_CHARS = 2000    # Maximum chunk size before splitting
CHUNK_OVERLAP_CHARS = 100 # Overlap between adjacent chunks

# ─── Anchor extraction ─────────────────────────────────────────────────
MIN_ANCHOR_DF = 2         # Minimum document frequency for single-word anchors
MAX_ANCHORS = 500         # Hard cap on vocabulary size

# ─── Safety ────────────────────────────────────────────────────────────
ANCHOR_DENYLIST = set()   # Anchors that should never trigger retrieval
SOURCE_ALLOWLIST = None   # None = all sources allowed; set() to restrict
