#!/usr/bin/env python3
"""
mem.py — Cognitive Memory CLI for OpenClaw agents

Usage:
    mem.py store <content> [--type TYPE] [--source SOURCE] [--importance N]
    mem.py recall <query> [--strategy hybrid|vector|keyword] [--limit N]
    mem.py forget <id|--query QUERY>
    mem.py hard-delete <id>
    mem.py stats
    mem.py consolidate [--days N] [--decay-only]
    mem.py init
    mem.py migrate  (migrate existing jarvis.db documents)

Examples:
    mem.py store "Oscar prefers wired home automation" --type semantic --importance 0.8
    mem.py recall "home automation preferences"
    mem.py recall "PRIVACY.md" --strategy keyword
    mem.py forget --query "that old project"
    mem.py stats
"""
import sys
import os
import json
import time
import logging

# Add parent to path for lib imports
sys.path.insert(0, os.path.dirname(__file__))

from lib.memory_core import (
    get_conn, init_db, store, recall, forget, hard_delete, stats,
    apply_decay, consolidate,
    WORKSPACE, DB_PATH
)

logging.basicConfig(
    level=logging.DEBUG if "--verbose" in sys.argv else logging.WARNING,
    format="%(levelname)s %(message)s"
)

def cmd_init():
    conn = get_conn()
    init_db(conn)
    s = stats(conn)
    print(f"✓ Database initialized at {s['db_path']}")
    print(f"  Active memories: {s['total_active']}")
    conn.close()

def cmd_store(args):
    if not args:
        print("Usage: mem.py store <content> [--type TYPE] [--source SOURCE] [--importance N]")
        sys.exit(1)

    # Parse flags
    content_parts = []
    mem_type = "episodic"
    source = "agent"
    importance = 0.5

    i = 0
    while i < len(args):
        if args[i] == "--type" and i + 1 < len(args):
            mem_type = args[i + 1]; i += 2
        elif args[i] == "--source" and i + 1 < len(args):
            source = args[i + 1]; i += 2
        elif args[i] == "--importance" and i + 1 < len(args):
            importance = float(args[i + 1]); i += 2
        else:
            content_parts.append(args[i]); i += 1

    content = " ".join(content_parts)
    if not content:
        print("Error: no content provided")
        sys.exit(1)

    conn = get_conn()
    init_db(conn)
    t0 = time.time()
    mid = store(conn, content, memory_type=mem_type, source=source, importance=importance)
    elapsed = (time.time() - t0) * 1000
    print(f"✓ Stored memory #{mid} ({mem_type}, importance={importance}) [{elapsed:.0f}ms]")
    conn.close()

def cmd_recall(args):
    if not args:
        print("Usage: mem.py recall <query> [--strategy hybrid|vector|keyword] [--limit N]")
        sys.exit(1)

    query_parts = []
    strategy = "hybrid"
    limit = 10

    i = 0
    while i < len(args):
        if args[i] == "--strategy" and i + 1 < len(args):
            strategy = args[i + 1]; i += 2
        elif args[i] == "--limit" and i + 1 < len(args):
            limit = int(args[i + 1]); i += 2
        else:
            query_parts.append(args[i]); i += 1

    query = " ".join(query_parts)
    conn = get_conn()
    init_db(conn)

    t0 = time.time()
    results = recall(conn, query, strategy=strategy, limit=limit)
    elapsed = (time.time() - t0) * 1000

    if not results:
        print(f"No memories found for '{query}' ({strategy}) [{elapsed:.0f}ms]")
    else:
        print(f"Found {len(results)} memories ({strategy}) [{elapsed:.0f}ms]:\n")
        for r in results:
            score = r.get('score', 0)
            mtype = r.get('memory_type', '?')
            strength = r.get('strength', 0)
            content = r.get('content', '')
            # Truncate long content
            if len(content) > 120:
                content = content[:117] + "..."
            print(f"  #{r['id']:>4}  [{mtype:10s}]  str={strength:.2f}  score={score:.3f}")
            print(f"        {content}")
            print()

    conn.close()

def cmd_forget(args):
    conn = get_conn()
    init_db(conn)

    if args and args[0] == "--query":
        query = " ".join(args[1:])
        count = forget(conn, query=query)
        print(f"✓ Soft-deleted {count} memories matching '{query}'")
    elif args and args[0].isdigit():
        mid = int(args[0])
        forget(conn, memory_id=mid)
        print(f"✓ Soft-deleted memory #{mid}")
    else:
        print("Usage: mem.py forget <id> | mem.py forget --query <text>")
        sys.exit(1)
    conn.close()

def cmd_hard_delete(args):
    if not args or not args[0].isdigit():
        print("Usage: mem.py hard-delete <id>")
        sys.exit(1)
    conn = get_conn()
    init_db(conn)
    ok = hard_delete(conn, int(args[0]))
    print(f"✓ Hard-deleted memory #{args[0]}" if ok else f"Memory #{args[0]} not found")
    conn.close()

