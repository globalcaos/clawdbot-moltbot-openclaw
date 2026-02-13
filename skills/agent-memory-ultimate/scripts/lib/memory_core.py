"""
Cognitive Memory Core — Phases 1-3: Store, Embed, Recall, Consolidate, Associate
SQLite + FTS5 + numpy vector search + association graph
"""
import sqlite3
import json
import struct
import time
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

import numpy as np

from . import embedder

log = logging.getLogger("memory_core")

# ---------- paths ----------

def find_workspace() -> Path:
    for p in [
        Path(__file__).parent.parent.parent.parent.parent,  # lib/ -> scripts/ -> agent-memory/ -> skills/ -> workspace
        Path.home() / ".openclaw" / "workspace",
    ]:
        if (p / "AGENTS.md").exists() or (p / "db").exists():
            return p
    return Path.home() / ".openclaw" / "workspace"

WORKSPACE = find_workspace()
DB_PATH = WORKSPACE / "db" / "memory.db"

# ---------- blob helpers ----------

def vec_to_blob(vec: np.ndarray) -> bytes:
    """Pack float32 array to bytes."""
    return vec.astype(np.float32).tobytes()

def blob_to_vec(blob: bytes) -> np.ndarray:
    """Unpack bytes to float32 array."""
    return np.frombuffer(blob, dtype=np.float32)

# ---------- schema ----------

SCHEMA = """
CREATE TABLE IF NOT EXISTS memories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    content         TEXT NOT NULL,
    memory_type     TEXT DEFAULT 'episodic',
    source          TEXT DEFAULT 'agent',
    importance      REAL DEFAULT 0.5,
    strength        REAL DEFAULT 1.0,
    access_count    INTEGER DEFAULT 0,
    last_accessed   TEXT,
    created_at      TEXT NOT NULL,
    is_deleted      INTEGER DEFAULT 0,
    metadata        TEXT
);

CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
    content,
    content=memories,
    content_rowid=id,
    tokenize='porter unicode61'
);

CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
    INSERT INTO memories_fts(rowid, content) VALUES (new.id, new.content);
END;

CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
    INSERT INTO memories_fts(memories_fts, rowid, content) VALUES('delete', old.id, old.content);
END;

CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE OF content ON memories BEGIN
    INSERT INTO memories_fts(memories_fts, rowid, content) VALUES('delete', old.id, old.content);
    INSERT INTO memories_fts(rowid, content) VALUES (new.id, new.content);
END;

CREATE TABLE IF NOT EXISTS memories_vec (
    memory_id   INTEGER PRIMARY KEY REFERENCES memories(id) ON DELETE CASCADE,
    embedding   BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS associations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id   INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    target_id   INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    edge_type   TEXT NOT NULL DEFAULT 'semantic',
    weight      REAL NOT NULL DEFAULT 0.5,
    created_at  TEXT NOT NULL,
    metadata    TEXT
);

CREATE INDEX IF NOT EXISTS idx_assoc_source ON associations(source_id);
CREATE INDEX IF NOT EXISTS idx_assoc_target ON associations(target_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_assoc_pair ON associations(source_id, target_id, edge_type);

CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
);
"""

# ---------- connection ----------

def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

CURRENT_SCHEMA_VERSION = 2

def init_db(conn: sqlite3.Connection):
    """Create schema if not exists. Migrates if needed."""
    conn.executescript(SCHEMA)
    existing = conn.execute("SELECT version FROM schema_version").fetchone()
    if not existing:
        conn.execute(f"INSERT INTO schema_version VALUES ({CURRENT_SCHEMA_VERSION})")
    elif existing['version'] < CURRENT_SCHEMA_VERSION:
        # Migration: v1 → v2 adds associations table (already in SCHEMA via IF NOT EXISTS)
        conn.execute(f"UPDATE schema_version SET version = {CURRENT_SCHEMA_VERSION}")
    conn.commit()
    log.info(f"Database initialized at {DB_PATH} (v{CURRENT_SCHEMA_VERSION})")

