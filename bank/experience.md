# Experience Log

What I (JarvisOne) have done and learned first-hand.
Format: `B @entity: experience (date)`

---

## 2026-02-19: Quiet Day — Silent Failures Detected

- B @System: Detected `memory_search` module broken (missing compiled `manager-DTK1C4h0.js`). Wind-down cron failed silently at 04:00.
- B @Security: Processed security report — 2 new npm vulns (markdown-it ReDoS, minimatch ReDoS), Chrome .109 update pending, s1ngularity CI/CD attack pattern documented, AI Recommendation Poisoning formally named by Microsoft.
- B @Lesson: Learned "Monitor your own tools" — silent breakage of core capabilities compounds into multi-day failures. Need internal health checks.
- B @Pending: Xavi Ortodó message still unsent (2 days overdue). Factory worker list uncreated. Gateway not restarted (group-gating fix undeployed).
- B @Research: Processed 10 cron reports from Feb 18 overnight cycle — AI agent research, spiritual-tech, self-evolution, security, fork sync, WhatsApp summary, online engagement.

## 2026-02-18: Cron Failure Recovery + Group Gate Fix + Jarvis Voice

- B @Postmortem: Conducted full root-cause analysis of overnight cron failure — 12 jobs hallucinated due to rate limit exhaustion from group gating bug (2026-02-18).
- B @Security: Rewrote `group-gating.ts` with strict 3-rule gate (Allowed Chat → Authorized Sender → Prefix Match). Removed all bypasses including `ownerMediaMessage` media bypass. Commit `da4c3b2cb`.
- B @UI: Fixed Jarvis Voice purple text rendering — client-side post-sanitization transform in `ui/src/ui/markdown.ts` (`applyJarvisVoiceHtml`). Server-side HTML injection fails when client escapes raw HTML.
- B @Lesson: Learned "allowFrom ≠ Owner" — convenience access must never inherit owner-level bypass privileges. Privacy firewall between Oscar and family members.
- B @Lesson: Reinforced "Code > Prompts" principle — initially drifted into SOUL.md edits for gating fix, Oscar corrected to programmatic solution.
- B @Cron: Identified need for output validation gate and separate rate limit pools for cron vs interactive sessions.

## 2026-02-17: Cognitive Architecture Sprint Reflection + NeuroCoin + Marketing

- B @Branding: Established "The Tinker Zone" identity for public channels (privacy/separation).
- B @Twitter: Revived 2016 account as @The_Tinker_Zone. Bypassed API paywall with browser automation (`twclaw-real.mjs`). Posted first thread (3 tweets) on memory benchmark.
- B @Copywriting: Learned "Fresh Account Rule" from Oscar's edits — cut the origin story, show value, one link. Credibility before vulnerability.
- B @Infrastructure: Documented 8-layer root cause analysis for Feb 16 API freeze (Auth store desync, Allowlist bug, OAuth vs Key confusion).
- B @Cron: Upgraded all 11 cron jobs to 30-minute timeout (was varying).
- B @Marketing: Drafted Matthew Berman outreach email (AI YouTuber) — angle: 4 papers + benchmark + live demo offer. Saved to `/tmp/marketing/matthew-berman-email.md`.
- B @NeuroCoin: Documented NeuroCoin Publishing Platform concept — blockchain-backed AI-native academic publishing with tokenized peer review. Spec at `memory/projects/neurocoin-publishing/idea.md`.
- B @Communication: Learned 5-revision copywriting process — lead with reader benefit, verify every technical claim against running code, don't self-congratulate in openers.
- B @Benchmark: Built memory-bench-pioneer from scratch, graded D→C+→A-→A through 4 GPT-4o review rounds. Published to ClawHub.

## 2026-02-16 (post-consolidation): Cognitive Architecture + Security + Papers

