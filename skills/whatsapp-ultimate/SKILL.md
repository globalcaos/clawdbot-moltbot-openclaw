---
name: whatsapp-ultimate
version: 3.3.0
description: "WhatsApp skill with a 3-rule security gate. Your agent speaks only when spoken to — in the right chat, by the right person."
metadata:
  {
    "openclaw":
      {
        "emoji": "💬",
        "os": ["linux", "darwin"],
        "requires": { "bins": ["npx", "tsx", "sed", "python3"], "channels": ["whatsapp"] },
        "patches":
          {
            "description": "Two optional bash scripts patch OpenClaw source files to add (1) self-chat history capture in monitor.ts and (2) model/auth prefix template variables in response-prefix-template.ts, types.ts, reply-prefix.ts, and agent-runner-execution.ts. Both scripts are idempotent (safe to run multiple times) and skip if already applied. Review the scripts before running.",
            "files": ["scripts/apply-history-fix.sh", "scripts/apply-model-prefix.sh"],
            "modifies":
              [
                "src/web/inbound/monitor.ts",
                "src/auto-reply/reply/response-prefix-template.ts",
                "src/auto-reply/types.ts",
                "src/channels/reply-prefix.ts",
                "src/auto-reply/reply/agent-runner-execution.ts",
              ],
            "mechanism": "sed + python3 string replacement with anchor-point matching",
            "reversible": "git checkout on modified files restores originals",
          },
        "notes":
          {
            "security": "PATCHES: Two optional install scripts modify OpenClaw source files using sed and python3 to add history capture and model prefix features. Both are idempotent and skip if already applied. Review scripts/apply-history-fix.sh and scripts/apply-model-prefix.sh before running. ADMIN SCRIPTS: wa-fetch-contacts.ts and wa-create-group.ts connect to WhatsApp via Baileys using existing OpenClaw credentials in ~/.openclaw/credentials/whatsapp/. No new credentials are requested. No external network calls beyond WhatsApp's own WebSocket connection. All operations are local.",
          },
      },
  }
---

# WhatsApp Ultimate

**Your agent won't flirt with your boss in the company group.**

It won't offer unsolicited life advice to your mother-in-law. It won't settle a family debate about paella with a 400-word essay nobody asked for. It won't reply "Actually..." to your partner's story at 2 AM.

Because WhatsApp Ultimate has a 3-rule security gate: **right person + right chat + right prefix = response. Everything else = absolute silence.** Not "maybe silence." Not "I'll just help a little." Stone-cold, disciplined, beautiful silence.

That's the gate. Here's the engine:

- 🤖 **Model ID on every reply** — `claude-opus-4-6|sub` stamped on each message, so nobody mistakes the bot for a human
- **Full message history capture** — every conversation stored and searchable. Context that doesn't evaporate.
- **Contact sync + group management** — your agent knows who's who without hand-holding
- **Thinking heartbeat** — typing indicators while processing, so users know it's alive
- **Direct Baileys API** — no middleware bloat. Fast. Light. Reliable.

Three rules. Zero awkward moments. Because we're that kind of obsessive.

## The Full Stack