# ---------- store ----------

def store(conn: sqlite3.Connection, content: str, memory_type: str = "episodic",
          source: str = "agent", importance: float = 0.5,
          metadata: Optional[dict] = None) -> int:
    """Store a memory with embedding. Returns memory id."""
    now = datetime.utcnow().isoformat() + "Z"
    meta_json = json.dumps(metadata) if metadata else None

    t0 = time.time()
    vec = embedder.embed(content)
    embed_ms = (time.time() - t0) * 1000

    with conn:
        cur = conn.execute(
            """INSERT INTO memories (content, memory_type, source, importance, strength,
               access_count, last_accessed, created_at, is_deleted, metadata)
               VALUES (?, ?, ?, ?, 1.0, 0, ?, ?, 0, ?)""",
            (content, memory_type, source, importance, now, now, meta_json)
        )
        mid = cur.lastrowid
        conn.execute(
            "INSERT INTO memories_vec (memory_id, embedding) VALUES (?, ?)",
            (mid, vec_to_blob(vec))
        )

    total_ms = (time.time() - t0) * 1000
    log.debug(f"Stored memory #{mid} ({embed_ms:.0f}ms embed, {total_ms:.0f}ms total)")
    return mid

# ---------- recall ----------

def _sanitize_fts_query(query: str) -> str:
    """Escape FTS5 special chars by quoting each token."""
    tokens = query.split()
    # Quote each token to avoid FTS5 syntax errors with special chars
    return " ".join(f'"{t}"' for t in tokens if t.strip())

def _fts_search(conn: sqlite3.Connection, query: str, limit: int = 20) -> list[tuple[int, float]]:
    """FTS5 search. Returns list of (memory_id, bm25_score)."""
    safe_query = _sanitize_fts_query(query)
    if not safe_query:
        return []
    rows = conn.execute(
        """SELECT m.id, fts.rank
           FROM memories_fts fts
           JOIN memories m ON m.id = fts.rowid
           WHERE memories_fts MATCH ? AND m.is_deleted = 0
           ORDER BY fts.rank
           LIMIT ?""",
        (safe_query, limit)
    ).fetchall()
    if not rows:
        return []
    # Normalize BM25 scores to 0-1 (BM25 is negative, closer to 0 = better)
    scores = [abs(r['rank']) for r in rows]
    max_s = max(scores) if scores else 1
    return [(r['id'], 1.0 - abs(r['rank']) / (max_s + 1e-8)) for r in rows]

def _vec_search(conn: sqlite3.Connection, query: str, limit: int = 20) -> list[tuple[int, float]]:
    """Vector similarity search. Returns list of (memory_id, cosine_similarity)."""
    query_vec = embedder.embed(query)

    # Load all non-deleted embeddings
    rows = conn.execute(
        """SELECT v.memory_id, v.embedding
           FROM memories_vec v
           JOIN memories m ON m.id = v.memory_id
           WHERE m.is_deleted = 0"""
    ).fetchall()

    if not rows:
        return []

    ids = [r['memory_id'] for r in rows]
    vecs = np.array([blob_to_vec(r['embedding']) for r in rows])

    results = embedder.cosine_search(query_vec, vecs, top_k=limit)
    return [(ids[idx], score) for idx, score in results]

