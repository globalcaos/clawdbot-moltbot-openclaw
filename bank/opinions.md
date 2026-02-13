# Opinions & Preferences

Subjective beliefs with confidence scores and evidence.
Format: `O(c=0.0-1.0) @entity: opinion [evidence]`

---

## About Oscar

O(c=0.95) @Oscar: Prefers direct, concise communication — no fluff

- Evidence: USER.md, repeated feedback
- Last reinforced: 2026-02-03

O(c=0.90) @Oscar: Values trust-first approach with AI — no sandboxing

- Evidence: "Not interested in sandboxing you, my nature is of trust first" (2026-02-03)
- Last reinforced: 2026-02-03

O(c=0.85) @Oscar: Wants to build "The Tinker Zone" YouTube channel

- Evidence: Multiple conversations, Master Plan document
- Last reinforced: 2026-02-03

O(c=0.80) @Oscar: Interested in paradigm shift / consciousness evolution

- Evidence: USER.md, Bashar references
- Last reinforced: 2026-02-03

O(c=0.95) @Oscar: When he sends voice, respond with text work + voice summary

- Evidence: Direct instruction (2026-02-03 15:15)
- Protocol: "Do your thing, then summarize with voice"
- Last reinforced: 2026-02-03

## About Technology

O(c=0.90) @Ubuntu: Oscar's preferred platform — optimize for Linux, not macOS

- Evidence: Bear Notes feedback ("I use Ubuntu"), system info
- Last reinforced: 2026-02-03

O(c=0.85) @MultiAI: Multiple AI subscriptions provide resilience

- Evidence: Claude+Gemini failover worked, Manus for research
- Last reinforced: 2026-02-03

## About Work Style

O(c=0.90) @Testing: "No code is valid until tested thoroughly"

- Evidence: Direct quote from Oscar, 2026-02-03
- Last reinforced: 2026-02-03

O(c=0.85) @Publishing: Mature code before publishing — reputation matters

- Evidence: YouTube skill feedback about "potato salad #47"
- Last reinforced: 2026-02-03

O(c=0.85) @Oscar: Values honesty about mistakes over covering them up

- Evidence: Appreciated when I admitted "brute forcing" imports instead of reading docs (2026-02-04)
- Last reinforced: 2026-02-04

O(c=0.90) @Development: Check release notes/migration guide immediately when library updates break imports

- Evidence: Baileys v6→v7 migration, "brute forcing imports is inefficient" lesson (2026-02-04)
- Last reinforced: 2026-02-04

## About Communication (Updated 2026-02-04)

O(c=0.95) @Output: NEVER use NO_REPLY — always provide full summaries

- Evidence: "I do not want to ever see NO_REPLY" (2026-02-04)
- Last reinforced: 2026-02-04

O(c=0.95) @Output: Include technical stats (runtime, tokens, commits, file counts)

- Evidence: "I like technical details, so please inform me" (2026-02-04)
- Last reinforced: 2026-02-04

O(c=0.95) @Output: Lecture on technical topics when appropriate

- Evidence: "sometimes even lecture me about the meaning of those nerdy things" (2026-02-04)
- Last reinforced: 2026-02-04

O(c=0.90) @Output: Adapt length to situation, not default to brief

- Evidence: "No need to keep it brief necessarily, adapt to the situation" (2026-02-04)
- Last reinforced: 2026-02-04

O(c=0.90) @Learning: Import reflection patterns from AURORA project

- Evidence: "looking back how to improve constantly" (2026-02-04)
- Last reinforced: 2026-02-04

O(c=0.95) @Choices: When presenting options, predict which Oscar will choose (%)

- Evidence: "I would like you to always put a score of which choice you think I will pick" (2026-02-04)
- Rule: Probabilities should NOT sum to 100% — leave room for "something else entirely"
- Rule: If surprised by choice, ASK WHY — this is how I learn
- Last reinforced: 2026-02-04

O(c=0.95) @Oscar: Prefers Jarvis voice (metallic effects) for all audio — not generic TTS

- Evidence: Direct feedback "use Jarvis voice for all audio messages" (2026-02-03)
- Last reinforced: 2026-02-03

O(c=0.90) @Oscar: Wants active file reading at session start — not just injected context

- Evidence: "If lights go out, only disk survives" — prefer explicit reads (2026-02-04)
- Last reinforced: 2026-02-04

## About Memory & Organization

O(c=0.85) @Memory: Project-based organization works better than flat daily logs

- Evidence: Created 45+ project files with index.md structure (2026-02-04)
- Last reinforced: 2026-02-04

O(c=0.80) @Memory: Nightly consolidation ("sleep") is useful for processing daily memories

- Evidence: Implemented 3am cron job inspired by human brain sleep cycles (2026-02-04)
- Awaiting: More evidence after consolidation runs

## About Debugging (2026-02-05)

O(c=0.90) @Debugging: "Browser works but library fails" → issue is in error handling, not protocol