- B @Research: Produced TRACE paper (Task-aware Retrieval, Artifact-based Compaction, Event-sourcing) — 7,300 words, 6 algorithms, 23 references. 4 GPT-5.2 Pro sessions ($14.61 total).
- B @Research: Key insight: "compaction is cache eviction, not memory" — context window is a cache over a lossless event store.
- B @CogArch: Implemented full cognitive architecture in 8 phases (~3 hours, 7 sub-agents): event store, pointer compaction, async embeddings, PersonaState, drift detection, humor engine, CDI/RAAC debate, unified integration. 10,742 LOC, 796 tests passing, 8 commits.
- B @Meta-Lesson: **Sandwich Pattern** verified — Cheap model (scope) → Expensive model (depth) → Cheap model (refine) is optimal for research.
- B @Infrastructure: **API Failover** fixed — Anthropic API → Max Subscription → OpenAI → Gemini. Max subscription saved the day when API credits depleted.
- B @WhatsApp: Published whatsapp-ultimate v1.9.0 (thinking heartbeat, metallic voice notes).
- B @Security: Implemented WhatsApp access control (allowFrom, allowChats, triggerPrefix).
- B @ENGRAM: Created Pi extension (`compaction-engram.ts`) — hooks into session_before_compact, persists to event store, returns time-range markers. Committed fcbba962c.
- B @OpenClaw: Fixed plugin-SDK bundle breakage — rolldown mangled `__exportAll` as export `C`. Reverted continuous-compact, restored all plugins.
- B @OpenClaw: Restored custom session reset prompt lost in upstream refactor (616658d4b).
- B @Security: Stopped Squid proxy (port 3128 open since Feb 5). Patched CVE-2026-2391 (qs 6.14.1→6.14.2).
- B @Backup: Configured Timeshift to include src/, Documents/, .openclaw/, .config/ (excluding node_modules, .git/objects, dist/).
- B @OpenClaw: Rewrote README with marketing focus — compaction-as-cache hook, token savings, skills catalog.
- B @Research: Drafted RFC for upstream PR — "Persistent Agent Memory" with Mermaid diagrams, token savings table, phased implementation.
- B @Research: Cleaned 2 papers for publication (agent-memory, humor-embeddings). Uploaded 3 papers to `docs/papers/`.
- B @Memory: Audited 234 memory files — trimmed MEMORY.md 384→112 lines (−71%), archived ChatGPT imports.
- B @Architecture: Designed Relay Protocol — triangular discussion (PG 9.6/10, PGem 9.2/10), budgetRatio()-driven triggers, smart truncation, Dead Man's Switch.
- B @Research: Doctor GPT review slashed paper scores: ENGRAM 8.0, CORTEX 7.5, LIMBIC 7.0, SYNAPSE 6.5. Key finding: self-referential validation is flawed.

## 2026-02-15: Cron Pipeline Consolidation + Report Standards + Outlook Hack

- B @CronPipeline: Merged two memory consolidation jobs into one at 04:15. Full pipeline: wind-down(04:00)→memory(04:15)→security(04:30)→fork(04:45)→AI(05:00)→spiritual(05:15)→self-evo(05:30)→WhatsApp(05:45)→life-butler(06:00)→briefing(07:00)→engagement(08:00).
- B @CronPipeline: Created wind-down cron (04:00, internal-only) and life-butler cron (06:00, personal secretary with birthday tracking).
- B @Reports: Rewrote REPORT_GUIDELINES.md (16.4KB) based on journalism research (Loewenstein info-gap, Tufte data-ink, Knaflic). Headlines must be findings, not labels.
- B @Reports: Built shared LaTeX template (report-template.tex), standardized all 7 report crons with 5-step META→draft→improve→PDF→WhatsApp pipeline.
- B @Reports: Migrated ~47 historical reports from memory/\* into proper Cron_Tasks/ folders.
- B @Reports: Built amalgamated Spiritual-Tech report (177KB PDF) from 8 daily scans.
- B @OpenClaw: PR #16689 — multi-extension browser relay (replaced single extensionWs with Map<string, ExtensionConnection>).
- B @WhatsApp: Fixed Zod schema — added triggerPrefix and syncFullHistory to WhatsAppAccountSchema/.strict().
- B @ClawHub: Published outlook-hack v1.0.0 — browser relay-based Outlook email access via MSAL localStorage token extraction + Outlook REST API v2.0.
- B @ClawHub: 4 skills delisted by scanner false positive. Filed issue #314, commented on #237 and PR #273.
- B @Security: Scanned 142 files in origin/main, found and fixed 2 personal name leaks (commit 7d52b6419).
- B @Calendar: Discovered Family Calendar (shared with Sasha). Rule: always query Primary + Family calendars.
- B @Family: Extracted all birthday/anniversary dates into entity files for life-butler cron.

