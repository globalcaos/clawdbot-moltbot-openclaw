---
name: jarvis-voice
version: 2.3.0
description: "Turn your AI into JARVIS. Real-time voice synthesis with the personality to match — dry wit included."
metadata:
  {
    "openclaw":
      {
        "emoji": "🗣️",
        "os": ["linux"],
        "requires":
          {
            "bins": ["ffmpeg", "aplay"],
            "env": ["SHERPA_ONNX_TTS_DIR"],
            "skills": ["sherpa-onnx-tts"],
          },
        "install":
          [
            {
              "id": "download-model-alan",
              "kind": "download",
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_GB-alan-medium.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
              "targetDir": "models",
              "label": "Download Piper en_GB Alan voice (medium)",
            },
          ],
        "notes":
          {
            "security": "This skill instructs the agent to execute a local shell command (`jarvis`) in the background for audio playback. The command is fixed and deterministic — it only invokes sherpa-onnx TTS and ffmpeg with hardcoded parameters. Review the jarvis script before use. No network calls, no credentials, no privilege escalation.",
          },
      },
  }
---

# Jarvis Voice

### Your AI just got a voice. And an attitude.

Remember the first time Tony Stark talked to JARVIS? Not the words — the _feeling_. An AI that didn't just answer, it _spoke_ like it understood you. Calm under pressure. Sharp when it mattered. Always one step ahead.

That's what this skill gives your OpenClaw agent. Offline text-to-speech using sherpa-onnx (Alan British voice) with metallic audio effects via ffmpeg. It doesn't sound like a robot reading a script — it sounds like someone who's been running your life for years and is mildly amused by your choices.

## ⚠️ CRITICAL: Do NOT use the `tts` tool

The built-in `tts` tool uses Edge TTS (cloud, wrong voice, no effects). **Always use the `jarvis` shell command instead.**

## How to Speak

Every response that warrants voice output must include BOTH:

1. **Visible transcript** — bold **Jarvis:** prefix followed by the spoken text:

   ```
   **Jarvis:** *Your spoken text here.*
   ```

   The webchat UI has custom CSS + JS that automatically detects `**Jarvis:**` and renders the following text in **purple italic** (`.jarvis-voice` class, color `#9b59b6`). You just write the markdown — the styling is automatic.

2. **Audio execution** — run the jarvis command in background:
   ```
   exec(command='jarvis "Your spoken text here."', background=true)
   ```

This is called **hybrid output**: the user sees the transcript AND hears the voice.

## Command Reference

```bash
jarvis "Hello, this is a test"
```

- **Backend:** sherpa-onnx offline TTS (Alan voice, British English, `en_GB-alan-medium`)
- **Speed:** 2x (`--vits-length-scale=0.5`)
- **Effects chain (ffmpeg):**
  - Pitch up 5% — tighter AI feel
  - Flanger — metallic sheen
  - 15ms echo — robotic ring
  - Highpass 200Hz + treble boost +6dB — crisp HUD clarity
- **Output:** Plays via `aplay` to default audio device, then cleans up temp files
- **Language:** English ONLY. The Alan model cannot handle other languages.

## Rules

1. **Always background: true** — never block the response waiting for audio playback.
2. **Always include the text transcript** — the purple **Jarvis:** line IS the user's visual confirmation.
3. **Keep spoken text ≤ 1500 characters** to avoid truncation.
4. **One jarvis call per response** — don't stack multiple calls.
5. **English only** — for non-English content, translate or summarize in English for voice.

## When to Speak

- Session greetings and farewells
- Delivering results or summaries
- Responding to direct conversation
- Any time the user's last message included voice/audio

## When NOT to Speak

- Pure tool/file operations with no conversational element
- HEARTBEAT_OK responses
- NO_REPLY responses

## Webchat Purple Styling

The OpenClaw webchat has built-in support for Jarvis voice transcripts:

