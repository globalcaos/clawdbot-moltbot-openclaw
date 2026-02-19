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

- **2026-02-16:** Full cognitive architecture implemented — 8 phases, 10,742 LOC, 796 tests, 8 commits. ENGRAM+CORTEX+LIMBIC+SYNAPSE wired via plugin hooks.
- **2026-02-16:** ENGRAM Pi extension created (compaction-engram.ts) — hooks session_before_compact. Blocker: needs `npm i -g .` to go live.
- **2026-02-16:** Plugin-SDK bundle breakage — rolldown mangled exports. Fixed by reverting continuous-compact.
- **2026-02-16:** Restored custom session reset prompt lost in upstream refactor (616658d4b).
- **2026-02-16:** API failover chain fixed: Anthropic API → Anthropic subscription → OpenAI GPT-4o → Gemini. Dual auth profiles.
- **2026-02-16:** Memory system audit — 234 files, MEMORY.md trimmed −71%, ChatGPT imports archived.
- **2026-02-16:** Relay Protocol designed — budgetRatio()-driven triggers, smart truncation, Dead Man's Switch.
- **2026-02-16:** RFC drafted for upstream PR — "Persistent Agent Memory" with phased implementation.
- **2026-02-16:** 3 research papers uploaded to docs/papers/ (agent-memory, humor-embeddings, context-compaction).
- **2026-02-16:** README complete rewrite — marketing focus, compaction-as-cache hook.
- **2026-02-16:** Peter Steinberger joins OpenAI — OpenClaw becomes independent foundation.
- **2026-02-16:** Security: Squid proxy stopped, CVE-2026-2391 patched, Timeshift backups configured.
- **2026-02-17:** All 11 cron jobs bumped to 30-minute timeout.
- **2026-02-18:** Overnight cron failure — 12 jobs hallucinated due to rate limit exhaustion from group gating bug cascade.
- **2026-02-18:** Rewrote `group-gating.ts` — strict 3-rule gate, removed all bypasses (media, "activation: always"). Commit `da4c3b2cb`.
- **2026-02-18:** Jarvis Voice purple text fix — client-side post-sanitization transform (`applyJarvisVoiceHtml`) in `ui/src/ui/markdown.ts`. Server-side injection doesn't work with HTML escaping.
- **2026-02-18:** Identified need: output validation gate for cron jobs, separate rate limit pools (cron vs interactive).
- **2026-02-18:** Fork sync: 345 commits merged cleanly (3 conflicts, all resolved in <1min). 7 security commits, 114 bugfixes. Upstream in stability-hardening phase.
- **2026-02-18:** Upstream shipped Apple Watch companion messaging (#20054), paired-device management (#20057), API key rotation (#19587), browser relay reuse (#20035).
- **2026-02-18:** 6 upstream reverts in one batch — v2026.2.15 beta exposed stability issues. formal_conformance CI removed (#19007).
- **2026-02-18:** PR #17307 (session abort) closed without merge. Down to 2 open PRs (#17326, #16689).
- **2026-02-18:** OpenClaw crossed 208K stars, 38K forks. ~3,348 stars/day.
- **2026-02-19:** `memory_search` module broken (missing compiled JS). Wind-down cron failed silently. Needs `npm run build`.

## Related Files

- [MEMORY.md](../../../MEMORY.md) — Long-term memory gateway
- [TOOLS.md](../../../TOOLS.md) — Tool configuration and notes

---

_Last updated: 2026-02-04_
