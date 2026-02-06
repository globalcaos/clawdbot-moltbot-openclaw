# AI Council Strategy

*How JarvisOne orchestrates multiple AI systems.*

---

## The Council

We treat AI platforms as specialized staff, not interchangeable tools.

| Role | Platform | Specialty |
|------|----------|-----------|
| **Architect** | Claude Opus 4.5 | Reasoning, coding, strategy |
| **Analyst** | ChatGPT / Grok | Deep Research modes (agentic) |
| **Librarian** | Perplexity | Quick facts, citations |
| **Builder** | Manus | Execution, automation |
| **Consultant** | Qwen | Second opinions, bulk work |
| **Artist** | Gemini (Nano Banana) | Image generation |

---

## Task Routing

| Task Type | Primary | Fallback |
|-----------|---------|----------|
| Complex coding | Claude | Qwen (review) |
| Reasoning/logic | Claude | ChatGPT (o1) |
| Deep research | ChatGPT Deep Research | Grok DeepSearch |
| Quick facts | Perplexity | Grok |
| Current events | Grok (X data) | Perplexity |
| Build/execute | Manus | Claude (code gen) |
| Visuals | Gemini | Qwen |

---

## Failover Chain

```
Claude Opus 4.5  ──[rate limit]──▶  Gemini 3 Pro
       │                                  │
       └────────[both limited]────────────┘
                      │
                      ▼
              Wait / Manual fallback
```

Automatic failover logged for budget tracking.

---

## The Sandwich Pattern

For expensive Manus tasks:

```
Claude (cheap)  →  Manus (expensive)  →  Claude (cheap)
      │                   │                    │
  Clarify scope     ONE defined task      Refine output
  Define structure  With constraints      Follow-ups
```

**Cuts Manus costs by 50-70%**

---

## Budget Management

| Provider | Tracking Method |
|----------|-----------------|
| Claude | Internal token counter |
| Gemini | Internal token counter |
| Manus | Task logger + manual |

**Key insight:** No provider exposes cross-platform usage APIs. Internal tracking is the only solution.

---

## Manus Credit Optimization

### Cost Tiers
| Tier | Task Type | Credits |
|------|-----------|---------|
| 🟢 Low | Single-pass summary | 2-5 |
| 🟡 Medium | Multi-source research | 5-10 |
| 🟠 High | Competitive landscape | 10-20 |
| 🔴 Very high | Deep due diligence | 20-50 |
| 🔥 Killer | Vague "explore X" | 50+ |

### Reduction Tricks
- "Use at most N sources"
- "Stop once key points found"
- "Max 2 pages per source"
- Pre-structure output format
- Never: "Explore everything about X"

---

*This strategy applies across all OpenClaw work.*