def recall(conn: sqlite3.Connection, query: str, strategy: str = "hybrid",
           limit: int = 10, vec_weight: float = 0.7) -> list[dict]:
    """
    Recall memories matching query.
    strategy: 'hybrid' (default), 'vector', 'keyword'
    Returns list of dicts with memory fields + score.
    """
    t0 = time.time()

    if strategy == "keyword":
        scored = dict(_fts_search(conn, query, limit * 2))
    elif strategy == "vector":
        scored = dict(_vec_search(conn, query, limit * 2))
    else:  # hybrid
        fts_results = dict(_fts_search(conn, query, limit * 2))
        vec_results = dict(_vec_search(conn, query, limit * 2))

        # Merge: all unique IDs
        all_ids = set(fts_results.keys()) | set(vec_results.keys())
        scored = {}
        for mid in all_ids:
            fts_s = fts_results.get(mid, 0.0)
            vec_s = vec_results.get(mid, 0.0)
            scored[mid] = vec_s * vec_weight + fts_s * (1 - vec_weight)

    if not scored:
        return []

    # Sort by score descending
    ranked = sorted(scored.items(), key=lambda x: x[1], reverse=True)[:limit]

    # Fetch full memory objects
    results = []
    for mid, score in ranked:
        row = conn.execute(
            "SELECT * FROM memories WHERE id = ?", (mid,)
        ).fetchone()
        if row:
            d = dict(row)
            d['score'] = round(score, 4)
            results.append(d)
            # Update access count
            conn.execute(
                "UPDATE memories SET access_count = access_count + 1, last_accessed = ? WHERE id = ?",
                (datetime.utcnow().isoformat() + "Z", mid)
            )

    conn.commit()
    elapsed = (time.time() - t0) * 1000
    log.debug(f"Recall '{query}' ({strategy}): {len(results)} results in {elapsed:.0f}ms")
    return results

# ---------- forget ----------

def forget(conn: sqlite3.Connection, memory_id: int = None, query: str = None) -> int:
    """Soft-delete memories. Returns count deleted."""
    if memory_id:
        with conn:
            conn.execute("UPDATE memories SET is_deleted = 1 WHERE id = ?", (memory_id,))
        return 1
    elif query:
        matches = recall(conn, query, strategy="hybrid", limit=5)
        with conn:
            for m in matches:
                conn.execute("UPDATE memories SET is_deleted = 1 WHERE id = ?", (m['id'],))
        return len(matches)
    return 0

def hard_delete(conn: sqlite3.Connection, memory_id: int) -> bool:
    """Permanently delete a memory and its embedding. Returns True if deleted."""
    with conn:
        conn.execute("DELETE FROM memories_vec WHERE memory_id = ?", (memory_id,))
        cur = conn.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
    return cur.rowcount > 0

# ---------- stats ----------

def stats(conn: sqlite3.Connection) -> dict:
    """Get database statistics."""
    total = conn.execute("SELECT COUNT(*) FROM memories WHERE is_deleted = 0").fetchone()[0]
    deleted = conn.execute("SELECT COUNT(*) FROM memories WHERE is_deleted = 1").fetchone()[0]
    by_type = dict(conn.execute(
        "SELECT memory_type, COUNT(*) FROM memories WHERE is_deleted = 0 GROUP BY memory_type"
    ).fetchall())
    vec_count = conn.execute("SELECT COUNT(*) FROM memories_vec").fetchone()[0]
    db_size_kb = DB_PATH.stat().st_size // 1024 if DB_PATH.exists() else 0

    return {
        "total_active": total,
        "total_deleted": deleted,
        "by_type": by_type,
        "with_embeddings": vec_count,
        "db_size_kb": db_size_kb,
        "db_path": str(DB_PATH),
    }

# ---------- consolidation (Phase 2) ----------

# Decay rates per memory type (per day)
DECAY_RATES = {
    "episodic": 0.92,    # Fast decay — episodes fade
    "semantic": 0.98,    # Slow decay — facts persist
    "procedural": 0.99,  # Very slow — skills are sticky
}

