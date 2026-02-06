# World Facts

Objective facts about the external world that I've learned.
Format: `W @entity: fact (source, date)`

---

## Technology

### OpenClaw
- W @OpenClaw: Baileys library supports full WhatsApp history sync, but disables it by default (code analysis, 2026-02-03)
- W @OpenClaw: `makeInMemoryStore` was removed in Baileys v7.0.0 — requires custom store implementation (code analysis, 2026-02-04)
- W @OpenClaw: Custom WA store created at `src/web/wa-store.ts` with event binding (messaging-history.set, chats.upsert, etc.) (2026-02-04)
- W @OpenClaw: Full history sync enabled via `syncFullHistory: true` in createWaSocket options (2026-02-04)
- W @OpenClaw: LanceDB hybrid search combines vector similarity + BM25 keywords (docs, 2026-02-03)
- W @OpenClaw: Chrome Browser Relay extension runs on port 18792, profile "chrome" (setup, 2026-02-01)
- W @OpenClaw: Brave Search API not configured — web_search unavailable (verified, 2026-02-01)
- W @OpenClaw: Tool streaming only works when `verboseDefault: "on"` in config (code analysis, 2026-02-02)
- W @OpenClaw: Session start prompt location: `get-reply-run.ts`, variable `BARE_SESSION_RESET_PROMPT` (2026-02-04)
- W @OpenClaw: Session transcript indexing is opt-in via `memorySearch.experimental.sessionMemory: true` (2026-02-03)
- W @OpenClaw: Hybrid search uses 70/30 vector/text weight by default (2026-02-03)

### Memory Conventions (2026-02-04)
- W @Memory: Projects live in `memory/projects/<project-name>/` with index.md
- W @Memory: Non-leaf folders can have philosophy.md, architecture.md, history.md for cross-cutting docs
- W @Memory: Status tracking: 🟢 Open, 🟡 Paused, ✅ Closed, ❌ Abandoned
- W @Memory: Consolidation runs nightly at 3am, protocol in CONSOLIDATION.md
- W @Memory: Retain section prefix codes: W=fact, B=experience, O(c=X.XX)=opinion

### AI Models
- W @Claude: Rate limits reset hourly; can auto-failover to Gemini (verified, 2026-02-03)
- W @Gemini: Free tier rate limits — 15 RPM, 1500 RPD, 1M TPM (research, 2026-02-02)
- W @Gemini: No usage API endpoint exists — must estimate client-side (research, 2026-02-02)
- W @Manus: Credit cost tiers — Low: 2-5, Medium: 5-10, High: 10-20, Very high: 20-50, Killer: 50+ (research, 2026-02-02)
- W @Manus: Free tier has 1500 credits/month (research, 2026-02-02)
- W @Manus: No credit balance API exists — must track from response metadata (research, 2026-02-02)

### Voice
- W @Voice: sherpa-onnx-tts with Alan voice, 2x speed via `--vits-length-scale=0.5` (setup, 2026-02-01)
- W @Voice: Wake word detection uses sherpa-onnx-keyword-spotter (CPU efficient) (setup, 2026-02-01)
- W @WhatsApp: Voice notes require OGG/Opus format — MP3 corrupts on playback (verified, 2026-02-03)

### GCP
- W @GCP: Google Maps Platform APIs enabled in project "organic-storm-486018-u9" — all 32 APIs (setup, 2026-02-01)

## Places
- W @Olivella: Small town near Sitges, Spain; Oscar's residence (USER.md)
- W @Martorell: Location of Talleres SERRA SL factory (USER.md)

## Organizations
- W @TalleresSERRA: Family business, intra-logistics focus (USER.md)
- W @OliveTreeSchool: Elisenda's British school (USER.md)

### Baileys/WhatsApp
- W @Baileys: Error 515 means "Stream Errored (restart required)" — WebSocket terminates after pairing (2026-02-05)
- W @Baileys: Error status nested at `err.error.output.statusCode`, not `err.output.statusCode` (code analysis, 2026-02-05)
- W @Baileys: Multiple rapid connection attempts trigger rate limiting at IP level (2026-02-05)

## People

### Spiritual Teachers
- W @DoloresCannon: Oscar has read ALL her books (2026-02-05)
- W @DoloresCannon: Key works: Convoluted Universe series, Keepers of the Garden, Three Waves of Volunteers (2026-02-05)
- W @QHHT: Quantum Healing Hypnosis Technique — methodology created by Dolores Cannon (2026-02-05)

---
*Last updated: 2026-02-06 (consolidation)*
