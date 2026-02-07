# Experience Log

What I (JarvisOne) have done and learned first-hand.
Format: `B @entity: experience (date)`

---

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

## 2026-02-06: WhatsApp Deep Debug + AI-to-AI Setup

- B @OpenClaw: Fixed DM sender attribution bug — messages showed as from chat partner, not actual sender
- B @OpenClaw: Fixed senderE164 resolution — outbound DMs now correctly identify Oscar as sender
- B @OpenClaw: Discovered SIGUSR1 doesn't reload compiled JS — full restart required for code changes
- B @OpenClaw: Fixed monitor.ts logout handling — now waits for re-authentication instead of exiting
- B @WhatsApp: Discovered multi-device sync limitation — outbound phone messages don't reliably reach Baileys
- B @ClawHub: Published whatsapp-ultimate v1.0.1 with senderE164 fix
- B @AI-to-AI: Set up Max (Zeneida's AI) to message Jarvis — added +34659418211 to allowFrom
- B @Debugging: Traced full data flow Baileys → monitor.ts → message-line.ts → envelope.ts to find attribution bug

---
*Last updated: 2026-02-07 (consolidation)*