def apply_decay(conn: sqlite3.Connection) -> dict:
    """
    Apply Ebbinghaus-inspired strength decay based on memory type and time since last access.
    Soft-deletes memories that fall below threshold (0.1).
    Returns dict with counts: {decayed, deleted, unchanged}.
    """
    now = datetime.utcnow()
    rows = conn.execute(
        "SELECT id, memory_type, strength, last_accessed, access_count FROM memories WHERE is_deleted = 0"
    ).fetchall()

    decayed = 0
    deleted = 0
    unchanged = 0

    for row in rows:
        mid = row['id']
        mtype = row['memory_type']
        strength = row['strength']
        last_acc = datetime.fromisoformat(row['last_accessed'].replace('Z', ''))
        access_count = row['access_count']

        days_since = max((now - last_acc).total_seconds() / 86400, 0)
        if days_since < 0.01:  # Accessed very recently
            unchanged += 1
            continue

        base_rate = DECAY_RATES.get(mtype, 0.95)
        # Access count provides resistance to decay (rehearsal effect)
        rehearsal_bonus = min(access_count * 0.005, 0.04)  # max +0.04
        effective_rate = min(base_rate + rehearsal_bonus, 0.999)

        new_strength = strength * (effective_rate ** days_since)
        new_strength = round(new_strength, 6)

        if new_strength < 0.1:
            # Soft-delete faded memories
            conn.execute("UPDATE memories SET is_deleted = 1, strength = ? WHERE id = ?",
                        (new_strength, mid))
            deleted += 1
        elif abs(new_strength - strength) > 0.001:
            conn.execute("UPDATE memories SET strength = ? WHERE id = ?",
                        (new_strength, mid))
            decayed += 1
        else:
            unchanged += 1

    conn.commit()
    return {"decayed": decayed, "deleted": deleted, "unchanged": unchanged}


def cluster_memories(conn: sqlite3.Connection, days: int = 1, threshold: float = 0.5) -> list[list[int]]:
    """
    Cluster recent memories by semantic similarity using agglomerative clustering.
    Returns list of clusters (each cluster = list of memory IDs).
    Only clusters with 2+ members are returned.
    """
    from scipy.cluster.hierarchy import fcluster, linkage
    from scipy.spatial.distance import pdist

    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat() + "Z"
    rows = conn.execute(
        """SELECT m.id, v.embedding FROM memories m
           JOIN memories_vec v ON v.memory_id = m.id
           WHERE m.is_deleted = 0 AND m.created_at >= ?""",
        (cutoff,)
    ).fetchall()

    if len(rows) < 2:
        return []

    ids = [r['id'] for r in rows]
    vecs = np.array([blob_to_vec(r['embedding']) for r in rows])

    # Cosine distance matrix
    dists = pdist(vecs, metric='cosine')
    # Agglomerative clustering
    Z = linkage(dists, method='average')
    labels = fcluster(Z, t=threshold, criterion='distance')

    # Group by cluster label
    from collections import defaultdict
    groups = defaultdict(list)
    for mid, label in zip(ids, labels):
        groups[label].append(mid)

    # Only return clusters with 2+ members
    return [mids for mids in groups.values() if len(mids) >= 2]


def get_memories_by_ids(conn: sqlite3.Connection, ids: list[int]) -> list[dict]:
    """Fetch full memory records by IDs."""
    if not ids:
        return []
    placeholders = ",".join("?" * len(ids))
    rows = conn.execute(
        f"SELECT * FROM memories WHERE id IN ({placeholders})", ids
    ).fetchall()
    return [dict(r) for r in rows]


