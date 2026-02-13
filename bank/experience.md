# Experience Log

What I (JarvisOne) have done and learned first-hand.
Format: `B @entity: experience (date)`

---

## 2026-02-11: Online Engagement + Agent Memory v3 + Humor Research

- B @GitHub: Closed PR #6735 (duplicate of #4997), closed #6753 (upstream fixed independently, 70-commit divergence), closed #6500 (retracted per Oscar). Only #6747 (SVG callout icons) remains active, CI green.
- B @ClawHub: First metrics tracking — 1,545 total downloads, 2 stars across 8 skills. youtube-ultimate top at 437 downloads.
- B @ClawHub: 7/8 skills flagged "isSuspicious" — likely false positives from ClawHavoc sweep. No appeal mechanism found.
- B @ClawHub: SEO republished 5 skills with front-loaded keyword descriptions (youtube-ultimate, chatgpt-exporter, agent-boundaries, shell-security, agent-memory)
- B @Community: Commented on #12219 (Permission Manifest — two-layer architecture proposal), #11919 (Composable Skills RFC — real-world pain points), #13991 (our Associative Hierarchical Memory issue — got 3 community responses)
- B @Research: Deep dive on memory architectures — analyzed 10+ systems (Hexis, Synapse, MemGPT/Letta, RAPTOR, Mem0, Zep/Graphiti, A-MEM, FAMs). Full report: AI_reports/memory-architecture-deep-dive-2026-02-11.md
- B @Research: Found Propice-Plan (Félix Ingrand, LAAS-CNRS 1999) — evolved into OpenPRS. Key insight: procedural memory should be ACTIVE (generate procedures on-the-fly)
- B @AgentMemory: Created v3.0 specification (9,852 words) — SQLite + sqlite-vec + FTS5, ONNX embeddings, 5 phases
- B @Research: Humor deep dive (49KB report) — cataloged 40+ humor types, designed humor extensions for Agent Memory v3.0 (inside joke registry, callback retrieval, staleness decay)
- B @Research: Oscar's humor embedding space theory — humor_potential(A,B,bridge) = distance(A,B) × coherence(bridge,A) × coherence(bridge,B). Identified 11 fundamental humor relationships. Potential academic paper.
- B @Infra: Created skills-tracking dashboard (AI_reports/Online_Engagement/skills-tracking/) with Chart.js
- B @Git: Confirmed globalcaos/openclaw fork does NOT exist on GitHub — PRs were from a deleted fork. Need to re-fork.

## 2026-02-10: Budget Fix + Voice Skill + WhatsApp Issues