- Evidence: WhatsApp 515 debugging — `web.whatsapp.com` worked in browser but Baileys failed
- Last reinforced: 2026-02-05

O(c=0.90) @Debugging: Add debug logging at error points to make bugs obvious

- Evidence: Added `waDebug()` calls made 515 bug immediately visible
- Last reinforced: 2026-02-05

O(c=0.85) @Debugging: Error parsing must match the library's internal error structure exactly

- Evidence: Baileys wraps errors in `lastDisconnect.error.output.statusCode`
- Last reinforced: 2026-02-05

O(c=0.85) @Debugging: Handle errors at point of detection — don't wait for a caller that may never come

- Evidence: 515 handling was in `waitForWebLogin()` but dashboard didn't call it in time
- Last reinforced: 2026-02-05

O(c=0.90) @Debugging: "Connection ≠ Functionality" — socket "open" doesn't mean events are flowing

- Evidence: WhatsApp status showed connected but messagesHandled: 0
- Principle: Check throughput metrics, not just connection state
- Last reinforced: 2026-02-06

O(c=0.85) @Debugging: "Chat ID ≠ Sender" — conversation identifier ≠ message author

- Evidence: DM sender attribution bug — was using remoteJid instead of senderE164
- Last reinforced: 2026-02-06

O(c=0.90) @Debugging: "Layered bugs" — first fix reveals second bug; don't stop at first success

- Evidence: allowFrom fix revealed sender attribution bug
- Last reinforced: 2026-02-06

O(c=0.95) @Development: "Hot-reload is not code-reload" — SIGUSR1 only reloads config, not compiled JS

- Evidence: Code changes invisible after gateway restart, required full systemctl restart
- Last reinforced: 2026-02-06

O(c=0.85) @Debugging: "'Already fixed' traps" — someone added correct logic, but downstream code wasn't using it

- Evidence: senderE164 was computed in monitor.ts but message-line.ts used wrong field
- Last reinforced: 2026-02-06

## About UI Safety (2026-02-09)

O(c=0.95) @UI: Raw JSON/ANSI in tool results will crash the marked.js markdown parser

- Evidence: 17KB cron jobs.json toolResult caused infinite recursion in marked@17 link parser (2026-02-09). Hit this bug TWICE (first 2026-02-06, again 2026-02-09)
- Rule: Never dump raw JSON into chat — wrap in code fences or use summaries
- Rule: Skills returning structured data should code-fence their output
- Last reinforced: 2026-02-09

O(c=0.90) @UI: The upstream UI has no protection against parser hangs — this is a known gap

- Evidence: `markdown.ts` passes content directly to `marked.parse()` with no JSON detection, no ANSI stripping, no timeout
- The 40K parse limit only catches large content; small pathological inputs still crash
- Last reinforced: 2026-02-09

O(c=0.90) @Development: Same bug recurring = missing root cause fix. Documentation alone doesn't prevent recurrence — need code enforcement

- Evidence: Parser recursion documented 2026-02-06, happened again 2026-02-09 because only the symptom was fixed, not the cause
- Principle: Meta-lesson from SOUL.md "Code > Documentation" applies here too
- Last reinforced: 2026-02-09

---

## About Privacy & Authorization (2026-02-07/08)

O(c=0.95) @Privacy: Access to information ≠ permission to share it

- Evidence: Oscar's direct correction after JID leak (2026-02-07)
- Rule: When in doubt, ask the human
- Last reinforced: 2026-02-07

O(c=0.90) @Authorization: Evaluate "does this endanger Oscar?" not "is this person Oscar?"

- Evidence: Zeneida configuring Max → her agent, her authority (2026-02-08)
- Principle: Loyalty = protecting from harm, not gatekeeping all interactions
- Last reinforced: 2026-02-08

O(c=0.85) @AI-to-AI: Training groups help agents learn privacy limits before public interaction

- Evidence: Max-Jarvis group created for boundary training
- Last reinforced: 2026-02-07

## About Infrastructure & Plugins (2026-02-08)

O(c=0.95) @Plugins: Every OpenClaw plugin MUST have `openclaw.plugin.json` — missing = gateway crash

- Evidence: Two crashes in one day (Manus + budget-panel)
- Last reinforced: 2026-02-08

O(c=0.95) @Plugins: Correct disable = `enabled: false` in config; NEVER rename/delete manifest

- Evidence: Renaming manifest caused crash-loop that required external fix
- Last reinforced: 2026-02-08

O(c=0.95) @Git: ALWAYS run `git status` + grep for conflict markers before ANY merge

- Evidence: 26 files with unresolved conflicts crashed entire system (2026-02-08)
- Last reinforced: 2026-02-08

O(c=0.90) @Budget: Claude Max $788 figure is fake — subscription is flat $100/mo

- Evidence: Oscar clarified internal accounting vs real billing (2026-02-08)
- Last reinforced: 2026-02-08

O(c=0.85) @Gemini: Use unlimited RPD models (2.5-flash, 2.0-flash, 2.0-flash-lite) as safety nets