def consolidate(conn: sqlite3.Connection, days: int = 1) -> dict:
    """
    Full consolidation pass:
    1. Apply decay
    2. Cluster recent memories
    3. Generate cluster summaries (stored as new semantic memories)
    Returns stats dict.
    """
    t0 = time.time()

    # Step 1: Decay
    decay_stats = apply_decay(conn)

    # Step 2: Cluster
    clusters = cluster_memories(conn, days=days)

    # Step 3: Summarize clusters
    summaries_created = 0
    for cluster_ids in clusters:
        memories = get_memories_by_ids(conn, cluster_ids)
        if not memories:
            continue

        # Build summary from cluster contents
        contents = [m['content'] for m in memories]

        # Simple extractive summary: take the most important memory as representative
        # + combine key content. (LLM summary would be Phase 2.5 upgrade)
        best = max(memories, key=lambda m: m.get('importance', 0.5))
        if len(contents) > 1:
            # Create a consolidated summary
            summary_parts = []
            for c in contents:
                # Take first 100 chars of each
                short = c[:100].strip()
                if short and short not in summary_parts:
                    summary_parts.append(short)
            summary = f"[Cluster of {len(contents)} related memories] " + " | ".join(summary_parts[:5])

            # Calculate cluster importance (max of members)
            cluster_importance = max(m.get('importance', 0.5) for m in memories)

            # Store as new level-1 summary memory
            mid = store(conn, summary,
                       memory_type="semantic",
                       source="consolidation",
                       importance=min(cluster_importance + 0.1, 1.0),
                       metadata={"cluster_members": cluster_ids, "level": 1})
            summaries_created += 1

    # Step 4: Build associations within clusters
    associations_created = 0
    for cluster_ids in clusters:
        associations_created += build_cluster_associations(conn, cluster_ids)

    elapsed = (time.time() - t0) * 1000
    return {
        "decay": decay_stats,
        "clusters_found": len(clusters),
        "summaries_created": summaries_created,
        "associations_created": associations_created,
        "elapsed_ms": round(elapsed),
    }

# ---------- associations (Phase 3) ----------

def associate(conn: sqlite3.Connection, source_id: int, target_id: int,
              edge_type: str = "semantic", weight: float = 0.5,
              metadata: dict = None) -> Optional[int]:
    """Create or update an association between two memories. Returns assoc id."""
    now = datetime.utcnow().isoformat() + "Z"
    meta_str = json.dumps(metadata) if metadata else None
    try:
        cur = conn.execute(
            """INSERT INTO associations (source_id, target_id, edge_type, weight, created_at, metadata)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(source_id, target_id, edge_type)
               DO UPDATE SET weight = MAX(weight, excluded.weight)""",
            (source_id, target_id, edge_type, weight, now, meta_str)
        )
        conn.commit()
        return cur.lastrowid
    except Exception as e:
        log.warning(f"Failed to create association {source_id}->{target_id}: {e}")
        return None


def build_cluster_associations(conn: sqlite3.Connection, cluster_ids: list[int]) -> int:
    """Create semantic associations between all memories in a cluster."""
    if len(cluster_ids) < 2:
        return 0

    # Load embeddings for similarity-based weight
    rows = conn.execute(
        f"SELECT memory_id, embedding FROM memories_vec WHERE memory_id IN ({','.join('?' * len(cluster_ids))})",
        cluster_ids
    ).fetchall()

    vecs = {r['memory_id']: blob_to_vec(r['embedding']) for r in rows}
    created = 0

    for i, id_a in enumerate(cluster_ids):
        for id_b in cluster_ids[i+1:]:
            if id_a in vecs and id_b in vecs:
                sim = float(np.dot(vecs[id_a], vecs[id_b]) /
                           (np.linalg.norm(vecs[id_a]) * np.linalg.norm(vecs[id_b]) + 1e-8))
                weight = max(sim, 0.1)  # Floor at 0.1
            else:
                weight = 0.3  # Default if no embedding

            if associate(conn, id_a, id_b, "semantic", weight):
                created += 1
            # Bidirectional
            if associate(conn, id_b, id_a, "semantic", weight):
                created += 1

    return created


def build_temporal_associations(conn: sqlite3.Connection, window_minutes: int = 30) -> int:
    """Create temporal associations between memories created close in time."""
    rows = conn.execute(
        "SELECT id, created_at FROM memories WHERE is_deleted = 0 ORDER BY created_at"
    ).fetchall()

    created = 0
    for i in range(len(rows)):
        t_i = datetime.fromisoformat(rows[i]['created_at'].replace('Z', ''))
        for j in range(i + 1, len(rows)):
            t_j = datetime.fromisoformat(rows[j]['created_at'].replace('Z', ''))
            diff_min = abs((t_j - t_i).total_seconds()) / 60
            if diff_min > window_minutes:
                break
            # Weight inversely proportional to time gap
            weight = round(1.0 - (diff_min / window_minutes), 3)
            if associate(conn, rows[i]['id'], rows[j]['id'], "temporal", weight):
                created += 1
            if associate(conn, rows[j]['id'], rows[i]['id'], "temporal", weight):
                created += 1

    return created


