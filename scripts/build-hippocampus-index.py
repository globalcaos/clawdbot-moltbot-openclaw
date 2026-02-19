#!/usr/bin/env python3
"""
HIPPOCAMPUS Concept Index Builder
==================================
Pre-computes a concept → memory-files lookup table (O(1) at inference time).
Inspired by the human hippocampus: the indexing structure between long-term
cortical storage and working memory.

Usage:
    python3 build-hippocampus-index.py [--memory-dir PATH] [--output PATH] [--top-k N]

Algorithm:
    1. Scan all .md files in memory/ + bank/ directories
    2. Embed each file (title + first 512 chars) via the embedding server
    3. For each anchor word in the vocabulary, embed it and find top-K nearest files
    4. Write hippocampus-index.json: {concept: [{path, score, snippet}]}

Run during sleep consolidation (nightly cron).
"""

import json
import os
import re
import socket
import sys
import time
import argparse
from pathlib import Path
from typing import Optional

# ─── Config ────────────────────────────────────────────────────────────────
SOCKET_PATH = "/tmp/openclaw-embed.sock"
WORKSPACE = Path(os.environ.get("OPENCLAW_WORKSPACE",
    Path.home() / ".openclaw" / "workspace"))

SCAN_DIRS = [
    WORKSPACE / "memory",
    WORKSPACE / "bank",
]

SKIP_DIRS = {"archive", "node_modules", ".git"}
SKIP_FILES = {"memory-index.md"}  # meta-index files

# Anchor vocabulary — domain-specific terms that should trigger recall
ANCHOR_VOCAB = [
    # Research / papers (multi-word for precision on polysemous terms)
    "academic paper research publication",
    "research algorithm contribution",
    "ENGRAM context compaction memory agent paper",
    "CORTEX persistent agent identity paper",
    "LIMBIC humor bisociation embedding paper",
    "SYNAPSE multi-model deliberation paper",
    "TRACE task-aware retrieval compaction paper",
    "HIPPOCAMPUS concept index memory architecture",
    "NeuroCoin blockchain publishing platform",
    # Projects / work
    "project invention prototype startup",
    "patent invention intellectual property",
    "SerraVision AI vision industrial",
    "laser tunneling excavation plasma",
    "AGV autonomous guided vehicle intralogistics",
    "SCADA automation factory",
    # Personal
    "Oscar Serra family personal",
    "Sasha Aleksandra wife",
    "Elisenda daughter school",
    "Marcus baby newborn",
    "Zeneida sister marketing",
    "Tristany brother CEO",
    "meditation spiritual practice",
    "Bashar Essassani teaching",
    # Technical
    "memory compaction retrieval agent",
    "embedding vector search semantic",
    "context window token usage",
    "cron job scheduled task automation",
    "WhatsApp messaging group",
    "OpenClaw gateway plugin",
    # Financial / business
    "budget money investment finances",
    "XRP crypto investment portfolio",
    "SERRA Talleres company business",
    # Health / life
    "health sleep water tracking",
    "solar panels energy home",
    "workshop laboratory tools",
    "underground shelter resilience",
]

TOP_K = 15          # memories per concept
CHUNK_CHARS = 600   # chars to embed per file (title + beginning)


# ─── Embedding client ──────────────────────────────────────────────────────
def embed(text: str) -> Optional[list]:
    """Call the Unix-socket embedding server."""
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.connect(SOCKET_PATH)
        sock.settimeout(10.0)
        request = json.dumps({"action": "embed", "text": text[:2000]}) + "\n"
        sock.sendall(request.encode())
        buf = b""
        while True:
            chunk = sock.recv(65536)
            if not chunk:
                break
            buf += chunk
            if buf.endswith(b"\n"):
                break
        sock.close()
        result = json.loads(buf.decode().strip())
        return result.get("embedding")
    except Exception as e:
        print(f"  [embed error] {e}", file=sys.stderr)
        return None


def embed_batch(texts: list) -> list:
    """Embed multiple texts in one socket call."""
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.connect(SOCKET_PATH)
        sock.settimeout(30.0)
        request = json.dumps({"action": "embed_batch", "texts": [t[:2000] for t in texts]}) + "\n"
        sock.sendall(request.encode())
        buf = b""
        while True:
            chunk = sock.recv(131072)
            if not chunk:
                break
            buf += chunk
            if buf.endswith(b"\n"):
                break
        sock.close()
        result = json.loads(buf.decode().strip())
        return result.get("embeddings", [])
    except Exception as e:
        print(f"  [embed_batch error] {e}", file=sys.stderr)
        return []


def cosine_sim(a: list, b: list) -> float:
    """Compute cosine similarity (vectors already L2-normalised by server)."""
    return sum(x * y for x, y in zip(a, b))


# ─── File scanning ─────────────────────────────────────────────────────────
def extract_chunk(path: Path) -> str:
    """Return title line + first CHUNK_CHARS of file content."""
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
        # First heading or filename as title
        first_line = text.split("\n")[0].strip().lstrip("# ")
        # Strip front-matter / yaml if present
        body = re.sub(r'^---.*?---\s*', '', text, flags=re.DOTALL).strip()
        chunk = (first_line + "\n" + body)[:CHUNK_CHARS]
        return chunk
    except Exception:
        return path.stem