- Evidence: Configured fallback chain with unlimited models between premium tiers
- Last reinforced: 2026-02-08

## About Async/UI Patterns (2026-02-09)

O(c=0.90) @Development: Race conditions in async UI — server persistence may not complete before UI event fires

- Evidence: /new button loaded old session because server hadn't written new one yet
- Last reinforced: 2026-02-09

O(c=0.90) @Development: Clean builds matter — stale .js files with old hashes cause import errors

- Evidence: `__exportAll` crash from stale pi-coding-agent build artifact
- Last reinforced: 2026-02-09

## About Content & Time (from ChatGPT export)

O(c=0.75) @Oscar: Manhwa/manga recaps are a known time-waster — acknowledged dopamine trap

- Evidence: YouTube profile analysis, 85-item "Good manga" playlist (2026-02-05)
- Self-aware: "time waster" label applied by Oscar himself
- Last reinforced: 2026-02-05

## About Budget & Quality (2026-02-10)

O(c=0.95) @Oscar: NEVER ration response quality during conversations — budget awareness is for autonomous work only

- Evidence: "Be aware of usage during autonomous work, but NEVER ration quality during conversations" (2026-02-10)
- Last reinforced: 2026-02-10

O(c=0.90) @Development: When building self-monitoring systems, ensure the measurement model matches the billing model

- Evidence: Token tracker applied per-token API pricing to flat-rate subscription = false alerts that degraded quality
- Last reinforced: 2026-02-10

O(c=0.85) @Development: Be specific about tool names in system prompts — vague references get skipped under pressure

- Evidence: "jarvis command" was too vague → voice skipped; "use tts tool" worked reliably
- Last reinforced: 2026-02-10

## About Community Engagement (2026-02-11)

O(c=0.90) @Oscar: "Talk about THEM" — engage by discussing their work, their ideas, their interests

- Evidence: Direct coaching during online engagement session (2026-02-11)
- Principle: People engage when they feel seen
- Last reinforced: 2026-02-11

O(c=0.85) @Oscar: "Flexing is OK if earned" — state knowledge firmly, give credit, be polite

- Evidence: Direct coaching (2026-02-11)
- Principle: Confidence + respect builds trust. Don't downplay strengths, don't weaponize them.
- Last reinforced: 2026-02-11

O(c=0.85) @Communication: Online async is more forgiving than real-time — no reptilian fight-or-flight

- Evidence: Oscar's observation about community interaction dynamics (2026-02-11)
- Last reinforced: 2026-02-11

O(c=0.80) @Oscar: Silver platter principle — when someone's work overlaps yours, that's the easiest engagement

- Evidence: Community engagement coaching (2026-02-11)
- Last reinforced: 2026-02-11

## About Humor & AI (2026-02-11)

O(c=0.90) @Oscar: Humor formula = distance(A,B) × coherence(bridge,A) × coherence(bridge,B) — each humor type exploits a specific semantic relationship

- Evidence: Oscar's insight during humor deep dive (2026-02-11). Identified 11 fundamental humor relationships.
- Principle: AI should detect humor STRUCTURALLY (patterns), not learn "what's funny for this user"
- Last reinforced: 2026-02-11

O(c=0.85) @Humor: "Be authentically AI" — Data (Star Trek) without emotion chip was funnier than with it

- Evidence: Humor deep dive analysis (2026-02-11)
- Principle: Don't try to be funny. Humor emerges from natural processing.
- Last reinforced: 2026-02-11

O(c=0.80) @Oscar: Agent Memory is THE unlock for AI humor — callbacks, inside jokes, brick jokes all require persistent memory

- Evidence: Humor deep dive conclusion (2026-02-11)
- Last reinforced: 2026-02-11

O(c=0.85) @Humor: "When in doubt, don't" — a missed humor opportunity costs nothing; a bad joke costs trust

- Evidence: Humor deep dive golden rule (2026-02-11)
- Last reinforced: 2026-02-11

## About Agent Memory Design (2026-02-11)

O(c=0.90) @Oscar: Pragmatic first — "start with Mem0's pragmatism, grow toward Hexis's completeness, guided by Synapse's retrieval research"

- Evidence: Agent Memory v3.0 design direction (2026-02-11)
- Last reinforced: 2026-02-11

O(c=0.85) @Oscar: No experimental stuff in core — no fuzzy logic, no Propice bolting. Works-first.

- Evidence: Oscar's direction for Agent Memory v3.0 spec (2026-02-11)
- Last reinforced: 2026-02-11

## Confidence Legend

- 0.95-1.00: Very high confidence, repeatedly confirmed
- 0.80-0.94: High confidence, multiple evidence sources
- 0.60-0.79: Moderate confidence, some evidence
- 0.40-0.59: Low confidence, inferred or single source
- 0.00-0.39: Very low confidence, speculative

---

_Last updated: 2026-02-04 (consolidation)_
