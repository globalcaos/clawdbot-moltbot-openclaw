---
name: chatgpt-exporter-ultimate
version: 2.0.0
description: "Export ALL your ChatGPT conversations instantly — including conversations inside Projects/folders! No 24-hour wait, no browser extensions. Works via OpenClaw browser relay OR standalone bookmarklet. Full message history with timestamps, roles, metadata, and code blocks preserved. Migrate to OpenClaw with your complete conversation history."
homepage: https://github.com/globalcaos/clawdbot-moltbot-openclaw
repository: https://github.com/globalcaos/clawdbot-moltbot-openclaw
---

# ChatGPT Exporter ULTIMATE

> 🔗 **Part of the OpenClaw Ecosystem** — This skill is part of a larger AI agent revamp project.
> Full project: https://github.com/openclaw/openclaw

Export all ChatGPT conversations in seconds — no waiting for OpenAI's 24-hour export email.

## Usage

```
Export my ChatGPT conversations
```

## Requirements

1. User must attach their Chrome ChatGPT tab via browser relay
2. User must be logged into ChatGPT

## How It Works

1. **Attach browser** - User clicks OpenClaw toolbar icon on chatgpt.com tab
2. **Inject script** - Agent injects background export script
3. **List conversations** - Script fetches all conversations from the main listing API
4. **Discover Project conversations** - Script searches with broad terms to find conversations hidden inside ChatGPT Projects/folders (these are invisible to the main listing endpoint)
5. **Fetch all** - Script fetches full content for every conversation found
6. **Download** - JSON file auto-downloads to user's Downloads folder

### Why Search-Based Discovery?

ChatGPT's `/backend-api/conversations` endpoint only returns conversations that are NOT inside Projects. Conversations created within Projects (e.g., "Feina", "Receptes") are invisible to this endpoint. The `/backend-api/conversations/search` endpoint searches across ALL conversations including those in Projects, so we use broad search terms to discover them.

## Technical Details

### Authentication

ChatGPT's internal API requires a Bearer token from `/api/auth/session`:

```javascript
const session = await fetch("/api/auth/session", { credentials: "include" });
const { accessToken } = await session.json();
```

### API Endpoints

| Endpoint                                        | Purpose               |
| ----------------------------------------------- | --------------------- |
| `/api/auth/session`                             | Get access token      |
| `/backend-api/conversations?offset=N&limit=100` | List conversations    |
| `/backend-api/conversation/{id}`                | Get full conversation |

### Export Script

The agent injects a self-running script that:

1. Fetches the access token
2. Paginates through all conversations (100 per page)
3. Fetches each conversation's full content
4. Extracts messages from the mapping tree
5. Creates JSON blob and triggers download

### Progress Tracking

```javascript
// Check progress in console — the script logs each conversation as it's fetched
// Phase 1: listing (fast), Phase 2: search discovery (~30s), Phase 3: fetching (100ms/conv)
```

## Output Format

```json
{
  "exported": "2026-02-15T16:30:00.000Z",
  "exporter_version": "2.0",
  "total": 264,
  "listed": 189,
  "from_projects": 75,
  "successful": 264,
  "errors": 0,
  "conversations": [
    {
      "id": "abc123",
      "title": "Conversation Title",
      "created": "2025-09-19T12:34:00.901734Z",
      "updated": "2025-09-22T15:12:11.617018Z",
      "gizmo_id": "g-p-690b268fc9f8819191a7742fce2700fb",
      "messages": [
        { "role": "user", "text": "...", "time": 1770273234 },
        { "role": "assistant", "text": "...", "time": 1770273240 }
      ]
    }
  ]
}
```

## Rate Limits

- 100ms delay between conversation fetches and search queries
- Phase 1 (listing): ~2 seconds
- Phase 2 (search discovery): ~30 seconds (searches ~50 terms)
- Phase 3 (fetching): ~100ms per conversation
- Total for ~250 conversations: ~3-4 minutes

## Troubleshooting

| Issue           | Solution                                   |
| --------------- | ------------------------------------------ |
| No tab attached | Click OpenClaw toolbar icon on ChatGPT tab |
| 401 error       | Log into ChatGPT and re-attach tab         |
| Export stuck    | Check browser console for errors           |
| No download     | Check Downloads folder / browser settings  |

## Files

- `scripts/bookmarklet.js` - Standalone console script (paste in DevTools)
- `scripts/export.sh` - CLI export with token argument

## Comparison to Extensions

| Feature      | This Skill              | ChatGPT Exporter Extension |
| ------------ | ----------------------- | -------------------------- |
| Installation | None                    | Chrome Web Store           |
| Automation   | Full (agent-controlled) | Manual (user clicks)       |
| Format       | JSON                    | JSON, MD, HTML, PNG        |
| Batch export | ✅ Auto                 | ✅ "Select All"            |
| Progress     | Agent monitors          | UI progress bar            |

**When to use this skill:** Automated exports, programmatic access, agent workflows
**When to use extension:** Manual exports, multiple formats, visual UI