def scan_files(scan_dirs: list) -> list:
    """Return list of (Path, chunk_text) for all .md files."""
    results = []
    for base in scan_dirs:
        if not base.exists():
            continue
        for p in base.rglob("*.md"):
            # Skip hidden dirs and known skip dirs
            parts = set(p.parts)
            if any(s in parts for s in SKIP_DIRS):
                continue
            if p.name in SKIP_FILES:
                continue
            chunk = extract_chunk(p)
            if chunk.strip():
                results.append((p, chunk))
    return results


# ─── Main ──────────────────────────────────────────────────────────────────
def build_index(memory_dir=None, output_path=None, top_k=TOP_K):
    dirs = [Path(memory_dir)] if memory_dir else SCAN_DIRS
    out_path = Path(output_path) if output_path else WORKSPACE / "memory" / "hippocampus-index.json"

    print(f"🦛 HIPPOCAMPUS Index Builder")
    print(f"   Scanning: {[str(d) for d in dirs]}")
    print(f"   Output:   {out_path}")
    print(f"   Top-K:    {top_k}")
    print(f"   Anchors:  {len(ANCHOR_VOCAB)}")
    print()

    # Step 1: Scan files
    print("📂 Scanning .md files...")
    files = scan_files(dirs)
    print(f"   Found {len(files)} files")

    # Step 2: Embed all files in batches
    print("🔢 Embedding files...")
    BATCH = 32
    file_embeddings = []
    for i in range(0, len(files), BATCH):
        batch_files = files[i:i+BATCH]
        texts = [chunk for _, chunk in batch_files]
        vecs = embed_batch(texts)
        for j, (path, chunk) in enumerate(batch_files):
            vec = vecs[j] if j < len(vecs) else None
            file_embeddings.append((path, chunk, vec))
        print(f"   {min(i+BATCH, len(files))}/{len(files)} embedded", end="\r")
    print(f"\n   Done. {sum(1 for _, _, v in file_embeddings if v)} embedded successfully.")

    # Step 3: Embed anchor vocabulary
    print("🔤 Embedding anchor vocabulary...")
    anchor_vecs = {}
    for i in range(0, len(ANCHOR_VOCAB), BATCH):
        batch = ANCHOR_VOCAB[i:i+BATCH]
        vecs = embed_batch(batch)
        for j, word in enumerate(batch):
            if j < len(vecs) and vecs[j]:
                anchor_vecs[word] = vecs[j]
    print(f"   {len(anchor_vecs)}/{len(ANCHOR_VOCAB)} anchors embedded.")

    # Step 4: For each anchor, find top-K nearest files
    print("🔍 Building concept index...")
    index = {}
    for anchor, anchor_vec in anchor_vecs.items():
        scores = []
        for path, chunk, file_vec in file_embeddings:
            if file_vec is None:
                continue
            sim = cosine_sim(anchor_vec, file_vec)
            # First 200 chars as snippet
            snippet = chunk[:200].replace("\n", " ").strip()
            rel_path = str(path.relative_to(WORKSPACE)) if path.is_relative_to(WORKSPACE) else str(path)
            scores.append({"path": rel_path, "score": round(sim, 4), "snippet": snippet})
        scores.sort(key=lambda x: x["score"], reverse=True)
        index[anchor] = scores[:top_k]

    # Step 5: Add metadata
    output = {
        "built_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "files_indexed": sum(1 for _, _, v in file_embeddings if v),
        "anchors": len(index),
        "top_k": top_k,
        "index": index,
    }

    # Step 6: Write
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    size_kb = out_path.stat().st_size // 1024
    print(f"\n✅ Index written → {out_path} ({size_kb} KB)")
    print(f"   {len(index)} concepts × {top_k} files = {len(index)*top_k} pre-computed links")
    return output


def lookup(concept: str, index_path=None):
    """Quick lookup — test the index."""
    path = Path(index_path) if index_path else WORKSPACE / "memory" / "hippocampus-index.json"
    if not path.exists():
        print(f"Index not found: {path}")
        return
    with open(path) as f:
        data = json.load(f)
    index = data.get("index", {})
    results = index.get(concept, [])
    if not results:
        # Try partial match
        matches = [k for k in index if concept.lower() in k.lower()]
        if matches:
            results = index[matches[0]]
            concept = matches[0]
    print(f"🦛 HIPPOCAMPUS lookup: '{concept}' → {len(results)} results")
    print(f"   (Index built: {data.get('built_at', '?')}, {data.get('files_indexed')} files)\n")
    for i, r in enumerate(results, 1):
        print(f"  [{i}] score={r['score']:.3f}  {r['path']}")
        print(f"       {r['snippet'][:100]}...")
        print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HIPPOCAMPUS Concept Index Builder")
    parser.add_argument("--build", action="store_true", help="Build the index")
    parser.add_argument("--lookup", metavar="CONCEPT", help="Test lookup for a concept")
    parser.add_argument("--memory-dir", help="Override memory directory")
    parser.add_argument("--output", help="Override output path")
    parser.add_argument("--top-k", type=int, default=TOP_K, help="Top K results per concept")
    args = parser.parse_args()

    if args.lookup:
        lookup(args.lookup, args.output)
    elif args.build:
        build_index(args.memory_dir, args.output, args.top_k)
    else:
        # Default: build
        build_index(args.memory_dir, args.output, args.top_k)