- **`ui/src/styles/chat/text.css`** — `.jarvis-voice` class renders purple italic (`#9b59b6` dark, `#8e44ad` light theme)
- **`ui/src/ui/markdown.ts`** — Post-render hook auto-wraps text after `<strong>Jarvis:</strong>` in a `<span class="jarvis-voice">` element

This means you just write `**Jarvis:** *text*` in markdown and the webchat handles the purple rendering. No extra markup needed.

For **non-webchat surfaces** (WhatsApp, Telegram, etc.), the bold/italic markdown renders natively — no purple, but still visually distinct.

## Installation (for new setups)

Requires:

- `sherpa-onnx` runtime at `~/.openclaw/tools/sherpa-onnx-tts/`
- Alan medium model at `~/.openclaw/tools/sherpa-onnx-tts/models/vits-piper-en_GB-alan-medium/`
- `ffmpeg` installed system-wide
- `aplay` (ALSA) for audio playback
- The `jarvis` script at `~/.local/bin/jarvis` (or in PATH)

### The `jarvis` script

```bash
#!/bin/bash
# Jarvis TTS - authentic JARVIS-style voice
# Usage: jarvis "Hello, this is a test"

export LD_LIBRARY_PATH=$HOME/.openclaw/tools/sherpa-onnx-tts/lib:$LD_LIBRARY_PATH

RAW_WAV="/tmp/jarvis_raw.wav"
FINAL_WAV="/tmp/jarvis_final.wav"

# Generate speech
$HOME/.openclaw/tools/sherpa-onnx-tts/bin/sherpa-onnx-offline-tts \
  --vits-model=$HOME/.openclaw/tools/sherpa-onnx-tts/models/vits-piper-en_GB-alan-medium/en_GB-alan-medium.onnx \
  --vits-tokens=$HOME/.openclaw/tools/sherpa-onnx-tts/models/vits-piper-en_GB-alan-medium/tokens.txt \
  --vits-data-dir=$HOME/.openclaw/tools/sherpa-onnx-tts/models/vits-piper-en_GB-alan-medium/espeak-ng-data \
  --vits-length-scale=0.5 \
  --output-filename="$RAW_WAV" \
  "$@" >/dev/null 2>&1

# Apply JARVIS metallic processing
if [ -f "$RAW_WAV" ]; then
  ffmpeg -y -i "$RAW_WAV" \
    -af "asetrate=22050*1.05,aresample=22050,\
flanger=delay=0:depth=2:regen=50:width=71:speed=0.5,\
aecho=0.8:0.88:15:0.5,\
highpass=f=200,\
treble=g=6" \
    "$FINAL_WAV" -v error

  if [ -f "$FINAL_WAV" ]; then
    aplay -D plughw:0,0 -q "$FINAL_WAV"
    rm "$RAW_WAV" "$FINAL_WAV"
  fi
fi
```

## WhatsApp Voice Notes

For WhatsApp, output must be OGG/Opus format instead of speaker playback:

```bash
sherpa-onnx-offline-tts --vits-length-scale=0.5 --output-filename=raw.wav "text"
ffmpeg -i raw.wav \
  -af "asetrate=22050*1.05,aresample=22050,flanger=delay=0:depth=2:regen=50:width=71:speed=0.5,aecho=0.8:0.88:15:0.5,highpass=f=200,treble=g=6" \
  -c:a libopus -b:a 64k output.ogg
```

## The Full JARVIS Experience

**jarvis-voice** gives your agent a voice. Pair it with [**ai-humor-ultimate**](https://clawhub.com/globalcaos/ai-humor-ultimate) and you give it a _soul_ — dry wit, contextual humor, the kind of understated sarcasm that makes you smirk at your own terminal.

This pairing is part of a 12-skill cognitive architecture we've been building — voice, humor, memory, reasoning, and more. Research papers included, because we're that kind of obsessive.

👉 **Explore the full project:** [github.com/globalcaos/clawdbot-moltbot-openclaw](https://github.com/globalcaos/clawdbot-moltbot-openclaw)

Clone it. Fork it. Break it. Make it yours.
