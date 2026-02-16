---
name: memory-bench
description: Collect anonymized memory system benchmarks and submit them as PRs to the research fork. Use when measuring retrieval accuracy (RAR/MRR), token savings, consolidation quality, or submitting benchmark data for the ENGRAM/CORTEX research papers. Works with agent-memory-ultimate.
---

# Memory Bench

Collect, assess, and submit anonymized memory system statistics for the ENGRAM and CORTEX research papers.

## Three-Step Pipeline

### 1. Assess Retrieval Quality (optional but valuable)

Run retrieval queries and rate relevance to populate `retrieval_log`:

```bash
# Auto-rate using score heuristics (no human input needed)
python3 scripts/rate.py --queries 20 --auto

# Interactive rating (agent or human rates each result 1-5)
python3 scripts/rate.py --queries 10
```

This populates the `retrieval_log` table with RAR, MRR, and latency data that `collect.py` picks up.

### 2. Collect Statistics

```bash
# Generate anonymized report (14 days default)
python3 scripts/collect.py --contributor GITHUB_USER --days 14 --output /tmp/memory-bench-report.json

# Longer collection period for better data
python3 scripts/collect.py --contributor GITHUB_USER --days 30 --output /tmp/memory-bench-report.json
```

**What's collected (all anonymized):**

- Memory counts, type distribution, age distribution
- Strength and importance histograms
- Association graph size and types
- Hierarchy level counts
- Consolidation run history (counts, not content)
- Retrieval performance (RAR, MRR, latency) if `rate.py` was run
- Embedding coverage percentage
- System info (OS, arch — no hostname, no paths)

**What's NEVER collected:**

- Memory content, queries, file paths, usernames, personal data
- Instance ID is a one-way hash — cannot be reversed

### 3. Submit as PR

```bash
scripts/submit.sh /tmp/memory-bench-report.json GITHUB_USERNAME
```

This automatically:

1. Forks the research repo (if needed)
2. Creates a branch `bench/USERNAME-TIMESTAMP`
3. Places the report in `benchmarks/memory-bench/reports/`
4. Updates the aggregate INDEX.json
5. Opens a PR with a formatted summary

**Prerequisites:** `gh` CLI authenticated (`gh auth login`).

## Agent Workflow

When a user asks to submit benchmarks or contribute to the papers:

1. Run `rate.py --auto --queries 20` to populate retrieval metrics
2. Run `collect.py` with their GitHub username
3. Show them the report summary (memory count, RAR, MRR)
4. Run `submit.sh` to create the PR
5. Share the PR link

## Report Schema (v1.0.0)

```
{
  schema_version, collected_at, collection_period_days,
  contributor, instance_id (hashed),
  system: { os, arch, python, node },
  memory_stats: {
    memories: { total_active, total_deleted, type_distribution, age_distribution,
                strength_histogram, importance_histogram, embedding_coverage },
    associations: { total, type_distribution },
    hierarchy: { levels },
    consolidation: { recent_runs[], total_runs_in_period },
    sharing: { total_shared }
  },
  retrieval_stats: {
    available, total_queries,
    by_strategy: { [name]: { query_count, avg_score, avg_latency_ms, p95_latency_ms, avg_results } }
  },
  token_stats: { available, [provider]: { total_tokens, total_cost_usd, sessions } }
}
```
