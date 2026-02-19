#!/usr/bin/env python3
"""HIPPOCAMPUS CLI — Build index, lookup, and incremental update.

Usage:
    python3 -m hippocampus.cli build [--verbose]
    python3 -m hippocampus.cli lookup "query text" [--max N] [--json]
    python3 -m hippocampus.cli update --path FILE --content "text"
    python3 -m hippocampus.cli status
"""

import argparse
import json
import sys
import time
from pathlib import Path


def cmd_build(args):
    from .builder import build_index
    index = build_index(verbose=args.verbose)
    print(json.dumps({
        "status": "ok",
        "anchors": len(index),
        "total_chunks": sum(len(v) for v in index.values()),
    }))


def cmd_lookup(args):
    from .lookup import lookup, invalidate_cache
    if args.fresh:
        invalidate_cache()
    
    results = lookup(
        args.query,
        max_chunks=args.max,
        use_semantic=not args.lexical_only,
    )
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        if not results:
            print("No results.")
            return
        for i, r in enumerate(results[:args.max], 1):
            print(f"{i}. [{r['final_score']:.3f}] {r['path']}:{r.get('line', '?')}")
            print(f"   {r.get('preview', '')[:100]}")
        print(f"\n{len(results)} results, {results[0].get('lookup_ms', 0):.0f}ms")


def cmd_update(args):
    from .incremental import incremental_update
    
    if args.file:
        content = Path(args.file).read_text()
        source_path = args.file
    else:
        content = args.content or sys.stdin.read()
        source_path = args.path or "stdin"
    
    stats = incremental_update(content, source_path, verbose=args.verbose)
    print(json.dumps(stats))


def cmd_status(args):
    from .config import INDEX_PATH, EMBEDS_PATH, META_PATH
    
    status = {"index_exists": INDEX_PATH.exists()}
    
    if INDEX_PATH.exists():
        with open(INDEX_PATH) as f:
            index = json.load(f)
        status["anchors"] = len(index)
        status["total_entries"] = sum(len(v) for v in index.values())
        status["avg_entries_per_anchor"] = round(
            status["total_entries"] / max(len(index), 1), 1
        )
    
    if META_PATH.exists():
        with open(META_PATH) as f:
            meta = json.load(f)
        status.update(meta)
    
    status["embeds_exists"] = EMBEDS_PATH.exists()
    
    print(json.dumps(status, indent=2))


def main():
    parser = argparse.ArgumentParser(description="HIPPOCAMPUS CLI")
    sub = parser.add_subparsers(dest="command", required=True)
    
    # build
    p_build = sub.add_parser("build", help="Build full index")
    p_build.add_argument("-v", "--verbose", action="store_true")
    
    # lookup
    p_lookup = sub.add_parser("lookup", help="Query the index")
    p_lookup.add_argument("query", help="Search query")
    p_lookup.add_argument("--max", type=int, default=10)
    p_lookup.add_argument("--json", action="store_true")
    p_lookup.add_argument("--fresh", action="store_true", help="Invalidate cache first")
    p_lookup.add_argument("--lexical-only", action="store_true")
    
    # update
    p_update = sub.add_parser("update", help="Incremental update")
    p_update.add_argument("--file", help="File to index")
    p_update.add_argument("--path", help="Source path label")
    p_update.add_argument("--content", help="Content to index")
    p_update.add_argument("-v", "--verbose", action="store_true")
    
    # status
    sub.add_parser("status", help="Show index status")
    
    args = parser.parse_args()
    
    if args.command == "build":
        cmd_build(args)
    elif args.command == "lookup":
        cmd_lookup(args)
    elif args.command == "update":
        cmd_update(args)
    elif args.command == "status":
        cmd_status(args)


if __name__ == "__main__":
    main()
