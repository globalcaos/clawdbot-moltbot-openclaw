# OpenClaw Self-Improvement

_JarvisOne's evolution: memory, UI, security, and features._

**📖 Cross-cutting docs:**

- [ai-council.md](./ai-council.md) — Multi-AI orchestration strategy
- [history.md](./history.md) — Complete timeline

---

## Purpose

Continuous improvement of the OpenClaw system — my own capabilities, interface, and intelligence.

## Sprints / Focus Areas

| Sprint                                                      | Description                                       | Status  |
| ----------------------------------------------------------- | ------------------------------------------------- | ------- |
| [memory-system](./memory-system/index.md)                   | Entity pages, session indexing, hybrid search     | 🟢 Open |
| [ui-improvements](./ui-improvements/index.md)               | Minimal UI, compact displays, information density | 🟢 Open |
| [security](./security/index.md)                             | Code enforcement, layered security, user control  | 🟢 Open |
| [webchat-fixes](./webchat-fixes/index.md)                   | /new, /reset, session handling                    | 🟢 Open |
| [attention-optimization](./attention-optimization/index.md) | Mitigating instruction decay, prompt engineering  | 🟢 Open |

## Key Decisions

- **2026-02-02:** Code enforcement > documentation for rules
- **2026-02-02:** Minimal UI philosophy adopted
- **2026-02-03:** Memory system upgrade (Letta/MemGPT inspired)
- **2026-02-03:** Multi-AI orchestration pattern established
- **2026-02-04:** Project-based memory organization
- **2026-02-04:** AURORA protocol imported (full technical output, never NO_REPLY)
- **2026-02-04:** Attention optimization research — "distant instructions decay"
- **2026-02-04:** Custom WhatsApp store created to replace removed `makeInMemoryStore` (Baileys v7)
- **2026-02-06:** Fixed DM sender attribution + senderE164 resolution
- **2026-02-06:** Discovered SIGUSR1 hot-reload limitation (config only, not compiled JS)
- **2026-02-06:** Documented WhatsApp multi-device sync limitation (outbound phone messages async)
- **2026-02-08:** Completed fork sync (519+ upstream commits, 1563 files)
- **2026-02-08:** Pre-merge checklist established after conflict marker disaster
- **2026-02-08:** Created Manus plugin + budget-panel plugin (both had manifest crashes)
- **2026-02-08:** Plugin disable procedure: ONLY use `enabled: false` in config
- **2026-02-08:** Claude Max OAuth usage API cracked — real-time usage tracking
- **2026-02-08:** Clean fork strategy: Skills→ClawHub, features→PR upstream, hacks→plugins
- **2026-02-08:** Gemini 6-model fallback chain configured
- **2026-02-08:** Claude Max upgrade (Pro→Max, 20x usage)
- **2026-02-09:** Fixed /new button race condition (UI cleared before server finished)
- **2026-02-09:** Confirmed SIGUSR1 limitation again — code changes need full restart
- **2026-02-09:** Found pi-coding-agent stale build artifact causing cold start crash
- **2026-02-10:** marked.parse() freeze HIT THIRD TIME — upstream merge (`--theirs`) wiped the Feb 9 try/catch fix
- **2026-02-10:** Proper fix: `looksLikeRawJson()` detection bypasses marked for raw JSON content + try/catch as backup
- **2026-02-10:** Established fork maintenance strategy: FORK_PATCHES.md, never `--theirs`, post-merge verification
- **2026-02-10:** Diagnostic technique: strategic console.log at init stages → pinpoints freeze in one rebuild

## Related Files

- [MEMORY.md](../../../MEMORY.md) — Long-term memory gateway
- [TOOLS.md](../../../TOOLS.md) — Tool configuration and notes

---

_Last updated: 2026-02-04_
