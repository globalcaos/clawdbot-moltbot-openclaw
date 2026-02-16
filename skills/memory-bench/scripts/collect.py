#!/usr/bin/env python3
"""
memory-bench collect — Gather anonymized memory system statistics.

Collects retrieval accuracy, token usage, consolidation metrics, and system
info. All data is anonymized: no memory content, no personal information,
no file paths. Only aggregate numbers and distribution histograms.

Usage:
    python3 collect.py [--db PATH] [--days N] [--output PATH]

Output: JSON report file ready for PR submission.
"""
import sqlite3
import json
import sys
import os
import hashlib
import platform
from pathlib import Path
from datetime import datetime, timedelta, timezone
from collections import Counter

def find_db():
    """Locate the cognitive memory database."""
    candidates = [
        Path.home() / ".openclaw" / "workspace" / "db" / "memory.db",
        Path.home() / ".openclaw" / "workspace" / "db" / "cognitive_memory.db",
        Path.home() / ".openclaw" / "workspace" / "db" / "jarvis.db",
    ]
    for c in candidates:
        if c.exists():
            return c
    return None

def anonymize_id(val: str) -> str:
    """One-way hash for contributor privacy."""
    return hashlib.sha256(val.encode()).hexdigest()[:12]

def get_system_info() -> dict:
    """Non-identifying system metadata."""
    return {
        "os": platform.system(),
        "arch": platform.machine(),
        "python": platform.python_version(),
        "node": os.popen("node --version 2>/dev/null").read().strip() or None,
    }

