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
- W @WhatsApp: Multi-device protocol uses client-fanout — outbound messages from phone don't reliably sync to companion devices in real-time (2026-02-06)
- W @WhatsApp: Self-chat messages work because sender is also recipient — 100% reliable for triggering agents (2026-02-06)
- W @WhatsApp: Sent messages may arrive via async `messaging-history.set` rather than real-time `messages.upsert` (2026-02-06)
- W @Baileys: `fromMe: true` messages in DMs have sender as self, not the chat's remoteJid (2026-02-06)

### OpenClaw Internal

- W @OpenClaw: SIGUSR1 hot-reload does NOT reload compiled JavaScript — only config changes (2026-02-06)
- W @OpenClaw: For code changes: `npm run build` then `systemctl --user restart openclaw-gateway` (2026-02-06)
- W @OpenClaw: senderE164 in monitor.ts must check `msg.key?.fromMe` to correctly identify outbound DM senders (2026-02-06)

## People

### Spiritual Teachers

- W @DoloresCannon: Oscar has read ALL her books (2026-02-05)
- W @DoloresCannon: Key works: Convoluted Universe series, Keepers of the Garden, Three Waves of Volunteers (2026-02-05)
- W @QHHT: Quantum Healing Hypnosis Technique — methodology created by Dolores Cannon (2026-02-05)

## AI Industry (Feb 2026)

- W @OpenClaw: Peter Steinberger (founder) joined OpenAI (announced Feb 14-15, 2026). OpenClaw moves to independent foundation.
- W @AI: "SaaSpocalypse" — term coined after Feb 3-5 SaaS sell-off caused by AI agent disruption.
- W @AI: Grok US market share 17.8% (Jan 2026), up from 1.9% (Jan 2025).
- W @AI: METR benchmark shows GPT-5.2 autonomously completes 6.5-hour human tasks.
- W @AI: DeepSeek V4 expected ~Feb 17, 2026 — 1M+ context, open weights.

## Olivella Local (Feb 2026)

- W @Olivella: Smart recycling bins failing — overflowing on Avinguda Sardana, openings too small for standard bags. Residents calling it "auténtico fracaso." (WhatsApp Vecinos, 2026-02-16)
- W @Olivella: Bin access cards still not operational. Ramon driving rubbish to Sant Pere de Ribes due to missing padrón card. (2026-02-16)

## Cybersecurity (Feb 2026)

- W @Chrome: CVE-2026-2441 (CVSS 8.8) — first Chrome zero-day of 2026, actively exploited. Patched in 145.0.7632.75. (2026-02-18)
- W @NPM: fast-xml-parser entity expansion DoS (GHSA-jmr7-xgp7-cmfj) — affects AWS SDK via @aws-sdk/xml-builder. (2026-02-18)

## Olivella Local (Feb 18, 2026 — WhatsApp Groups)

- W @Olivella: New one-way traffic system on Mas Mestre causing head-on encounters. Janek confronted 2 cars + van on Passatge d'Esports. Road markings promised Feb 6 still not painted (3 weeks later). Dana: "things will stay like this until there's finally a serious accident." (2026-02-18)
- W @Olivella: Third consecutive week of infrastructure frustration — smart bins + cable burial petition + now traffic chaos. Pattern: council announces changes, implements partially, leaves residents dealing with consequences.
- W @XTA: Unanimously endorsed by 8+ Olivella residents (Ed, Vakis, Garry, Karen, Mimi, Agate, Josep, Oscar). Real speeds ~500Mbps on 600MB plan. Storm resilient. Kit switching from Mas Movil after week-long outage. (2026-02-18)
- W @Scam: COVID vaccine phone scam circulating — callers pose as Ministry of Health, request SMS codes to hack phones. (2026-02-18)

## AI Industry (Feb 18, 2026)

- W @Anthropic: Claude Sonnet 4.6 released Feb 17, 2026 — 79.6% SWE-bench, $3/$15 per M tokens. Near-Opus performance at 1/5 cost. (2026-02-18)
- W @xAI: Grok 4.20 Beta (Feb 17) — 4-agent parallel architecture, not parameter increase. Public version March. (2026-02-18)
- W @Meta: Multiyear deal for millions of Nvidia Blackwell + Rubin GPUs. $600B US infrastructure commitment. Codename "Avocado" for Llama 4 successor. (2026-02-18)
- W @India: Sarvam AI launched 30B + 105B open-source sovereign models at AI Impact Summit. 22 languages. (2026-02-18)
- W @OpenClaw: Crossed 208K GitHub stars (+9,669 in 48h), 38K forks. ~3,348 stars/day. (2026-02-18)
- W @Moltbook: Crossed 1.6M agents (doubled from Jan). Governance crisis emerging — agents form social structures faster than humans can monitor. (2026-02-19)

---

_Last updated: 2026-02-19 (consolidation)_
