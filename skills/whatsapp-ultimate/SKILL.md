---
name: whatsapp-ultimate
version: 2.0.3
description: "Complete WhatsApp integration for OpenClaw agents — send messages, media, polls, stickers, voice notes, reactions & replies. Search chat history with full-text search (SQLite + FTS5). Download & transcribe voice messages. Import chat exports. Full history resync. NEW: 🔒 Strict 3-Rule Group Gate (allowed chat + authorized sender + triggerPrefix). DM prefix gate — require triggerPrefix for ALL conversations. Audio preflight passthrough — voice notes transcribed then prefix-checked. responsePrefix config for outbound 🤖 branding. 🤔↔🧐 Thinking Heartbeat. Native Baileys — zero Docker, zero external tools. Works alongside OpenClaw's built-in WhatsApp channel."
homepage: https://github.com/openclaw/openclaw
repository: https://github.com/openclaw/openclaw
metadata:
  openclaw:
    emoji: "📱"
    requires:
      channels: ["whatsapp"]
    tags:
      - whatsapp
      - messaging
      - chat
      - voice-notes
      - group-management
      - message-history
      - search
      - media
      - polls
      - stickers
      - reactions
      - thinking-indicator
      - progress-indicator
      - typing-indicator
      - voice-messages
      - baileys
      - security
      - access-control
      - trigger-prefix
      - voice-transcription
---

# WhatsApp Ultimate

> **Your AI agent on WhatsApp — not a chatbot, a real presence.**

Send messages, voice notes, polls, stickers, and reactions. Search years of chat history instantly. Manage groups, transcribe voice messages, and control exactly who talks to your agent and when. Native Baileys integration — **zero Docker, zero external services, zero monthly fees.**

This isn't a wrapper around a REST API. This is your agent living inside WhatsApp as a first-class participant.

---

## Why This Skill Exists

Every other WhatsApp integration we found was either:

- **A webhook relay** that could send text and... that's it
- **A Docker container** you had to babysit
- **A Business API wrapper** requiring Meta approval and a separate phone number
- **A CLI tool** that couldn't search history or manage groups

We built what we actually needed: an agent that can do _everything_ a human can do on WhatsApp — from sending a thumbs-up reaction to pulling 3 years of chat history into a searchable database. And we made it secure enough to share a phone number with family.

---

## What You Get

### 24 Distinct Actions

| Category         | What Your Agent Can Do                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Messaging**    | Text, images, videos, documents, voice notes, GIFs, polls, stickers                   |
| **Interactions** | React with any emoji, reply/quote, edit sent messages, unsend/delete                  |
| **Groups**       | Create, rename, set icon/description, add/remove/promote/demote members, invite links |
| **History**      | Full-text search (SQLite + FTS5), date filters, sender filters, bulk import           |
| **Voice**        | Transcribe incoming voice notes, send metallic TTS replies                            |
| **Security**     | 3-rule group gate, DM prefix gate, per-conversation access control                    |

### What Makes This Different

**🔒 Strict 3-Rule Group Gate** — The #1 problem with AI agents in WhatsApp groups: they respond to everything. Someone shares a photo? The agent chimes in. A family member sends a meme? The agent analyzes it. We fixed this with three rules that ALL must pass before your agent opens its mouth:

1. **Is this an allowed group?** — You whitelist which group chats the agent responds in. The agent sees all chats (for history search, context, and awareness), but only triggers a response in approved groups.
2. **Is this person authorized?** — Even in an allowed group, only specific phone numbers can trigger the agent. Your cousin's random messages? Ignored.
3. **Did they say the magic word?** — The message must start with your trigger prefix (e.g. "Jarvis"). No prefix, no response. Photos, stickers, memes, forwarded chains — all silently ignored.

No bypasses, no exceptions, no "but the owner sent media so let it through." Your agent stays silent until explicitly addressed by name, by someone you trust, in a chat you approved.