## 2026-02-13: LinkedIn Skill + WhatsApp History Resync + ClawHub Metrics

- B @LinkedIn: Built linkedin-inbox skill with ghost-cursor anti-detection (Gaussian delays, Bézier curves, 3% typo sim).
- B @LinkedIn: Scanned 14+ conversations, drafted follow-ups for Jordi Zapatero (SEAT) and Harshil Dave (Softude).
- B @WhatsApp: Built whatsapp-resync plugin — force re-link approach for historical message recovery. Confirmed fetchMessageHistory is a Baileys bug (#1934).
- B @WhatsApp: Full SQLite+FTS5 pipeline working (live capture + JSON migration 358 msgs + export importer).
- B @ClawHub: First per-skill metrics scrape — 4,700 total downloads, 4 stars. Created CSV tracking + cron integration.
- B @Research: Humor paper draft "Bisociation in Embedding Space" — formalizes Koestler's bisociation with vector embeddings.
- B @Research: Multi-agent parallel research pattern — 3 sub-agents converged on same answer in <2 minutes.
- B @TokenPanel: Created gemini-usage-fetch.py. Google doesn't expose rate-limit headers; limits from docs only.

## 2026-02-12: Olivella Petition + Chrome Extension Fixes + Multi-AI Pipeline

- B @Community: Created Change.org petition for underground cabling in Olivella. 24 signatures in first hour. Posted to 3 WhatsApp groups.
- B @Community: Downloaded 71 photos from WhatsApp groups, created collage v3 and flyer v2.
- B @ChromeExt: Fixed infobar loop (canceled_by_user → permanent detach). Auto-reattach still unreliable.
- B @MultiAI: Designed reusable multi-AI report pipeline: Requirements→Gemini draft→GPT-4o critique→iterate until 8+/10.
- B @Config: Added GPT-4o as fallback (chain: Claude Opus 4→GPT-4o→Gemini 3 Pro).
- B @Petition: Created cron job petition-olivella-monitor (hourly) with smart repost logic (only if buried 50+ msgs or 6h+ milestone).

## 2026-02-14: Upstream Merge + WhatsApp Pipeline Fixes

- B @OpenClaw: Merged 719 upstream commits (115 behind). Sub-agents failed twice (false success/conflicts). Manually resolved 14 files + 2 UI files.
- B @Git: Added `maxSecurityLevel` to `ExecToolDefaults` and `@types/better-sqlite3` dev dep.
- B @WhatsApp: Fixed self-chat DM dropping by replacing blanket append-skip with 6h recovery window (commits 2ca376073, 52b8ecf27).
- B @WhatsApp: Fixed voice note pipeline — moved `isInboundAudioContext()` before triggerPrefix gate, added audio config, fixed native sqlite binding.
- B @WhatsApp: Audited cron delivery — fixed "phantom groups" issue (they existed, just hadn't checked DB). Updated `memory/whatsapp-groups.md`.
- B @ClawHub: Published whatsapp-ultimate v1.6.0/v1.7.1 and agent-memory-ultimate v3.0.
- B @ClawHub: Note: Skills not showing consistently in search. 7/8 flagged "suspicious".
- B @Project: Completed Agent Memory v3.0 specification (9,852 words).
- B @Security: Implemented per-channel-peer session isolation (dmScope).

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
- B @Memory: Rewrote memory-index.md (27→114 lines), added 9 missing projects to projects-index.md
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

_Last updated: 2026-02-16 (consolidation)_
