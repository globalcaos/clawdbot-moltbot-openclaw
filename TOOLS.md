# TOOLS.md - Quick Reference

_Full details: `bank/reference/` — use `memory_search` to retrieve._

## Voice

- **Speak:** `jarvis "text"` (background: true) — English only
- **WhatsApp:** OGG/Opus format (see `bank/reference/voice-commands.md`)
- **Listen:** `listen [seconds]` — Whisper, Jabra input

## Manus AI

- Async research agent. Use for deep research only (ALL 3: async + tool use + human steering inefficient)
- Full guide: `bank/reference/manus-guide.md`

## Gemini (Fallback)

- Auto-switches on Claude 429/overload/auth failure
- Good for: image analysis, long context

## WhatsApp Groups

| Group       | JID                     | Purpose               |
| ----------- | ----------------------- | --------------------- |
| Jarvis News | 120363424036294869@g.us | Reports, deliverables |
| Max-Jarvis  | 120363409030785922@g.us | Agent coordination    |

## Network Shares

- **Offers:** `smb://192.168.0.1/dades/03 Comercial/02 Ofertes/` (TSERRA.local, o.serra)

## GUI

- `nohup gedit /path/to/file &>/dev/null &` for copy-paste files
- Tampermonkey widgets: gedit → Oscar copy-pastes → refresh webchat

## Session Start Prompt

- Location: `src/auto-reply/reply/get-reply-run.ts` line ~51
- After editing: `cd ~/src/clawdbot-moltbot-openclaw && npm run build` then restart

## Model Selection

- **Primary:** Opus (Max subscription)
- **Heartbeats:** llama3.2:1b (local, free)
- **Available:** qwen3 (local 14B), glm (local 19B), haiku, sonnet, gemini

## Rate Limits

- 5s between API calls, 10s between searches, max 5 searches/batch
- On 429: STOP, wait 5 min, retry once
