#!/usr/bin/env python3
"""
memory-bench rate — Interactive retrieval quality assessment.

Runs queries against the memory system and asks the agent/user to rate
relevance (1-5). Results are appended to the retrieval_log table for
collection by collect.py.

Usage:
    python3 rate.py [--queries N] [--db PATH]

The tool generates diverse queries from stored memory types and measures:
- Recall Accuracy Ratio (RAR): % of top-5 results rated ≥3
- Mean Reciprocal Rank (MRR): 1/rank of first relevant result
- Latency per query
"""
import sqlite3
import sys
import os
import json
import time
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

def find_db():
    candidates = [
        Path.home() / ".openclaw" / "workspace" / "db" / "memory.db",
        Path.home() / ".openclaw" / "workspace" / "db" / "cognitive_memory.db",
        Path.home() / ".openclaw" / "workspace" / "db" / "jarvis.db",
    ]
    for c in candidates:
        if c.exists():
            return c
    return None

def ensure_retrieval_log(conn):
    """Create retrieval_log table if it doesn't exist."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS retrieval_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL DEFAULT (datetime('now')),
            query TEXT NOT NULL,
            strategy TEXT NOT NULL DEFAULT 'hybrid',
            result_count INTEGER,
            avg_score REAL,
            latency_ms REAL,
            rar REAL,
            mrr REAL,
            ratings TEXT  -- JSON array of per-result ratings
        )
    """)
    conn.commit()

def sample_queries(conn, n=10):
    """Generate diverse queries from existing memory content.
    
    Extracts topic keywords (not full content) to build natural queries.
    """
    queries = []
    
    # Sample from different memory types
    rows = conn.execute("""
        SELECT DISTINCT memory_type, 
               substr(content, 1, 80) as snippet
        FROM memories 
        WHERE is_deleted = 0 
        ORDER BY RANDOM() 
        LIMIT ?
    """, (n * 2,)).fetchall()
    
    for mem_type, snippet in rows:
        # Extract first meaningful phrase as query
        words = snippet.split()[:8]
        if len(words) >= 3:
            queries.append({
                "query": " ".join(words[:5]),
                "source_type": mem_type,
            })
    
    return queries[:n]

def run_recall(conn, query: str, strategy="hybrid", limit=5):
    """Run a recall query and time it."""
    # Try to use mem.py's recall function
    try:
        sys.path.insert(0, str(Path.home() / ".openclaw" / "workspace" / "skills" / "agent-memory-ultimate" / "scripts"))
        from lib.memory_core import recall
        
        # recall expects row_factory = sqlite3.Row
        old_factory = conn.row_factory
        conn.row_factory = sqlite3.Row
        start = time.time()
        results = recall(conn, query, strategy=strategy, limit=limit)
        latency = (time.time() - start) * 1000
        conn.row_factory = old_factory
        
        return results, latency
    except ImportError:
        # Fallback: basic FTS5 search
        start = time.time()
        results = conn.execute("""
            SELECT id, content, memory_type, importance, strength
            FROM memories 
            WHERE is_deleted = 0 AND content LIKE ?
            ORDER BY importance DESC
            LIMIT ?
        """, (f"%{query}%", limit)).fetchall()
        latency = (time.time() - start) * 1000
        
        return [{"id": r[0], "content": r[1][:100], "type": r[2], 
                 "importance": r[3], "strength": r[4]} for r in results], latency