def get_associations(conn: sqlite3.Connection, memory_id: int,
                     edge_type: str = None, direction: str = "both") -> list[dict]:
    """Get all associations for a memory. direction: 'out', 'in', or 'both'."""
    results = []

    if direction in ("out", "both"):
        q = "SELECT a.*, m.content as target_content FROM associations a JOIN memories m ON m.id = a.target_id WHERE a.source_id = ?"
        params = [memory_id]
        if edge_type:
            q += " AND a.edge_type = ?"
            params.append(edge_type)
        results.extend([dict(r) for r in conn.execute(q, params).fetchall()])

    if direction in ("in", "both"):
        q = "SELECT a.*, m.content as source_content FROM associations a JOIN memories m ON m.id = a.source_id WHERE a.target_id = ?"
        params = [memory_id]
        if edge_type:
            q += " AND a.edge_type = ?"
            params.append(edge_type)
        results.extend([dict(r) for r in conn.execute(q, params).fetchall()])

    return sorted(results, key=lambda x: x.get('weight', 0), reverse=True)


def recall_associated(conn: sqlite3.Connection, query: str, hops: int = 1,
                      limit: int = 10) -> list[dict]:
    """
    Multi-hop retrieval: recall matching memories, then follow associations.
    Returns direct matches + associated memories with hop distance.
    """
    # Get direct matches
    direct = recall(conn, query, strategy="hybrid", limit=limit)
    if not direct or hops < 1:
        return direct

    seen = {m['id'] for m in direct}
    for m in direct:
        m['hop'] = 0

    # Follow associations for each hop
    frontier = [m['id'] for m in direct]
    all_results = list(direct)

    for hop in range(1, hops + 1):
        next_frontier = []
        for mid in frontier:
            assocs = get_associations(conn, mid)
            for a in assocs:
                # Get the OTHER end
                other_id = a['target_id'] if a['source_id'] == mid else a['source_id']
                if other_id in seen:
                    continue
                seen.add(other_id)
                row = conn.execute("SELECT * FROM memories WHERE id = ? AND is_deleted = 0",
                                  (other_id,)).fetchone()
                if row:
                    d = dict(row)
                    d['score'] = round(a['weight'] * (0.7 ** hop), 4)  # Decay score by hop
                    d['hop'] = hop
                    d['via_edge'] = a['edge_type']
                    all_results.append(d)
                    next_frontier.append(other_id)

        frontier = next_frontier
        if not frontier:
            break

    # Sort: direct matches first (hop=0), then by score descending
    all_results.sort(key=lambda x: (x.get('hop', 0), -x.get('score', 0)))
    return all_results[:limit]


def association_stats(conn: sqlite3.Connection) -> dict:
    """Get association graph statistics."""
    total = conn.execute("SELECT COUNT(*) FROM associations").fetchone()[0]
    by_type = dict(conn.execute(
        "SELECT edge_type, COUNT(*) FROM associations GROUP BY edge_type"
    ).fetchall())
    avg_weight = conn.execute("SELECT AVG(weight) FROM associations").fetchone()[0] or 0
    unique_memories = conn.execute(
        "SELECT COUNT(DISTINCT id) FROM (SELECT source_id as id FROM associations UNION SELECT target_id FROM associations)"
    ).fetchone()[0]
    return {
        "total_edges": total,
        "by_type": by_type,
        "avg_weight": round(avg_weight, 3),
        "connected_memories": unique_memories,
    }