def collect_memory_stats(conn: sqlite3.Connection, days: int) -> dict:
    """Collect aggregate memory statistics. No content is ever read."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    # --- Core counts ---
    total = conn.execute("SELECT COUNT(*) FROM memories WHERE is_deleted = 0").fetchone()[0]
    deleted = conn.execute("SELECT COUNT(*) FROM memories WHERE is_deleted = 1").fetchone()[0]

    # Type distribution
    type_dist = dict(conn.execute(
        "SELECT memory_type, COUNT(*) FROM memories WHERE is_deleted = 0 GROUP BY memory_type"
    ).fetchall())

    # Age distribution (buckets: <1d, 1-7d, 7-30d, 30-90d, >90d)
    age_buckets = {"<1d": 0, "1-7d": 0, "7-30d": 0, "30-90d": 0, ">90d": 0}
    rows = conn.execute(
        "SELECT julianday('now') - julianday(created_at) as age_days FROM memories WHERE is_deleted = 0"
    ).fetchall()
    for (age,) in rows:
        if age < 1: age_buckets["<1d"] += 1
        elif age < 7: age_buckets["1-7d"] += 1
        elif age < 30: age_buckets["7-30d"] += 1
        elif age < 90: age_buckets["30-90d"] += 1
        else: age_buckets[">90d"] += 1

    # --- Strength/importance distributions ---
    strengths = conn.execute(
        "SELECT strength FROM memories WHERE is_deleted = 0 AND strength IS NOT NULL"
    ).fetchall()
    importances = conn.execute(
        "SELECT importance FROM memories WHERE is_deleted = 0 AND importance IS NOT NULL"
    ).fetchall()

    def histogram(values, bins=10):
        if not values: return []
        vals = [v[0] for v in values if v[0] is not None]
        if not vals: return []
        mn, mx = min(vals), max(vals)
        if mn == mx: return [{"range": f"{mn:.2f}", "count": len(vals)}]
        step = (mx - mn) / bins
        hist = []
        for i in range(bins):
            lo = mn + i * step
            hi = lo + step
            count = sum(1 for v in vals if lo <= v < hi or (i == bins - 1 and v == hi))
            hist.append({"range": f"{lo:.2f}-{hi:.2f}", "count": count})
        return hist

    # --- Association graph ---
    assoc_count = 0
    assoc_type_dist = {}
    try:
        assoc_count = conn.execute("SELECT COUNT(*) FROM associations").fetchone()[0]
        assoc_type_dist = dict(conn.execute(
            "SELECT association_type, COUNT(*) FROM associations GROUP BY association_type"
        ).fetchall())
    except sqlite3.OperationalError:
        pass  # Table may not exist

    # --- Hierarchy ---
    hierarchy_levels = {}
    try:
        hierarchy_levels = dict(conn.execute(
            "SELECT level, COUNT(*) FROM hierarchy GROUP BY level"
        ).fetchall())
    except sqlite3.OperationalError:
        pass

    # --- Consolidation history ---
    consolidations = []
    try:
        rows = conn.execute(
            "SELECT timestamp, memories_processed, memories_decayed, memories_pruned, "
            "clusters_formed, summaries_created FROM consolidation_log "
            "WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 30",
            (cutoff,)
        ).fetchall()
        for r in rows:
            consolidations.append({
                "timestamp": r[0],
                "processed": r[1], "decayed": r[2], "pruned": r[3],
                "clusters": r[4], "summaries": r[5],
            })
    except sqlite3.OperationalError:
        pass

    # --- Embedding stats ---
    has_embeddings = False
    embedding_count = 0
    try:
        # sqlite-vec stores embeddings in a separate virtual table
        embedding_count = conn.execute(
            "SELECT COUNT(*) FROM memories_vec"
        ).fetchone()[0]
        has_embeddings = embedding_count > 0
    except sqlite3.OperationalError:
        try:
            embedding_count = conn.execute(
                "SELECT COUNT(*) FROM memories WHERE is_deleted = 0 AND embedding IS NOT NULL"
            ).fetchone()[0]
            has_embeddings = embedding_count > 0
        except sqlite3.OperationalError:
            pass

    # --- Cross-agent sharing ---
    shared_count = 0
    try:
        shared_count = conn.execute("SELECT COUNT(*) FROM shared_memories").fetchone()[0]
    except sqlite3.OperationalError:
        pass

    return {
        "memories": {
            "total_active": total,
            "total_deleted": deleted,
            "type_distribution": type_dist,
            "age_distribution": age_buckets,
            "strength_histogram": histogram(strengths),
            "importance_histogram": histogram(importances),
            "embedding_coverage": round(embedding_count / max(total, 1), 3),
        },
        "associations": {
            "total": assoc_count,
            "type_distribution": assoc_type_dist,
        },
        "hierarchy": {
            "levels": hierarchy_levels,
        },
        "consolidation": {
            "recent_runs": consolidations,
            "total_runs_in_period": len(consolidations),
        },
        "sharing": {
            "total_shared": shared_count,
        },
    }

def collect_retrieval_stats(conn: sqlite3.Connection, days: int) -> dict:
    """Collect retrieval performance metrics if available."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    stats = {"available": False}

    try:
        rows = conn.execute(
            "SELECT strategy, avg_score, result_count, latency_ms, timestamp "
            "FROM retrieval_log WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 500",
            (cutoff,)
        ).fetchall()
        if not rows:
            return stats

        stats["available"] = True
        stats["total_queries"] = len(rows)

        # Per-strategy breakdown
        by_strategy = {}
        for strategy, avg_score, count, latency, _ in rows:
            if strategy not in by_strategy:
                by_strategy[strategy] = {"scores": [], "latencies": [], "counts": []}
            if avg_score is not None:
                by_strategy[strategy]["scores"].append(avg_score)
            if latency is not None:
                by_strategy[strategy]["latencies"].append(latency)
            if count is not None:
                by_strategy[strategy]["counts"].append(count)

        stats["by_strategy"] = {}
        for strat, data in by_strategy.items():
            entry = {"query_count": len(data["scores"]) + len(data["latencies"])}
            if data["scores"]:
                s = data["scores"]
                entry["avg_score"] = round(sum(s) / len(s), 4)
                entry["min_score"] = round(min(s), 4)
                entry["max_score"] = round(max(s), 4)
            if data["latencies"]:
                l = data["latencies"]
                entry["avg_latency_ms"] = round(sum(l) / len(l), 1)
                entry["p50_latency_ms"] = round(sorted(l)[len(l) // 2], 1)
                entry["p95_latency_ms"] = round(sorted(l)[int(len(l) * 0.95)], 1)
            if data["counts"]:
                c = data["counts"]
                entry["avg_results"] = round(sum(c) / len(c), 1)
            stats["by_strategy"][strat] = entry

    except sqlite3.OperationalError:
        pass

    return stats

def collect_token_stats() -> dict:
    """Collect token/context usage from OpenClaw session data if available."""
    stats = {"available": False}
    usage_files = [
        Path.home() / ".openclaw" / "workspace" / "memory" / "claude-usage.json",
        Path.home() / ".openclaw" / "workspace" / "memory" / "gemini-usage.json",
    ]
    for f in usage_files:
        if f.exists():
            stats["available"] = True
            try:
                data = json.loads(f.read_text())
                # Only extract aggregate numbers, never content
                provider = f.stem.replace("-usage", "")
                stats[provider] = {
                    "total_tokens": data.get("totalTokens", 0),
                    "total_cost_usd": round(data.get("totalCost", 0), 2),
                    "sessions": data.get("sessionCount", 0),
                }
            except (json.JSONDecodeError, KeyError):
                pass
    return stats

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Collect anonymized memory bench stats")
    parser.add_argument("--db", help="Path to cognitive_memory.db")
    parser.add_argument("--days", type=int, default=14, help="Days of history to include (default: 14)")
    parser.add_argument("--output", help="Output JSON path (default: stdout)")
    parser.add_argument("--contributor", help="Your GitHub username (for attribution)")
    args = parser.parse_args()

    # Find database
    db_path = Path(args.db) if args.db else find_db()
    if not db_path or not db_path.exists():
        print("❌ Memory database not found. Searched:")
        print("   ~/.openclaw/workspace/db/memory.db")
        print("   ~/.openclaw/workspace/db/cognitive_memory.db")
        print("   ~/.openclaw/workspace/db/jarvis.db")
        print("   Use --db PATH to specify manually.")
        sys.exit(1)

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row

    # Build report
    report = {
        "schema_version": "1.0.0",
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "collection_period_days": args.days,
        "contributor": args.contributor or os.environ.get("GITHUB_USER", "anonymous"),
        "instance_id": anonymize_id(str(db_path) + platform.node()),
        "system": get_system_info(),
        "memory_stats": collect_memory_stats(conn, args.days),
        "retrieval_stats": collect_retrieval_stats(conn, args.days),
        "token_stats": collect_token_stats(),
    }

    conn.close()

    output = json.dumps(report, indent=2, default=str)

    if args.output:
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        Path(args.output).write_text(output)
        print(f"✅ Report saved to {args.output}")
        print(f"   Instance: {report['instance_id']}")
        print(f"   Memories: {report['memory_stats']['memories']['total_active']}")
        print(f"   Period: {args.days} days")
    else:
        print(output)

if __name__ == "__main__":
    main()
