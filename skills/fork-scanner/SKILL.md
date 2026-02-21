---
name: fork-scanner
version: 1.0.0
description: "Analyze thousands of GitHub forks using a three-tier funnel strategy to find valuable changes, patches, and innovations worth upstreaming."
---

# Fork Scanner

Efficiently analyze GitHub forks at scale using a tiered funnel approach.

## Features

- **Tier 1 — Metadata**: Filter 28K+ forks by activity, stars, commits ahead
- **Tier 2 — Commits**: Analyze commit messages and patterns on promising forks
- **Tier 3 — Diffs**: Deep diff analysis on high-value forks to extract gems
- **Watchlist**: Track forks producing ongoing valuable changes
- **Reports**: Generate MD/CSV/JSON/PDF reports
- **Rate Limiting**: Respects GitHub API limits with automatic backoff
- **SQLite Storage**: Incremental processing with crash recovery

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Initialize database
sqlite3 forks.db < schema.sql

# Run full scan
python3 scripts/fork_scanner.py --repo openclaw/openclaw --tier 1
python3 scripts/fork_scanner.py --repo openclaw/openclaw --tier 2
python3 scripts/fork_scanner.py --repo openclaw/openclaw --tier 3

# Generate report
python3 scripts/reporter.py --format md
```

## Architecture

```
28,000 forks
    │ Tier 1: metadata filter (stars, commits, activity)
    ▼
  ~500 active forks
    │ Tier 2: commit message analysis
    ▼
  ~50 interesting forks
    │ Tier 3: full diff analysis
    ▼
  ~10 gems (valuable changes to review/upstream)
```

## Integration

Works standalone or as an OpenClaw cron task for daily fork monitoring.