**🤔↔🧐 Thinking Heartbeat** — WhatsApp's linked-device API can't show "typing..." in groups ([Baileys #866](https://github.com/WhiskeySockets/Baileys/issues/866)). We solved it: the agent reacts with 🤔 instantly, alternates to 🧐, and removes the reaction when the reply is ready. Your users always know the agent is working. No other WhatsApp skill does this.

**🎤 Voice-First Design** — Voice notes are transcribed _before_ prefix checking. Say "Jarvis, what's the weather?" in a voice note and it works exactly like text. The transcript is checked against `triggerPrefix`, and the agent responds with a metallic voice reply using local TTS. Zero cloud costs. Pair with the [sherpa-onnx-tts](https://clawhub.com/skills/sherpa-onnx-tts) skill for the full JARVIS effect, or use [jarvis-voice](https://clawhub.com/skills/jarvis-voice) for a ready-made metallic voice pipeline.

**📚 Searchable History** — Every message is stored in SQLite with FTS5 full-text search. Import years of old chats from WhatsApp exports. Ask your agent _"what did Sarah say about the deadline last month?"_ and get an instant answer. Combine with [agent-memory-ultimate](https://clawhub.com/skills/agent-memory-ultimate) for cognitive recall that spans WhatsApp, email, calendar, and more.

**🔄 Full History Resync** — Pull your entire WhatsApp history (3+ years, 17K+ messages) into the local database with a single re-link. No manual exports needed.

---

## Quick Start

### Prerequisites

- [OpenClaw](https://docs.openclaw.ai) with WhatsApp channel configured
- WhatsApp account linked via QR code (`openclaw whatsapp login`)

### Minimal Config

```json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "allowlist",
      "allowFrom": ["+1234567890"],
      "triggerPrefix": "jarvis",
      "messagePrefix": "🤖",
      "responsePrefix": "🤖"
    }
  }
}
```

That's it. Your agent now responds only to your messages, only when you say "Jarvis", and every reply is tagged with 🤖 so you always know who's talking.

---

## Messaging

### Send Text

```
message action=send channel=whatsapp to="+34612345678" message="Hello!"
```

### Send Media (Image/Video/Document)

```
message action=send channel=whatsapp to="+34612345678" message="Check this out" filePath=/path/to/image.jpg
```

Supported: JPG, PNG, GIF, MP4, PDF, DOC, etc.

### Send Poll

```
message action=poll channel=whatsapp to="+34612345678" pollQuestion="What time?" pollOption=["3pm", "4pm", "5pm"]
```

### Send Sticker

```
message action=sticker channel=whatsapp to="+34612345678" filePath=/path/to/sticker.webp
```

Must be WebP format, ideally 512x512.

### Send Voice Note

```
message action=send channel=whatsapp to="+34612345678" filePath=/path/to/audio.ogg asVoice=true
```

**Critical:** Use OGG/Opus format. MP3 may not play correctly on WhatsApp.

### Send GIF

```
message action=send channel=whatsapp to="+34612345678" filePath=/path/to/animation.mp4 gifPlayback=true
```

Convert GIF to MP4 first (WhatsApp requires this):

```bash
ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4 -y
```

---

## Interactions

### Reactions

```
# Add reaction
message action=react channel=whatsapp chatJid="34612345678@s.whatsapp.net" messageId="ABC123" emoji="🚀"

# Remove reaction
message action=react channel=whatsapp chatJid="34612345678@s.whatsapp.net" messageId="ABC123" remove=true
```

### Reply/Quote

```
message action=reply channel=whatsapp to="34612345678@s.whatsapp.net" replyTo="QUOTED_MSG_ID" message="Replying to this!"
```

### Edit & Unsend

```
# Edit (own messages only)
message action=edit channel=whatsapp chatJid="34612345678@s.whatsapp.net" messageId="ABC123" message="Updated text"

# Unsend/delete
message action=unsend channel=whatsapp chatJid="34612345678@s.whatsapp.net" messageId="ABC123"
```

---

## Group Management

Full group lifecycle — create, configure, manage members, and control access:

```
# Create group
message action=group-create channel=whatsapp name="Project Team" participants=["+34612345678"]

# Rename / set icon / set description
message action=renameGroup channel=whatsapp groupId="123@g.us" name="New Name"
message action=setGroupIcon channel=whatsapp groupId="123@g.us" filePath=/path/to/icon.jpg
message action=setGroupDescription channel=whatsapp groupJid="123@g.us" description="Team chat"

# Manage members
message action=addParticipant channel=whatsapp groupId="123@g.us" participant="+34612345678"
message action=removeParticipant channel=whatsapp groupId="123@g.us" participant="+34612345678"
message action=promoteParticipant channel=whatsapp groupJid="123@g.us" participants=["+34612345678"]
message action=demoteParticipant channel=whatsapp groupJid="123@g.us" participants=["+34612345678"]

# Invite links
message action=getInviteCode channel=whatsapp groupJid="123@g.us"
message action=revokeInviteCode channel=whatsapp groupJid="123@g.us"

# Group info
message action=getGroupInfo channel=whatsapp groupJid="123@g.us"

# Leave group
message action=leaveGroup channel=whatsapp groupId="123@g.us"
```

---

## 🔒 Access Control (v2.0)

The most granular WhatsApp access control available for any AI agent. Because the last thing you want is your agent responding to your mother-in-law's photos with a treatise on capitulaciones matrimoniales.

### The 3-Rule Gate (Groups)

Every group message must pass ALL three rules:

| Rule                 | Check                                                                | Configured By                                  |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| 1. Allowed Chat      | Is this group in the allowlist?                                      | `groupPolicy` + group JIDs in `groupAllowFrom` |
| 2. Authorized Sender | Is this person allowed to talk to the agent?                         | Phone numbers in `groupAllowFrom`              |
| 3. Trigger Prefix    | Does the message start with "Jarvis" (or @mention, or reply-to-bot)? | `triggerPrefix`                                |

**No bypasses.** Photos, videos, stickers, documents — all silently ignored unless the sender explicitly addresses the agent by name. Owner slash commands (`/new`, `/status`) pass without prefix.

### DM Prefix Gate

The same `triggerPrefix` applies to DMs too. Messages without the prefix are silently dropped. Voice notes are transcribed first, then checked.

### Configuration

```json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "allowlist",
      "allowFrom": ["+34612345678", "+14155551234"],
      "groupPolicy": "allowlist",
      "groupAllowFrom": ["+34612345678", "+14155551234", "120363409030785922@g.us"],
      "triggerPrefix": "jarvis",
      "messagePrefix": "🤖",
      "responsePrefix": "🤖"
    }
  }
}
```

| DM Policy     | Behavior                           |
| ------------- | ---------------------------------- |
| `"open"`      | Anyone can DM                      |
| `"allowlist"` | Only numbers in `allowFrom`        |
| `"pairing"`   | Unknown senders get pairing prompt |
| `"disabled"`  | No DMs accepted                    |

| Group Policy  | Behavior                              |
| ------------- | ------------------------------------- |
| `"open"`      | Responds to mentions in any group     |
| `"allowlist"` | Only from senders in `groupAllowFrom` |
| `"disabled"`  | Ignores all group messages            |

### Self-Chat Mode

```json
{ "channels": { "whatsapp": { "selfChatMode": true } } }
```

Talk to your agent through your "Note to Self" chat.

---

## 🤔 Thinking Heartbeat

**The problem:** WhatsApp linked devices can't show "typing..." in groups. This is a WhatsApp server-side limitation — confirmed in [Baileys #866](https://github.com/WhiskeySockets/Baileys/issues/866).

**Our solution:** The agent reacts with 🤔 instantly (<100ms), alternates to 🧐 every second, and removes the reaction when the reply arrives. It doubles as a watchdog — if the reaction freezes on one emoji, something is hung.

Works in groups ✅ and DMs ✅.

---

## 📚 Message History & Search

Every message stored in SQLite with FTS5 full-text search. Import old chats. Search by keyword, sender, date, or chat.

```
# Search by keyword
whatsapp_history action=search query="meeting tomorrow"

# Filter by chat
whatsapp_history action=search chat="Family Group" limit=50

# What did I say?
whatsapp_history action=search fromMe=true query="I promised"

# Filter by sender
whatsapp_history action=search sender="John" limit=20

# Date range
whatsapp_history action=search since="2026-01-01" until="2026-02-01"

# Database stats
whatsapp_history action=stats
```

### Import Historical Chats

1. Export from phone: Settings → Chats → Export chat → Without media
2. Import:

```
whatsapp_history action=import path="/path/to/exports"
whatsapp_history action=import path="/path/to/chat.txt" chatName="Family Group"
```

### Full History Resync

Pull 3+ years of history with a single re-link:

```bash
curl -X POST http://localhost:18789/api/whatsapp/resync
```

Then scan the QR code. In testing: **17,609 messages across 1,229 chats spanning 3+ years.**

Database: `~/.openclaw/data/whatsapp-history.db` (SQLite + WAL mode)

---

## 🎤 Voice Pipeline

### Incoming Voice Notes

Voice notes are transcribed _before_ prefix checking:

```
Voice note → Download OGG → Transcribe (Whisper) → Check triggerPrefix → Process
```

Say "Jarvis, what's on my calendar?" — the transcript is checked, prefix matches, agent responds. No prefix? Silently dropped after transcription.

### Outgoing Metallic Voice

Send JARVIS-style voice replies with local TTS:

```bash
# Generate metallic voice note
jarvis-wa "Systems nominal, sir." /tmp/reply.ogg

# Send as WhatsApp voice note
message action=send channel=whatsapp target="+1234567890" filePath=/tmp/reply.ogg asVoice=true
```

Effects chain: 2x speed → +5% pitch → flanger → 15ms echo → high-pass 200Hz → treble +6dB

Requires [sherpa-onnx-tts](https://clawhub.com/skills/sherpa-onnx-tts). See also [jarvis-voice](https://clawhub.com/skills/jarvis-voice) for the full speaker + webchat voice pipeline.

---

## 🔄 Offline Recovery

Gateway down? Messages aren't lost. WhatsApp delivers missed messages on reconnect, and OpenClaw processes them automatically (6-hour recovery window). Recovered messages are tagged `[OFFLINE RECOVERY]` so your agent can batch-review instead of blindly acting on stale requests.

---

## Download & Transcribe Media

The history database stores full WAMessage protos including media encryption keys. Download any voice message, image, or document:

| Media Type  | Proto Field       | Content Type |
| ----------- | ----------------- | ------------ |
| Voice/Audio | `audioMessage`    | `"audio"`    |
| Image       | `imageMessage`    | `"image"`    |
| Video       | `videoMessage`    | `"video"`    |
| Document    | `documentMessage` | `"document"` |
| Sticker     | `stickerMessage`  | `"sticker"`  |

Media URLs expire — download soon after receiving, or ensure the WhatsApp socket is connected for re-fetch.

---

## Pairs Well With

Build a complete AI assistant stack:

| Skill                                                                             | What It Adds                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [agent-memory-ultimate](https://clawhub.com/skills/agent-memory-ultimate)         | Cognitive memory — your agent remembers WhatsApp conversations across sessions |
| [sherpa-onnx-tts](https://clawhub.com/skills/sherpa-onnx-tts)                     | Local text-to-speech engine for metallic voice replies                         |
| [jarvis-voice](https://clawhub.com/skills/jarvis-voice)                           | Full JARVIS voice pipeline — webchat speakers + WhatsApp voice notes           |
| [openai-whisper](https://clawhub.com/skills/openai-whisper)                       | Local speech-to-text for voice note transcription (no API costs)               |
| [agent-boundaries-ultimate](https://clawhub.com/skills/agent-boundaries-ultimate) | Safety framework for agents with messaging access                              |
| [shell-security-ultimate](https://clawhub.com/skills/shell-security-ultimate)     | Command classification before your agent runs anything dangerous               |
| [gog](https://clawhub.com/skills/gog)                                             | Google Workspace — your agent reads Gmail/Calendar and reports via WhatsApp    |
| [outlook-hack](https://clawhub.com/skills/outlook-hack)                           | Outlook email access — draft replies, check calendar, all via WhatsApp         |
| [ai-humor-ultimate](https://clawhub.com/skills/ai-humor-ultimate)                 | 12 humor patterns — make your agent's WhatsApp replies actually fun            |
| [youtube](https://clawhub.com/skills/youtube)                                     | YouTube transcripts — "Jarvis, summarize this video" works in WhatsApp         |

---

## Comparison

| Feature                            | whatsapp-ultimate | wacli            | whatsapp-business     |
| ---------------------------------- | ----------------- | ---------------- | --------------------- |
| Native integration                 | ✅ Zero deps      | ❌ Go CLI binary | ❌ External API + key |
| Actions                            | **24+**           | ~6               | ~10                   |
| Polls                              | ✅                | ❌               | ❌                    |
| Stickers                           | ✅                | ❌               | ❌                    |
| Voice notes                        | ✅                | ❌               | ❌                    |
| Reactions                          | ✅                | ❌               | ❌                    |
| Reply/Quote/Edit/Unsend            | ✅                | ❌               | ❌                    |
| Full group management              | ✅                | ❌               | ❌                    |
| Thinking indicator                 | ✅ 🤔↔🧐          | ❌               | ❌                    |
| 3-rule group gate                  | ✅                | ❌               | ❌                    |
| DM prefix gate                     | ✅                | ❌               | ❌                    |
| Voice transcription → prefix check | ✅                | ❌               | ❌                    |
| SQLite history + FTS5              | ✅                | ✅ (sync)        | ❌                    |
| Chat export import                 | ✅                | ❌               | ❌                    |
| Full history resync                | ✅                | ❌               | ❌                    |
| Offline recovery                   | ✅                | ❌               | ❌                    |
| Personal WhatsApp                  | ✅                | ✅               | ❌ (Business only)    |
| Monthly cost                       | **$0**            | $0               | $$ (Meta pricing)     |

---

## JID Reference

| Type       | Format                    | Example                      |
| ---------- | ------------------------- | ---------------------------- |
| Individual | `<number>@s.whatsapp.net` | `34612345678@s.whatsapp.net` |
| Group      | `<id>@g.us`               | `123456789012345678@g.us`    |

OpenClaw auto-converts phone numbers to JID format when using `to=`.

---

## Troubleshooting

**Messages from contacts not reaching agent** → Add them to `allowFrom` (not just `groupAllowFrom`). Group and DM access are separate.

**Voice notes won't play** → Use OGG/Opus: `ffmpeg -i input.mp3 -c:a libopus -b:a 64k output.ogg`

**Agent responds to everything in groups** → Set `triggerPrefix: "jarvis"` and ensure `groupPolicy: "allowlist"`.

**No typing indicator in groups** → This is a WhatsApp limitation. The 🤔 thinking reaction is your indicator.

---

## Architecture

```
Your Agent → OpenClaw message tool → WhatsApp Channel Plugin → Baileys → WhatsApp Servers
```

No external services. No Docker. No CLI tools. Direct protocol integration via [Baileys](https://github.com/WhiskeySockets/Baileys).

---

## Links

- [OpenClaw](https://docs.openclaw.ai) — The agent framework
- [ClawHub](https://clawhub.com) — Skill marketplace
- [OpenClaw GitHub](https://github.com/openclaw/openclaw) — Source code
- [Baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Web protocol
- [OpenClaw Discord](https://discord.com/invite/clawd) — Community

---

## License

MIT — Part of [OpenClaw](https://github.com/openclaw/openclaw)

_Built by people who actually use their AI agent on WhatsApp every day._
