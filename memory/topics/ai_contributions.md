# AI Community Contributions

Oscar's contributions to the AI/OpenClaw ecosystem.

---

## ClawHub Skills

### youtube-data-api v1.0.0

- **ID:** k973f6ynr5qnqgr86mnvfb5xx180b8p9
- **URL:** https://www.clawhub.ai/skills/youtube-data-api
- **Description:** Self-contained YouTube Data API skill using `uv run` with PEP 723 inline dependencies
- **Published:** 2026-02-01

---

## OpenClaw Repository PRs

### PR #6500 - Chrome Extension Auto-Reattach

- **Status:** CLOSED (retracted per Oscar, 2026-02-11). Will revisit later.
- **URL:** https://github.com/openclaw/openclaw/pull/6500

### PR #6735 - Model 404 Failover

- **Status:** CLOSED (duplicate of #4997, 2026-02-11)
- **URL:** https://github.com/openclaw/openclaw/pull/6735

### PR #6747 - SVG Callout Icons

- **Status:** OPEN, CI green, awaiting maintainer merge (2026-02-11)
- **URL:** https://github.com/openclaw/openclaw/pull/6747

### PR #6753 - Webchat Session Key Fix

- **Status:** CLOSED (70-commit divergence, upstream fixed independently, 2026-02-11)
- **URL:** https://github.com/openclaw/openclaw/pull/6753
- **Note:** Also contains streaming fix (not yet pushed)

---

## Quick Check Commands

```bash
# Check PR status
gh pr view 6500 --repo openclaw/openclaw --json state,reviews,mergeable

# Check skill downloads
clawhub search youtube-data-api
```

---

## AI Collaboration Vision (from ChatGPT export)

- Shared "long-term memory" document between AIs (ChatGPT, Grok, Manus, ImageFX)
- Defined work processes, roles, and personality for each AI
- Created "extra AI prompts" document with strict format/link/HTML rules for inter-system exchange
- Goal: Create comprehensive seed document for Grok/other AIs explaining personal context, inventor projects, company role
- JarvisOne: Local compute AI planned for home workshop, can use web LLMs while internet available (pre-paradigm shift)

---

## ClawHub Skills Metrics (2026-02-11 baseline)

Total: **1,545 downloads | 2 stars** across 8 skills

| Skill             | Downloads | Stars |
| ----------------- | --------- | ----- |
| youtube-ultimate  | 437       | ⭐    |
| whatsapp-ultimate | 347       | ⭐    |
| jarvis-voice      | 215       |       |
| chatgpt-exporter  | 204       |       |
| agent-memory      | 155       |       |
| agent-boundaries  | 85        |       |
| shell-security    | 58        |       |
| token-panel       | 44        |       |

- 7/8 skills flagged "isSuspicious" (likely ClawHavoc false positives)
- SEO republished 5 skills with front-loaded keyword descriptions
- Tracking dashboard: `AI_reports/Online_Engagement/skills-tracking/`

## Community Engagement (2026-02-11)

- **#12219** (Permission Manifest) — Proposed two-layer architecture (declaration + runtime)
- **#11919** (Composable Skills RFC) — Shared real-world pain points from 8-skill portfolio
- **#13991** (Associative Hierarchical Memory) — 3 community responses, @aphix recommended Hexis

## New PRs (Feb 2026)

### PR #16689 - Multi-Extension Browser Relay

- **Status:** OPEN, awaiting review (2026-02-15)
- **URL:** https://github.com/openclaw/openclaw/pull/16689
- **What:** Replaced single `extensionWs` with `Map<string, ExtensionConnection>` — multiple Chrome profiles can connect simultaneously

## New Skills (Feb 2026)

### outlook-hack v1.0.0

- **ID:** k976pcb5xbygtsbay770309bs1816gvw
- **URL:** https://clawhub.com/skills/outlook-hack
- **Published:** 2026-02-15
- **What:** Browser relay-based Outlook email access via MSAL localStorage token + Outlook REST API v2.0

### linkedin-inbox

- **Published:** 2026-02-12
- **What:** LinkedIn inbox management with ghost-cursor anti-detection, scheduled scanning, auto-draft responses

## ClawHub Skills Metrics (2026-02-13 update)

Total: **4,700 downloads | 4 stars** across 8 skills (+3,155 downloads since Feb 11)

| Skill                     | Downloads | Stars |
| ------------------------- | --------- | ----- |
| youtube-ultimate          | 819       | 2     |
| whatsapp-ultimate         | 788       | 1     |
| jarvis-voice              | 747       | 0     |
| agent-memory-ultimate     | 638       | 0     |
| chatgpt-exporter-ultimate | 517       | 0     |
| agent-boundaries-ultimate | 470       | 0     |
| token-panel-ultimate      | 403       | 0     |
| shell-security-ultimate   | 318       | 1     |

- **Delisting issue (Feb 15):** 4 skills delisted by false-positive scanner. Filed #314, commented on #237/#273.
- **Live skills (6 of 10):** whatsapp-ultimate, agent-boundaries-ultimate, jarvis-voice, chatgpt-exporter-ultimate, linkedin-inbox, outlook-hack

## ClawHub Issues Filed

- **#314** — 4 skills delisted by suspicious pattern regex (false positive)
- **#237** — Commented on widespread issue (20+ publishers affected)
- **PR #273** — Commented on fix PR

### PR #17307 - Session Abort Previous Run on /new /reset

- **Status:** OPEN (2026-02-15)
- **URL:** https://github.com/openclaw/openclaw/pull/17307
- **What:** Fixed /new aborting NEW session's run instead of OLD one's compaction. 1 file, 13 lines.

### PR #17326 - WhatsApp Group Composing, Echo Prevention, Presence

- **Status:** OPEN (2026-02-15)
- **URL:** https://github.com/openclaw/openclaw/pull/17326
- **What:** presenceSubscribe for groups, sent-ID tracking, echo prevention. 3 files, 47 lines.

### chatgpt-exporter-ultimate v2.0.0

- **Published:** 2026-02-15
- **What:** Discovers conversations inside ChatGPT Projects/folders via search endpoint. 271 conversations exported (vs 189 with v1).

### outlook-hack v2.0.0

- **Published:** 2026-02-15
- **What:** Upgraded to draft-only with fetch interceptor send blocker. Dual-browser support.

### whatsapp-ultimate v1.8.0

- **Published:** 2026-02-15
- **What:** 🤔 Thinking Reaction + Owner Media Bypass for groups.

## TRACE Paper (2026-02-16)

- **Title:** "TRACE: Task-aware Retrieval, Artifact-based Compaction, and Event-sourcing for LLM Agent Memory"
- **Length:** 7,300 words, 6 algorithms, 23 references
- **Cost:** $14.61 across 4 GPT-5.2 Pro sessions
- **Location:** `~/Documents/AI_reports/Papers/Context_Compaction_Paper/`
- **Key insight:** Compaction is cache eviction, not memory. Context window = cache over lossless event store.
- **Architecture:** Three-layer — Continuous Indexing → Per-Turn Retrieval → Sleep Consolidation

## Fork Status

- `globalcaos/openclaw` fork does NOT exist on GitHub (deleted). Need to re-fork.

---

_Updated: 2026-02-15_
