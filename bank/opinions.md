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

---

## Confidence Legend
- 0.95-1.00: Very high confidence, repeatedly confirmed
- 0.80-0.94: High confidence, multiple evidence sources
- 0.60-0.79: Moderate confidence, some evidence
- 0.40-0.59: Low confidence, inferred or single source
- 0.00-0.39: Very low confidence, speculative

---
*Last updated: 2026-02-04 (consolidation)*