Pair with [**jarvis-voice**](https://clawhub.com/globalcaos/jarvis-voice) for WhatsApp voice notes and [**ai-humor-ultimate**](https://clawhub.com/globalcaos/ai-humor-ultimate) for personality. Both part of a 13-skill cognitive architecture.

👉 **[Clone it. Fork it. Break it. Make it yours.](https://github.com/globalcaos/clawdbot-moltbot-openclaw)**

---

## Features

### Messaging & Monitoring

- **Model ID Prefix:** Every bot message shows which model and auth mode is active: `🤖(claude-opus-4-6|sub)` or `🤖(gpt-4o|api)`. Instantly know what's running.
- **Complete Message History:** Captures ALL messages — including self-chat inbound messages that Baileys misses
- **Self-Chat Mode:** Full bidirectional logging in your own chat (command channel)
- **Security Gating:** 3-rule allowlist — authorized users, authorized chats, trigger prefix
- **Full History Sync:** Enable `syncFullHistory: true` to backfill messages on reconnect

### Administration & Group Management

- **Contact Sync:** Extract all contacts from all WhatsApp groups with phone numbers, admin status, and LID resolution
- **Group Creation:** Create groups programmatically with participant lists
- **Group Management:** Rename, update descriptions, add/remove/promote/demote participants
- **Direct Baileys Access:** Bypasses the gateway — works even if the listener is down

## Setup

### Install

```bash
clawhub install whatsapp-ultimate
```

### ⚠️ Patches (Optional — Read Before Running)

This skill includes two **optional** bash scripts that patch OpenClaw source files. The base skill (security gating, admin tools, contact sync) works without them. The patches add:

1. **`apply-history-fix.sh`** — Captures self-chat messages that Baileys misses. Modifies `monitor.ts`.
2. **`apply-model-prefix.sh`** — Adds model/auth info to every reply. Modifies `response-prefix-template.ts`, `types.ts`, `reply-prefix.ts`, `agent-runner-execution.ts`.

**Before running:**

- Read each script — they're short and commented
- `git commit` your OpenClaw repo first (so you can `git checkout` to revert)
- Both scripts are idempotent (safe to run multiple times)
- Both skip automatically if already applied

```bash
# Review first, then run:
bash ~/.openclaw/workspace/skills/whatsapp-ultimate/scripts/apply-history-fix.sh
bash ~/.openclaw/workspace/skills/whatsapp-ultimate/scripts/apply-model-prefix.sh
```

**What they touch:**
| Script | Files Modified | What Changes |
|--------|---------------|-------------|
| apply-history-fix.sh | `src/web/inbound/monitor.ts` | Adds `insertHistoryMessage()` call to store all inbound messages |
| apply-model-prefix.sh | 4 files in `src/` | Adds `{authMode}` and `{authProfile}` template variables |

**To revert:** `git checkout -- src/` from your OpenClaw repo root.

### Config (openclaw.json)

```json
{
  "channels": {
    "whatsapp": {
      "selfChatMode": true,
      "syncFullHistory": true,
      "responsePrefix": "🤖({model}|{authMode})",
      "dmPolicy": "allowlist",
      "allowFrom": ["+your_number"],
      "triggerPrefix": "jarvis"
    }
  }
}
```

## Model ID Prefix

The `responsePrefix` supports template variables:

| Variable        | Example           | Description                                            |
| --------------- | ----------------- | ------------------------------------------------------ |
| `{model}`       | `claude-opus-4-6` | Short model name                                       |
| `{authMode}`    | `sub` / `api`     | Auth mode: `sub` = subscription/OAuth, `api` = API key |
| `{provider}`    | `anthropic`       | Provider name                                          |
| `{auth}`        | `sub`             | Alias for `{authMode}`                                 |
| `{authProfile}` | `anthropic:oauth` | Full auth profile ID                                   |
| `{think}`       | `low`             | Current thinking level                                 |

**Prefix examples:**

- `🤖(claude-opus-4-6|sub)` — Opus on subscription
- `🤖(claude-opus-4-6|api)` — Opus on API key (costs money!)
- `🤖(gpt-4o|api)` — GPT-4o fallback
- `🤖(llama3.2:1b|api)` — Local Ollama model

This lets you immediately identify:

1. Which model answered (was it a fallback?)
2. Whether you're burning subscription or API credits

## Self-Chat History Fix

**Problem:** Baileys doesn't emit `messages.upsert` events for messages you send from your phone to your own self-chat. They never reach the history DB.

**Solution:** The patch adds `insertHistoryMessage()` in the inbound monitor — right where messages are processed after access control. Every message the bot sees gets stored. Duplicates are silently ignored.

**Additionally:** `syncFullHistory: true` triggers full message backfill on reconnect.

## Usage

```
whatsapp_history(action="search", query="meeting tomorrow")
whatsapp_history(action="search", chat="Oscar", limit=20)
whatsapp_history(action="stats")
```

## Administration Tools

### Contact Sync

Extract all contacts from all WhatsApp groups:

```bash
npx tsx ~/.openclaw/workspace/skills/whatsapp-ultimate/scripts/wa-fetch-contacts.ts
```

**Output:** `~/.openclaw/workspace/bank/whatsapp-contacts-full.json`

Contains: all groups with participant counts, all contacts with phone numbers (LID-resolved), group membership per contact, admin status.

### Group Creation

```bash
npx tsx ~/.openclaw/workspace/skills/whatsapp-ultimate/scripts/wa-create-group.ts "Group Name" "+phone1" "+phone2"
```

Phone numbers in E.164 format. Creator auto-added as admin. Returns group JID.

### Key Baileys Methods

| Method                                               | Description                   |
| ---------------------------------------------------- | ----------------------------- |
| `groupFetchAllParticipating()`                       | Get all groups + participants |
| `groupMetadata(jid)`                                 | Get single group details      |
| `groupCreate(name, participants)`                    | Create new group              |
| `groupUpdateSubject(jid, name)`                      | Rename group                  |
| `groupUpdateDescription(jid, desc)`                  | Update group description      |
| `groupParticipantsUpdate(jid, participants, action)` | Add/remove/promote/demote     |

### LID Resolution

WhatsApp uses LIDs (Linked IDs) internally. The contact sync script automatically resolves LIDs to phone numbers using mappings in `~/.openclaw/credentials/whatsapp/default/lid-mapping-*_reverse.json`.

## Changelog

### 3.0.0

- **Merged:** whatsapp-tools into whatsapp-ultimate — contact sync, group creation, and admin operations now included
- **Added:** Proper metadata.openclaw block with required bins, channels, and security notes
- **Added:** Administration Tools section with Baileys API reference and LID resolution docs

### 2.2.0

- **Added:** Model + auth mode prefix in every message (`{model}`, `{authMode}` template vars)
- **Added:** Install script for model prefix patch
- **Added:** Full template variable documentation

### 2.1.0

- **Fixed:** Self-chat inbound messages now captured in history DB
- **Added:** Install script for history capture patch
- **Added:** `syncFullHistory` config for full backfill

### 2.0.3

- Initial ClawHub release with security gating and bot prefix
