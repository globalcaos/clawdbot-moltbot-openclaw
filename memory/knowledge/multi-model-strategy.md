# Multi-Model Strategy

**Learned: 2026-02-02, refined 2026-02-03**

---

## Primary Chain (Real-Time Chat)

1. **Claude Opus 4.5** — Primary
2. **Gemini 3 Pro** — Fallback on rate limit

## Parallel Processing

- **Manus** — Spawn for deep research, code projects, document analysis
- Works async (takes 5-60 seconds), results delivered when ready
- Use for: competitor research, technical analysis, code generation
- Cost: ~2-12 credits per task

## Decision Framework

| Task Type | Best Model |
|-----------|------------|
| Quick question | Claude |
| Rate limited | Auto-failover to Gemini |
| Deep research | Spawn Manus in parallel |
| Long code project | Manus (better for multi-file) |
| Large context window | Gemini |
| Vision/images | Gemini |

## Multi-AI Orchestration Pattern

```
MANUS (research) → GEMINI (analyze) → CLAUDE (synthesize)
     ↓                    ↓                   ↓
  Raw data         Pattern finding      Real-time chat
```

**Key principles:**
1. Chain outputs: one AI's result feeds the next
2. Date everything for delta reports
3. Parallelize independent tasks
4. Save research for future updates

*Oscar: "This makes you way smarter and way more useful."*

## API Monitoring Reality

| Provider | Usage API | Our Solution |
|----------|-----------|--------------|
| Claude | ❌ Requires Org | Internal tracker |
| Gemini | ❌ None exists | Internal tracker |
| Manus | ❌ Dashboard only | Task logger + manual |

**Key insight:** Internal tracking is the ONLY cross-provider solution that works.