def compute_metrics(ratings):
    """Compute RAR and MRR from ratings list."""
    if not ratings:
        return 0.0, 0.0
    
    # RAR: fraction of results rated ≥ 3 (relevant)
    relevant = sum(1 for r in ratings if r >= 3)
    rar = relevant / len(ratings)
    
    # MRR: 1/rank of first relevant result
    mrr = 0.0
    for i, r in enumerate(ratings):
        if r >= 3:
            mrr = 1.0 / (i + 1)
            break
    
    return round(rar, 4), round(mrr, 4)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Rate memory retrieval quality")
    parser.add_argument("--queries", type=int, default=10, help="Number of queries to run")
    parser.add_argument("--db", help="Path to memory database")
    parser.add_argument("--auto", action="store_true", help="Auto-rate using heuristic (no human input)")
    args = parser.parse_args()

    db_path = Path(args.db) if args.db else find_db()
    if not db_path or not db_path.exists():
        print("❌ Memory database not found. Use --db PATH")
        sys.exit(1)

    conn = sqlite3.connect(str(db_path))
    ensure_retrieval_log(conn)

    queries = sample_queries(conn, args.queries)
    if not queries:
        print("❌ No memories found to generate queries from.")
        sys.exit(1)

    print(f"📊 Memory Retrieval Assessment — {len(queries)} queries")
    print(f"   Database: {db_path}")
    print(f"   Mode: {'auto-heuristic' if args.auto else 'interactive'}")
    print()

    all_rars = []
    all_mrrs = []
    all_latencies = []

    for i, q in enumerate(queries):
        print(f"─── Query {i+1}/{len(queries)} ───")
        print(f"  Query: \"{q['query']}\"")
        print(f"  Source type: {q['source_type']}")
        
        results, latency = run_recall(conn, q["query"])
        all_latencies.append(latency)
        
        print(f"  Latency: {latency:.1f}ms")
        print(f"  Results: {len(results)}")
        
        if not results:
            print("  (no results)")
            conn.execute(
                "INSERT INTO retrieval_log (query, strategy, result_count, avg_score, latency_ms, rar, mrr, ratings) "
                "VALUES (?, 'hybrid', 0, NULL, ?, 0, 0, '[]')",
                (q["query"], latency)
            )
            continue

        ratings = []
        for j, r in enumerate(results[:5]):
            content_preview = r.get("content", str(r))[:80] if isinstance(r, dict) else str(r)[:80]
            
            if args.auto:
                # Heuristic: score based on returned similarity/importance
                score = r.get("score", r.get("importance", 0.5)) if isinstance(r, dict) else 0.5
                rating = 5 if score > 0.7 else 4 if score > 0.5 else 3 if score > 0.3 else 2 if score > 0.1 else 1
            else:
                print(f"    [{j+1}] {content_preview}...")
                while True:
                    try:
                        rating = int(input(f"    Rate relevance (1-5, 0=skip): ") or "0")
                        if 0 <= rating <= 5:
                            break
                    except (ValueError, EOFError):
                        rating = 0
                        break
                if rating == 0:
                    continue
            
            ratings.append(rating)

        rar, mrr = compute_metrics(ratings)
        avg_score = round(sum(ratings) / len(ratings), 2) if ratings else 0
        all_rars.append(rar)
        all_mrrs.append(mrr)

        print(f"  RAR: {rar:.2f} | MRR: {mrr:.2f} | Avg rating: {avg_score}")
        
        conn.execute(
            "INSERT INTO retrieval_log (query, strategy, result_count, avg_score, latency_ms, rar, mrr, ratings) "
            "VALUES (?, 'hybrid', ?, ?, ?, ?, ?, ?)",
            (q["query"], len(results), avg_score, latency, rar, mrr, json.dumps(ratings))
        )
    
    conn.commit()
    conn.close()

    # Summary
    print()
    print("═══ SUMMARY ═══")
    if all_rars:
        print(f"  Recall Accuracy Ratio (RAR): {sum(all_rars)/len(all_rars):.3f}")
    if all_mrrs:
        print(f"  Mean Reciprocal Rank (MRR):  {sum(all_mrrs)/len(all_mrrs):.3f}")
    if all_latencies:
        print(f"  Avg latency:                 {sum(all_latencies)/len(all_latencies):.1f}ms")
        print(f"  P95 latency:                 {sorted(all_latencies)[int(len(all_latencies)*0.95)]:.1f}ms")
    print(f"  Queries assessed:            {len(queries)}")
    print()
    print("✅ Results saved to retrieval_log table.")
    print("   Run `collect.py` to generate the submission report.")

if __name__ == "__main__":
    main()
