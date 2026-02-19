# Multi-Model Strategy

**Learned: 2026-02-02, refined 2026-02-03**

---

## Primary Chain (Real-Time Chat) — Updated 2026-02-19

1. **Claude Sonnet 4.6** — Primary (switched from Opus: same quality, 1/5 API cost)
2. **OpenAI GPT-4o** — First fallback
3. **Google Gemini 3 Pro Preview** — Second fallback

### Auth Order (Anthropic)

1. `anthropic:oauth` (Max 20x subscription — flat rate, replenishes) → try first
2. `anthropic:api` (API key — pay-per-use) → overflow only

### Failover Fix (2026-02-19)

The model-fallback mechanism was fundamentally broken — unclassified errors caused
an immediate `throw` that killed the agent even when fallback providers were available.
Fixed by removing the early throw in `src/agents/model-fallback.ts` (catch block).
Now ALL errors continue to the next candidate. Unclassified errors are logged with
`[model-fallback] UNCLASSIFIED error` for pattern detection.

**IMPORTANT**: After editing source, must clear build cache before rebuild:

```bash
rm -rf dist/.cache node_modules/.cache
pnpm build
openclaw gateway restart
```

## Parallel Processing

- **Manus** — Spawn for deep research, code projects, document analysis
- Works async (takes 5-60 seconds), results delivered when ready
- Use for: competitor research, technical analysis, code generation
- Cost: ~2-12 credits per task

## ChatGPT / Oracle Default

- **Coding / technical review:** GPT-5.3-Codex (released Feb 9, 2026 — "most capable agentic coding model")
- **General / research:** GPT-5.2 Pro
- Use via `oracle` CLI: `--model gpt-5.3-codex` or `--model gpt-5.2-pro`

## Decision Framework

| Task Type            | Best Model                        |
| -------------------- | --------------------------------- |
| Quick question       | Claude                            |
| Rate limited         | Auto-failover to Gemini           |
| Deep research        | Spawn Manus in parallel           |
| Long code project    | Manus or GPT-5.3-Codex via oracle |
| Large context window | Gemini                            |
| Vision/images        | Gemini                            |

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

_Oscar: "This makes you way smarter and way more useful."_

## API Monitoring Reality

| Provider | Usage API         | Our Solution         |
| -------- | ----------------- | -------------------- |
| Claude   | ❌ Requires Org   | Internal tracker     |
| Gemini   | ❌ None exists    | Internal tracker     |
| Manus    | ❌ Dashboard only | Task logger + manual |

**Key insight:** Internal tracking is the ONLY cross-provider solution that works.
