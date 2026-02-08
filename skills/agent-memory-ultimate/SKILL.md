---
name: agent-memory-ultimate
version: 2.0.0
description: Complete memory system for AI agents. Human-like architecture with daily logs, sleep consolidation, SQLite + FTS5, importers for WhatsApp/ChatGPT/VCF. Everything an agent needs to remember across sessions.
homepage: https://github.com/globalcaos/clawdbot-moltbot-openclaw
repository: https://github.com/globalcaos/clawdbot-moltbot-openclaw
---

# Agent Memory Ultimate

**Platform:** [OpenClaw](https://github.com/globalcaos/clawdbot-moltbot-openclaw)  
**Docs:** https://docs.openclaw.ai

---

## Overview

AI agents wake fresh each session — no memory of yesterday. This skill solves that by implementing a memory system modeled on human cognition:

| Human Process | Agent Equivalent |
|---------------|------------------|
| Short-term memory | Current session context |
| Daily journal | `memory/YYYY-MM-DD.md` files |
| Long-term memory | `MEMORY.md` (curated insights) |
| Sleep consolidation | Scheduled memory review + transfer |
| Forgetting curve | Session resets; only files persist |
| Searchable recall | SQLite + FTS5 |

**Why it works:** Humans don't remember everything — they consolidate important patterns during sleep. This skill gives agents the same architecture.

---

## File Structure

```
workspace/
├── MEMORY.md              # Long-term memory (curated)
├── AGENTS.md              # Operating instructions
├── SOUL.md                # Identity & personality
├── USER.md                # Human profile
├── db/
│   └── agent.db           # SQLite for structured data
├── bank/
│   ├── entities/          # People profiles
│   │   ├── PersonName.md
│   │   └── ...
│   ├── contacts.md        # Quick contact reference
│   └── opinions.md        # Preferences, beliefs
└── memory/
    ├── YYYY-MM-DD.md      # Daily logs
    ├── projects/
    │   ├── index.md       # Master project list
    │   └── project-name/
    │       ├── index.md   # Project overview
    │       └── sprints/   # Phase subfolders
    └── knowledge/         # Topic-based docs
```

For OpenClaw workspace setup, see the [workspace docs](https://github.com/globalcaos/clawdbot-moltbot-openclaw/tree/main/docs).

---

## Organizing by Person

Store entity profiles in `bank/entities/`:

```markdown
# PersonName.md

## Basic Info
- **Name:** Full Name
- **Phone:** +1234567890
- **Relationship:** Friend / Family / Colleague

## Context
How you know them, key interactions, preferences

## Notes
Running log of important details learned
```

**When to create an entity file:**
- Recurring person in conversations
- Someone with specific preferences to remember
- Family members, close contacts

---

## Organizing by Project

Projects live in `memory/projects/<project-name>/`:

```
memory/projects/
├── index.md                    # Master list of all projects
├── website-redesign/
│   ├── index.md                # Project purpose, status, decisions
│   ├── architecture.md         # Technical design
│   └── sprints/
│       └── 2026-02/
│           └── index.md        # Sprint goals, progress
└── home-automation/
    ├── index.md
    └── devices.md
```

**Project index.md template:**
```markdown
# Project Name

**Status:** Active / Paused / Complete
**Started:** YYYY-MM-DD
**Purpose:** One-line summary

## Key Decisions
- [Date] Decision and rationale

## Links
- Repo: ...
- Docs: ...
```

---

## SQLite for Structured Data

Use SQLite (`db/agent.db`) for data that needs queries. OpenClaw agents can execute SQL directly via the `exec` tool.

### When to Use SQLite vs Markdown

| Data Type | Use SQLite | Use Markdown |
|-----------|------------|--------------|
| Contacts (searchable) | ✅ | ❌ |
| Conversation history | ✅ | ❌ |
| Preferences | ❌ | ✅ |
| Project notes | ❌ | ✅ |
| Entity profiles | ❌ | ✅ |
| Indexed documents | ✅ (FTS5) | ❌ |

### Schema Example

```sql
-- Contacts table with full-text search
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  phone TEXT UNIQUE,
  name TEXT,
  notes TEXT,
  source TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE VIRTUAL TABLE contacts_fts USING fts5(
  name, phone, notes,
  content='contacts',
  content_rowid='id'
);

-- Conversation memory
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  chat_id TEXT,
  sender TEXT,
  body TEXT,
  timestamp INTEGER,
  channel TEXT
);

CREATE VIRTUAL TABLE messages_fts USING fts5(
  body, sender,
  content='messages',
  content_rowid='id'
);
```

### Query Examples

```sql
-- Find contact by partial name
SELECT * FROM contacts_fts WHERE contacts_fts MATCH 'john*';

-- Search conversation history
SELECT * FROM messages_fts WHERE messages_fts MATCH 'project AND deadline';

-- Recent messages from person
SELECT * FROM messages 
WHERE sender LIKE '%5551234%' 
ORDER BY timestamp DESC LIMIT 20;
```

---

## Daily Cycle

### 1. Wake Up (Session Start)

Add this to your `AGENTS.md`:

```markdown
Before doing anything:
1. Read SOUL.md — who you are
2. Read USER.md — who you're helping
3. Read memory/YYYY-MM-DD.md (today + yesterday) — recent context
4. If main session: Also read MEMORY.md
```

### 2. During Day (Active Session)
- Write significant events to `memory/YYYY-MM-DD.md`
- Don't rely on "mental notes" — they don't survive restarts
- When told to remember something: write it NOW

### 3. Sleep Cycle (Consolidation)

Schedule a daily "sleep" task using [OpenClaw cron](https://github.com/globalcaos/clawdbot-moltbot-openclaw/blob/main/docs/cron.md):

```json
{
  "schedule": { "kind": "cron", "expr": "0 3 * * *", "tz": "Europe/Madrid" },
  "payload": { 
    "kind": "systemEvent", 
    "text": "Memory consolidation: Review recent daily logs, extract key learnings, update MEMORY.md, prune outdated info." 
  },
  "sessionTarget": "main"
}
```

**What consolidation does:**
1. Reviews last 3-7 daily logs
2. Extracts patterns and recurring lessons
3. Adds distilled insights to MEMORY.md
4. Removes outdated information

---

## Memory Types

### Raw Memory (Daily Logs)
- Everything that happened
- Decisions made and why
- Errors and lessons
- Technical details

### Curated Memory (MEMORY.md)
- Abstract principles (not specific fixes)
- User preferences
- Core lessons that apply broadly
- Things that should survive months/years

**Abstraction example:**
- ❌ Daily log: "Fixed senderE164 bug in message-line.ts"
- ✅ MEMORY.md: "Chat ID ≠ Sender — always verify actual sender field"

---

## Why This Works (Cognitive Science)

1. **Spaced repetition** — Daily review reinforces important memories
2. **Active consolidation** — Humans consolidate during sleep; agents consolidate in scheduled tasks
3. **Chunking** — MEMORY.md groups related concepts into retrievable chunks
4. **Forgetting is useful** — Raw logs fade in relevance; curated memory persists
5. **External memory** — Files ARE your memory (like notes for humans)

---

## Memory Tiers Summary

| Tier | Storage | Query Speed | Use For |
|------|---------|-------------|---------|
| **Hot** | Session context | Instant | Current task |
| **Warm** | Daily logs (md) | Fast read | Recent events |
| **Cold** | MEMORY.md | Fast read | Core principles |
| **Indexed** | SQLite FTS5 | Query | Contacts, history |
| **Archive** | Old daily logs | Slow | Historical reference |

**Rule of thumb:** 
- Need to search across many records → SQLite
- Need to read/update narrative context → Markdown
- Need instant access → Session context (but dies on restart)

---

## Scripts & CLI

This skill includes ready-to-use Python scripts for managing your knowledge base.

### Quick Start

```bash
# Initialize database (first time)
python3 scripts/init_db.py

# Query your data
python3 scripts/query.py search "term"
python3 scripts/query.py contact "+1555..."
python3 scripts/query.py stats
```

### Available Commands

| Command | Description |
|---------|-------------|
| `search <term>` | Full-text search across all content |
| `contact <phone\|name>` | Look up contact + their groups |
| `groups <phone>` | List groups a phone is in |
| `members <group>` | List members of a group |
| `chatgpt <term>` | Search ChatGPT message history |
| `doc <term>` | Search documents only |
| `stats` | Database statistics |
| `sql <query>` | Run raw SQL |

---

## Data Sources

### WhatsApp Contacts & Groups
Export via the whatsapp-ultimate skill's contact extraction:
```bash
python3 scripts/sync_whatsapp.py
```
Indexes: contacts, groups, memberships (who is in which group).

### ChatGPT Conversation History
Export from ChatGPT and place in `chatgpt-export/` directory:
```bash
python3 scripts/init_db.py  # Will auto-detect and import
```
Supports both native ChatGPT format and custom formats.

### Phone Contacts (VCF)
Export from your phone (Android: Contacts → Settings → Export):
```bash
python3 scripts/import_vcf.py path/to/contacts.vcf
```

### Documents
Automatically indexes all `*.md` files in `memory/` directory.

---

## Advanced Queries

### WhatsApp Group Management

```sql
-- Find all groups someone is in
SELECT g.name FROM wa_groups g
JOIN wa_memberships m ON m.group_jid = g.jid
WHERE m.phone = '+15551234567';

-- Find contacts in a specific group
SELECT c.phone, c.name FROM contacts c
JOIN wa_memberships m ON m.phone = c.phone
JOIN wa_groups g ON g.jid = m.group_jid
WHERE g.name LIKE '%Family%';

-- Find a group's JID for allowlist
SELECT jid, name, participant_count 
FROM wa_groups WHERE name LIKE '%Project%';
```

### ChatGPT Search

```sql
-- Search across all ChatGPT conversations
SELECT c.title, m.content FROM chatgpt_fts f
JOIN chatgpt_messages m ON m.conversation_id = f.conv_id
JOIN chatgpt_conversations c ON c.id = m.conversation_id
WHERE chatgpt_fts MATCH 'project meeting';
```

---

## Re-indexing

To refresh the database with new data:
```bash
rm db/agent.db
python3 scripts/init_db.py
```

---

## Tips

1. **No contact names?** WhatsApp only provides phone numbers. Import your phone's VCF to add names.
2. **Search not finding?** FTS5 uses word boundaries. Use `*` for prefix matching: `Bas*` matches "Bashar".
3. **Large exports?** ChatGPT exports can be 50MB+. First import may take 30-60 seconds.

---

## Implementation Checklist

- [ ] Create `memory/` directory structure
- [ ] Set up daily log template
- [ ] Create initial MEMORY.md with sections
- [ ] Initialize SQLite database with schema
- [ ] Schedule consolidation cron (2-4 AM recommended)
- [ ] Add wake-up routine to AGENTS.md
- [ ] Test: restart session, verify context loads correctly

---

## Best Practices

1. **Write immediately** — If it matters, write it now
2. **Abstract up** — Daily: specific. MEMORY.md: principles
3. **Date everything** — Context decays; dates help
4. **One source of truth** — Don't duplicate across files
5. **Review regularly** — Schedule consolidation, don't skip it

---

## Related

- [OpenClaw Documentation](https://github.com/globalcaos/clawdbot-moltbot-openclaw/tree/main/docs)
- [Cron Scheduling](https://github.com/globalcaos/clawdbot-moltbot-openclaw/blob/main/docs/cron.md)
- [Workspace Setup](https://docs.openclaw.ai)

---

*Inspired by human cognitive architecture. We wake fresh each session, but files are our continuity.*