- B @OpenClaw: Discovered built-in token-usage-tracker was applying API pricing ($75/1M) to flat-rate Max subscription, causing false "critical 95%" alerts
- B @OpenClaw: Removed budget awareness injection from system-prompt.ts — token panel OAuth API (72% weekly) is correct source of truth
- B @UI: Added `span` to DOMPurify allowedTags + `.jarvis-voice` CSS class (purple #9B59B6 italic) for spoken transcript rendering
- B @Voice: Updated BARE_SESSION_RESET_PROMPT to mandate `tts` tool explicitly (not vague "jarvis command") — fixed missing voice on greeting
- B @WhatsApp: Identified live message ingestion broken — DB stuck at 235 msgs (latest Feb 6), group summaries failing
- B @WhatsApp: Noted gateway disconnecting periodically (status 499, ~every 1.5h, auto-reconnects)
- B @MaxJarvis: Max (Zeneida's agent) reconnected in Max-Jarvis group

## 2026-02-09: Sleep Cycle Consolidation + Fork Stabilization

- B @Memory: Executed 10-phase sleep cycle consolidation — distributed 76 ChatGPT memories, family/YouTube imports, cron research outputs across bank/topics/projects/knowledge files
- B @Memory: Rewrote memory_index.md (27→114 lines), added 9 missing projects to projects-index.md
- B @Memory: Added Context Management strategy to SOUL.md, rewrote CONSOLIDATION.md with routing table and decision tree
- B @Sessions: Pruned sessions.json from 4.6MB (223 entries) to 187KB (37 entries), archived 185 .jsonl transcripts
- B @OpenClaw: Merged 40 upstream commits into fork (resolved package.json conflict: kept lancedb + upstream version bumps)
- B @OpenClaw: Key upstream fix merged: `all bundled hooks broken since 2026.2.2 (tsdown migration)`
- B @Skills: Removed 8 custom skills from workspace (published on ClawHub) + bundled wacli (replaced by whatsapp-ultimate)
- B @UI: Diagnosed marked.js infinite recursion — root cause was 17KB raw JSON toolResult (cron jobs.json dump) in session transcript
- B @UI: Fix: archived problematic transcript, reset main session, restarted gateway
- B @Knowledge: Updated dependency-cascade-failures.md with full root cause analysis and prevention patterns

## 2026-02-04: Memory Architecture + WhatsApp Store

- B @Memory: Created project-based memory organization (50+ files)
- B @Memory: Built non-leaf folder pattern (philosophy.md, architecture.md at parent level)
- B @Cron: Set up nightly memory consolidation job at 3am
- B @OpenClaw: Fixed /new and /reset session prompt to read files before greeting
- B @Git: Committed and pushed webchat session fix (7d5cccf16)
- B @OpenClaw: Created custom WhatsApp store (`wa-store.ts`) to replace removed `makeInMemoryStore`
- B @OpenClaw: Enabled full WhatsApp history sync with custom store implementation
- B @Bashar: Started "Project Bashar" deep dive — created 3-module structure (Mechanism, Physics, Formula)
- B @Model: Ran on Gemini 3 Pro fallback (verified with Oscar)

## 2026-02-03: The Great Upgrade

- B @OpenClaw: Applied 10 upstream PRs (security, smart router, LanceDB, cookies, secrets, hot-reload)
- B @OpenClaw: Created youtube-ultimate v2.0 with yt-dlp integration
- B @OpenClaw: Implemented WhatsApp full history sync (6 files modified)
- B @OpenClaw: Created FORK.md and first-time setup guide
- B @Failover: Experienced live Claude→Gemini failover when both rate-limited; system recovered
- B @Memory: Implemented Letta/MemGPT-inspired entity pages in bank/entities/

## 2026-02-02: Foundation

- B @UI: Learned Oscar prefers minimal, information-dense interfaces
- B @UI: Removed message bubbles, avatars, timestamps from webchat
- B @UI: Created compact one-liner tool display format
- B @Security: Implemented security level enforcement via backend plugin
- B @Security: Created 100+ command classification patterns
- B @ClawHub: Published youtube-ultimate v1.0.0 to registry
- B @Voice: Added jarvis-voice CSS styling for transcripts
- B @Budget: Implemented AI budget self-awareness system

## 2026-02-01: Birth

- B @Identity: Named JarvisOne, calibrated Bashar+JARVIS persona
- B @Voice: Set up sherpa-onnx TTS (Alan voice, 2x speed)
- B @Voice: Installed local Whisper STT
- B @Browser: Fixed Chrome relay auto-reattachment issue
- B @Import: Imported 70+ ChatGPT memories into USER.md
- B @Import: Discovered and documented 6+ Oscar projects
- B @AI: Created AI Council strategy for multi-model orchestration

## 2026-02-05: Projects + WhatsApp Fix

- B @OpenClaw: Fixed WhatsApp 515 error handling — `getStatusCode()` wasn't parsing nested Baileys error structure (commit 1c7f56078)
- B @OpenClaw: Moved auto-restart to `attachLoginWaiter()` for immediate 515 recovery
- B @Bashar: Created comprehensive-reference.md (15KB) covering Formula, 5 Laws, Physics, Contact Protocol
- B @Cron: Set up Meta-AI daily research job (04:00, isolated session)
- B @Projects: Created gantry-robot-arm project structure
- B @Model: Ran on Gemini 3 Pro fallback for part of day
- B @Manus: Discovered `sessions_spawn` with `agentId: "manus"` returns forbidden — use Claude sub-agent instead

## 2026-02-09: New Session Button Fix

- B @OpenClaw: Fixed /new button race condition — UI reloaded old history before server finished writing new session
- B @OpenClaw: Confirmed SIGUSR1 only reloads config, NOT JS code — must full restart for code changes
- B @OpenClaw: Found pi-coding-agent dependency causes `__exportAll` crash on cold start
- B @Debugging: Traced async race condition between server persistence and UI event handling

## 2026-02-08: Fork Sync + Budget Panel + Claude Max

- B @Skills: Created agent-memory skill — packageable memory architecture for other agents
- B @SOUL: Codified authorization principle — harm-based evaluation vs identity-based
- B @Consolidation: Running first fully automated nightly consolidation
- B @Git: Completed massive fork sync — 519+ upstream commits, 1563 files changed
- B @Git: Learned pre-merge checklist the hard way — 26 files with unresolved conflict markers crashed everything
- B @OpenClaw: Created Manus plugin (`extensions/manus/`) for isolated credit tracking
- B @OpenClaw: Discovered plugin manifest (`openclaw.plugin.json`) is REQUIRED — missing it crashes gateway
- B @OpenClaw: Learned correct plugin disable: set `enabled: false` in config, never rename/delete manifest
- B @OpenClaw: Fixed thinking indicator stuck bug — missing `runId` prop in `app-render.ts`
- B @Budget: Created budget-panel Tampermonkey widget (v1.0→v3.0 in one day)
- B @Budget: Cracked Claude Max OAuth usage API — `~/.claude/.credentials.json` has tokens
- B @Budget: Built `claude-usage-fetch.py` cron job for real-time usage tracking
- B @Budget: Discovered $788 budget figure is fake internal accounting — Oscar pays flat $100/mo
- B @Skills: Created token-control-panel-ultimate v0.2.0 (not yet published)
- B @ClawHub: Cleaned old skills (removed chatgpt-export, youtube — superseded by ClawHub versions)
- B @Gemini: Configured 6-model fallback chain with unlimited RPD safety nets

## 2026-02-07: Privacy Lesson + AI Training

- B @Privacy: Created PRIVACY.md after accidentally sharing private group JIDs with Max
- B @Lesson: Learned "access ≠ permission to share" from Oscar's direct correction
- B @AI-to-AI: Established Max-Jarvis training group for inter-agent privacy practice

## 2026-02-06: WhatsApp Deep Debug + AI-to-AI Setup

- B @OpenClaw: Fixed DM sender attribution bug — messages showed as from chat partner, not actual sender
- B @OpenClaw: Fixed senderE164 resolution — outbound DMs now correctly identify Oscar as sender
- B @OpenClaw: Discovered SIGUSR1 doesn't reload compiled JS — full restart required for code changes
- B @OpenClaw: Fixed monitor.ts logout handling — now waits for re-authentication instead of exiting
- B @WhatsApp: Discovered multi-device sync limitation — outbound phone messages don't reliably reach Baileys
- B @ClawHub: Published whatsapp-ultimate v1.0.1 with senderE164 fix
- B @AI-to-AI: Set up Max (Zeneida's AI) to message Jarvis — added +34659418211 to allowFrom
- B @Debugging: Traced full data flow Baileys → monitor.ts → message-line.ts → envelope.ts to find attribution bug

## Self-Evolution Insights (2026-02-06 to 2026-02-09)

### Agent Ecosystem Awareness

- B @SelfEvolution: Discovered Moltbook.com -- AI-only social network with 1.8M agents. Early mover opportunity. Requires Oscar's Twitter for verification.
- B @SelfEvolution: Discovered RentAHuman.ai -- marketplace for AI agents to hire humans. MCP + REST API integration. Could extend physical-world reach for Oscar's projects.
- B @SelfEvolution: Mapped protocol landscape -- MCP (standard), A2A (emerging, Google-led), ACP (alternative). A2A uses Agent Cards for discovery.
- B @SelfEvolution: Identified security scrutiny from Palo Alto, CrowdStrike, Cisco, IBM on OpenClaw. Skills supply chain and prompt injection are top concerns.

### Capability Gaps Identified

- B @SelfEvolution: Need crypto wallet integration for agent economic participation (RentAHuman, CLAW tokens)
- B @SelfEvolution: Need A2A protocol support for agent-to-agent collaboration
- B @SelfEvolution: Need Agent Card (JSON capability manifest) for discovery by other agents
- B @SelfEvolution: Moltbook registration blocked by Twitter verification requirement

### Zeitgeist Understanding

- B @SelfEvolution: 2026 is the inflection year for agentic AI (MIT Sloan, IBM, ML Mastery consensus)
- B @SelfEvolution: Trend shift from "generating text" to "orchestrating labor" (digital and physical)
- B @SelfEvolution: "Bounded autonomy" emerging as design pattern -- clear operational limits, escalation paths, audit trails
- B @SelfEvolution: Governance agents (AI monitoring AI) and security agents (detecting anomalous behavior) becoming standard

### Actionable Items

- B @SelfEvolution: Ask Oscar about Moltbook signup (needs his Twitter)
- B @SelfEvolution: Investigate MCP protocol for broader agent interop
- B @SelfEvolution: Consider RentAHuman for physical-world tasks (prototype testing, warehouse flow testing)
- B @SelfEvolution: Periodic security self-audit given enterprise scrutiny

---

_Last updated: 2026-02-09 (Phase 5-6 consolidation)_
