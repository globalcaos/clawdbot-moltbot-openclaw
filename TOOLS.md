# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

---

## Voice Interface (Jarvis)

### TTS (Speak)
**Command:** `jarvis "text"` (plays to speakers)
- **Backend:** sherpa-onnx (Alan voice, 2x speed) + ffmpeg
- **Effects:** Metallic (flanger, echo 15ms, +5% pitch, treble boost)
- **Sample rate:** 22050Hz (native)
- **Output:** Headphones (Card 0) via `jarvis` script
- **IMPORTANT:** Always run with `background: true` to avoid blocking text response

### TTS for WhatsApp (Voice Notes)
**Format:** OGG/Opus (required for WhatsApp playback)
**Process:**
```bash
# 1. Generate raw WAV
sherpa-onnx-offline-tts --vits-length-scale=0.5 --output-filename=raw.wav "text"

# 2. Apply Jarvis effects + convert to OGG
ffmpeg -i raw.wav \
  -af "asetrate=22050*1.05,aresample=22050,flanger=delay=0:depth=2:regen=50:width=71:speed=0.5,aecho=0.8:0.88:15:0.5,highpass=f=200,treble=g=6" \
  -c:a libopus -b:a 64k output.ogg
```
**Note:** MP3 was corrupted on WhatsApp; OGG works reliably.

### STT (Listen)
**Command:** `listen [seconds]`
- **Backend:** Local Whisper (base model)
- **Input:** Jabra (plughw:2,0)

### Always-On Wake Word
**Command:** `jarvis-daemon`
- **Trigger:** "JARVIS" or "HEY JARVIS"
- **Backend:** sherpa-onnx-keyword-spotter (CPU efficient)
- **Action:** Beeps, records 5s, transcribes
- **Usage:** Run in a separate terminal: `jarvis-daemon`

---

## Cameras

*(none configured yet)*

## SSH Hosts

*(none configured yet)*

---

## Manus AI (Parallel Task Agent)

**API Key:** Stored in config (`MANUS_API_KEY`)
**Endpoint:** `https://api.manus.ai/v1/tasks`
**Model:** manus-1.6-adaptive

### When to Use Manus (ALL 3 must be true)
1. Task is **async** (minutes→hours acceptable)
2. Task requires **tool use** (browsing, files, code execution)
3. **Human steering is inefficient**

**Good fits:**
- Deep market/competitor research
- Due diligence dossiers
- Multi-source synthesis with citations
- "Go figure this out end-to-end" problems

**Don't use for:**
- Quick questions (→ Claude/Gemini)
- Fast feedback loops
- Exploratory/conversational tasks

### Credit Cost Tiers (estimate from experience)
| Tier | Task Type | Credits |
|------|-----------|---------|
| 🟢 Low | Single-pass summary | 2-5 |
| 🟡 Medium | Multi-source research | 5-10 |
| 🟠 High | Competitive landscape | 10-20 |
| 🔴 Very high | Deep due diligence | 20-50 |
| 🔥 Killer | Vague "explore X" prompts | 50+ |

### Credit Burn Drivers (most→least impact)
1. **Agent runtime** — minutes > tokens
2. **Tool usage** — browsing/scraping compounds
3. **Iteration depth** — self-correction loops
4. **Output volume** — long reports (smaller factor)

### Optimal Workflow: Sandwich Pattern
```
Claude (cheap) → Manus (expensive) → Claude (cheap)
   ↓                  ↓                  ↓
 Clarify scope    ONE defined task    Refine output
 Define structure  With constraints   Follow-ups
```
*This cuts Manus costs by 50-70%*

### Prompt Optimization (Credit Reduction)
**Always include:**
- `"Use at most N sources"` — caps browsing
- `"Stop once key points identified"` — prevents loops
- `"Max 2 pages per source"` — limits depth
- `"Do not include internal reasoning"` — reduces hidden cycles

**Pre-structure output:**
```
"Produce:
- Market size (2024–2026)
- Top 5 players (1 paragraph each)
- Key risks (bullet list)
Stop when complete."
```

**NEVER use:** "Explore everything about X" = runaway burn

### Budget Safety
- Apply **30% buffer**: `effective_remaining = dashboard × 0.7`
- Track credits-per-runtime-hour (correlates well with cost)
- **Abort early** if task is clearly off-track

### Mental Model
> *"Manus = junior analyst with unlimited autonomy and a ticking meter. Box it in."*

### API Usage
```bash
# Create task
curl -X POST 'https://api.manus.ai/v1/tasks' \
  -H 'API_KEY: $MANUS_API_KEY' \
  -H 'content-type: application/json' \
  -d '{"prompt": "your task here"}'

# Check task status
curl -X GET 'https://api.manus.ai/v1/tasks/{task_id}' \
  -H 'API_KEY: $MANUS_API_KEY'
```

### Response Format
```json
{
  "task_id": "abc123",
  "status": "running|pending|completed|error",
  "task_url": "https://manus.im/app/abc123",
  "output": [...],
  "credit_usage": 2
}
```

### Autonomous Decision Rule
When Oscar asks for research, analysis, or complex tasks:
1. Start task on Manus in background
2. Continue conversation on Claude
3. Check Manus result and report when ready

---

## Gemini (Fallback Model)

**Provider:** google/gemini-3-pro-preview
**Auth:** API key in auth-profiles.json

### When I Switch to Gemini
- Claude rate limited (429)
- Claude overloaded
- Claude auth failure
- Automatic via failover chain

### When to Proactively Use Gemini
- Image analysis tasks (Gemini has strong vision)
- Very long context windows needed
- When Claude is slow/struggling

## Network Shares

- **Offers Repository:** `smb://192.168.0.1/dades/03 Comercial/02 Ofertes/`
  - Domain: TSERRA.local
  - User: o.serra
  - Use PDF versions (unchanged)

---

## Why This File?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Session Start Prompt (Self-Modifiable)

**Location:** `/home/globalcaos/src/clawdbot-moltbot-openclaw/src/auto-reply/reply/get-reply-run.ts`
**Variable:** `BARE_SESSION_RESET_PROMPT` (around line 51)

This is the prompt OpenClaw sends me when a new session starts via `/new` or `/reset`. I can edit this to improve my own boot behavior.

**Current prompt:**
```
New session started. Before greeting: 1) Read SOUL.md, USER.md, AGENTS.md, IDENTITY.md, MEMORY.md, TOOLS.md from workspace. 2) Read memory/YYYY-MM-DD.md for today and yesterday. 3) Create today's log if missing. 4) Greet in your configured persona and ask what to work on. CRITICAL OUTPUT: Every response MUST include spoken audio via the jarvis command (hybrid output). If runtime model differs from default_model, mention it. Do not narrate these steps to the user.
```

**Changes (2026-02-04):**
- Removed "briefly (1-3 sentences)" — arbitrary constraint
- Added "CRITICAL OUTPUT: Every response MUST include spoken audio via the jarvis command" — proximate instruction for voice compliance

**After editing:** Rebuild with `cd /home/globalcaos/src/clawdbot-moltbot-openclaw && npm run build` then restart gateway.

**When to modify:** If I notice a pattern of forgetting something at session start, or if a better initialization sequence emerges.
