# The Pharaonic Task Pattern

**Created:** 2026-02-08
**Origin:** Fork analysis problem (28,667 repos to scan)

---

## The Problem Class

Tasks that seem impossible due to sheer scale:
- Thousands of repos to analyze
- Millions of records to process
- Vast search spaces to explore

**The naive approach fails:** Brute force exhausts time, tokens, disk, or API limits.

---

## The Solution: Tiered Funnel Strategy

```
VAST INPUT (N = huge)
       │
       ▼ TIER 1: Cheap Filter (API/metadata only)
N / 10 candidates
       │
       ▼ TIER 2: Medium Analysis (still no heavy I/O)
N / 100 interesting
       │
       ▼ TIER 3: Expensive Deep Dive (clone/download/process)
N / 1000 gems
       │
       ▼ TIER 4: Human Review
Cherry-pick winners
```

### Design Principles

1. **Filter before you fetch** — Use metadata to eliminate 90% before expensive operations
2. **Score and rank** — Not all candidates are equal; prioritize by signal
3. **Incremental processing** — Track progress, resume from interruption
4. **Cache everything** — SQLite for metadata, don't re-fetch known data
5. **Rotate resources** — Clone to temp, analyze, delete; don't accumulate
6. **Respect limits** — API rate limits, disk quotas, token budgets
7. **Parallelize carefully** — Concurrent operations within safe bounds

### The Constraint Triangle

```
        Thoroughness
           /\
          /  \
         /    \
        /      \
    Cost ────── Speed
```

You can optimize for two, but the third suffers. The funnel approach maximizes thoroughness while controlling cost, accepting that speed is "good enough" (hours, not minutes).

---

## Resource Estimation Template

Before starting a pharaonic task, fill this out:

| Tier | Items | API Calls | Time | Disk | Tokens |
|------|-------|-----------|------|------|--------|
| 1: Filter | N | ? | ? | 0 | ? |
| 2: Analyze | N/10 | ? | ? | 0 | ? |
| 3: Deep | N/100 | 0 | ? | rotating | ? |
| 4: Review | N/1000 | 0 | human | 0 | ? |
| **Total** | — | ? | ? | peak | ? |

---

## Implementation Patterns

### Caching Layer (SQLite)
```python
# Track what we've already processed
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    last_checked INTEGER,
    score REAL,
    tier_reached INTEGER
);
```

### Incremental Processing
```python
# Only process items not checked recently
cutoff = time.time() - (7 * 24 * 3600)  # 7 days
pending = db.execute(
    "SELECT * FROM items WHERE last_checked < ? OR last_checked IS NULL",
    (cutoff,)
)
```

### Rotating Resources
```python
import tempfile
import shutil

with tempfile.TemporaryDirectory() as tmpdir:
    clone_repo(url, tmpdir)
    analyze(tmpdir)
    # Auto-deleted when context exits
```

### Rate Limit Respect
```python
import time

def rate_limited_request(url, requests_per_hour=5000):
    delay = 3600 / requests_per_hour  # seconds between requests
    time.sleep(delay)
    return requests.get(url)
```

---

## Watchlist Pattern

For recurring analysis, maintain a watchlist of high-value items:

```python
# Always include these in deep analysis, regardless of tier filtering
watchlist = load_watchlist("watchlist.json")
tier3_candidates = tier2_results + watchlist
```

Update watchlist based on:
- Items that yielded gems in the past
- Items with high activity
- Items explicitly flagged by human

---

## When to Apply This Pattern

✅ **Good fit:**
- GitHub fork analysis
- Large dataset exploration
- API-bound research tasks
- Log/event analysis across many sources

❌ **Not a fit:**
- Real-time requirements
- Tasks where every item MUST be checked
- Small datasets (just brute force it)

---

## Meta-Lesson

> *"The art of the impossible is knowing which 99% to skip."*

Pharaonic tasks become tractable when you accept that:
1. Not everything needs deep analysis
2. Signals exist to guide prioritization
3. Good enough beats perfect but never finished

---

*This pattern saved us from analyzing 28,667 repos manually. Apply it to any task that feels "too big."*