def cmd_stats():
    conn = get_conn()
    init_db(conn)
    s = stats(conn)
    print(f"╔══════════════════════════════════════╗")
    print(f"║       COGNITIVE MEMORY STATS         ║")
    print(f"╠══════════════════════════════════════╣")
    print(f"║  Active memories:  {s['total_active']:>6}            ║")
    print(f"║  Deleted (soft):   {s['total_deleted']:>6}            ║")
    print(f"║  With embeddings:  {s['with_embeddings']:>6}            ║")
    print(f"║  DB size:          {s['db_size_kb']:>6} KB         ║")
    print(f"║──────────────────────────────────────║")
    for mtype, count in sorted(s.get('by_type', {}).items()):
        print(f"║  {mtype:<18} {count:>6}            ║")
    print(f"╚══════════════════════════════════════╝")
    print(f"  Path: {s['db_path']}")
    conn.close()

def cmd_consolidate(args):
    """Run consolidation: decay + clustering + summaries."""
    days = 1
    decay_only = False
    i = 0
    while i < len(args):
        if args[i] == "--days" and i + 1 < len(args):
            days = int(args[i + 1]); i += 2
        elif args[i] == "--decay-only":
            decay_only = True; i += 1
        else:
            i += 1

    conn = get_conn()
    init_db(conn)

    if decay_only:
        result = apply_decay(conn)
        print(f"╔══════════════════════════════════════╗")
        print(f"║          DECAY RESULTS               ║")
        print(f"╠══════════════════════════════════════╣")
        print(f"║  Decayed:     {result['decayed']:>6}                ║")
        print(f"║  Soft-deleted:{result['deleted']:>6}                ║")
        print(f"║  Unchanged:   {result['unchanged']:>6}                ║")
        print(f"╚══════════════════════════════════════╝")
    else:
        print(f"Running consolidation (last {days} day{'s' if days > 1 else ''})...")
        result = consolidate(conn, days=days)
        d = result['decay']
        print(f"╔══════════════════════════════════════╗")
        print(f"║       CONSOLIDATION RESULTS          ║")
        print(f"╠══════════════════════════════════════╣")
        print(f"║  Decay:                              ║")
        print(f"║    Decayed:     {d['decayed']:>6}              ║")
        print(f"║    Soft-deleted:{d['deleted']:>6}              ║")
        print(f"║    Unchanged:   {d['unchanged']:>6}              ║")
        print(f"║──────────────────────────────────────║")
        print(f"║  Clustering:                         ║")
        print(f"║    Clusters:    {result['clusters_found']:>6}              ║")
        print(f"║    Summaries:   {result['summaries_created']:>6}              ║")
        print(f"║──────────────────────────────────────║")
        print(f"║  Elapsed:     {result['elapsed_ms']:>6} ms            ║")
        print(f"╚══════════════════════════════════════╝")

    conn.close()

def cmd_migrate():
    """Migrate existing jarvis.db documents into memory.db."""
    old_db = WORKSPACE / "db" / "jarvis.db"
    if not old_db.exists():
        print(f"No jarvis.db found at {old_db}")
        return

    import sqlite3 as s3
    old_conn = s3.connect(str(old_db))
    old_conn.row_factory = s3.Row

    docs = old_conn.execute("SELECT * FROM documents WHERE content IS NOT NULL").fetchall()
    print(f"Found {len(docs)} documents in jarvis.db")

    conn = get_conn()
    init_db(conn)

    migrated = 0
    for doc in docs:
        content = doc['content']
        if not content or len(content.strip()) < 10:
            continue
        title = doc['title'] or ''
        dtype = doc['type'] or 'document'
        # Combine title + content for richer embedding
        full = f"{title}\n{content}" if title else content
        # Truncate very long docs to first 2000 chars for embedding
        embed_text = full[:2000]
        try:
            mid = store(conn, embed_text, memory_type="semantic",
                       source=f"import:jarvis.db:{dtype}",
                       importance=0.6,
                       metadata={"original_path": doc['path'], "original_id": doc['id']})
            migrated += 1
            if migrated % 20 == 0:
                print(f"  ... migrated {migrated}/{len(docs)}")
        except Exception as e:
            print(f"  ⚠ Failed to migrate doc #{doc['id']}: {e}")

    print(f"✓ Migrated {migrated} documents into memory.db")
    old_conn.close()
    conn.close()

def main():
    args = [a for a in sys.argv[1:] if a != "--verbose"]
    if not args:
        print(__doc__)
        sys.exit(0)

    cmd = args[0]
    rest = args[1:]

    if cmd == "init":
        cmd_init()
    elif cmd == "store":
        cmd_store(rest)
    elif cmd == "recall":
        cmd_recall(rest)
    elif cmd == "forget":
        cmd_forget(rest)
    elif cmd == "hard-delete":
        cmd_hard_delete(rest)
    elif cmd == "stats":
        cmd_stats()
    elif cmd == "consolidate":
        cmd_consolidate(rest)
    elif cmd == "migrate":
        cmd_migrate()
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main()
