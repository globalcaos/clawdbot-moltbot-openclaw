# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

---

## Voice Interface (Jarvis)

### TTS (Speak)
**Command:** `jarvis "text"`
- **Backend:** sherpa-onnx (Alan voice, 2x speed) + ffmpeg
- **Effects:** Metallic (echo 0.25/0.2 decay + chorus + EQ), +5% pitch, bright treble
- **Sample rate:** 22050Hz (native)
- **Output:** Headphones (Card 0) via `jarvis` script

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

### When to Use Manus
- **Deep research** — competitor analysis, market research, technical deep-dives
- **Code generation** — full scripts, multi-file projects
- **Document analysis** — PDFs, reports, lengthy content
- **Web scraping/automation** — data extraction tasks
- **Any task that benefits from "thinking longer"**

### When NOT to Use Manus
- Quick questions (use Claude/Gemini)
- Real-time conversation
- Urgent/time-sensitive requests

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
