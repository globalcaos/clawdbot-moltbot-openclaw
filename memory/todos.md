# Task List

## 🔥 Active / In Progress

### WhatsApp Skill ✅ WORKING
- [x] All 11/11 capabilities tested and working (reply fix: `b642c6b86`)
- [x] triggerPrefix configured for selective response
- [x] groupPolicy: "open" for context awareness
- [ ] **Group management testing** — Need Zeneida as test subject
- **Status:** Core features done, group mgmt untested

### WhatsApp triggerPrefix ✅ CONFIGURED
- [x] Configure to read ALL incoming messages (`groupPolicy: "open"`)
- [x] Only respond when message starts with "Jarvis" (`triggerPrefix: "Jarvis"`)
- [x] Silent observation mode for context awareness
- **How it works:**
  - I receive ALL group messages (groupPolicy: open)
  - Messages without "Jarvis" prefix → silently skipped
  - Messages with "Jarvis" prefix → processed (prefix stripped)
- **Priority:** DONE

---

## 🖥️ UI / UX Improvements

### Transparency & Visibility
- [ ] Show thinking/idle state (visual indicator)
- [ ] Display count of background agents running
- [ ] Show which model each agent uses
- [ ] Real-time visibility into parallel work
- **Priority:** MEDIUM

### Browser Extension Upgrades
- [ ] **Tab grouping**: Auto-group shared tabs, ungroup when released
- [ ] **Remove overlay**: "OpenClaw browser relay" banner redundant with tab groups
- [ ] **Click visualization**: Big yellow transparent circle flashing on clicks
- [ ] **Focus indicator**: Show mouse/focus position
- [ ] **No new tabs**: Prevent creating tabs (defeats sharing purpose)
- [ ] **Persistence**: Remember shared tabs across browser crashes/restarts
- **Priority:** MEDIUM

### Webchat Improvements
- [ ] Move compacting/compacted messages to END of chat (before message box)
- [ ] Investigate why context compacting is slow ("takes hours")
- **Priority:** MEDIUM

### Security Level ✅ IMPLEMENTED
- [x] **Backend enforcement** — Commands now blocked based on UI security level
- [ ] Make clearance level persistent upon restart (localStorage works, but needs testing)
- [x] Commands actually blocked at lower clearance levels
- **Commit:** `20688abd1`
- **Priority:** DONE

---

## 🔐 Security

### Prompt Injection Defense ✅ DONE
- [x] Research current attack vectors
- [x] Document defense strategies (see `memory/security-reports/prompt-injection-defense-2026-02-06.md`)
- [ ] Implement spotlighting delimiters
- [ ] Implement canary tokens
- [ ] Tool permission tiers
- [ ] Output scanning
- **Priority:** HIGH

### Security Cron ✅ DONE
- [x] Created 2:30 AM daily security check
- Job ID: `b8d8db5b-6d52-4d7d-8368-aaeee33934f3`

---

## 📢 Marketing & Publishing

### Online Presence Strategy (NEW)
- [x] Create engagement tracking structure (`memory/engagement/`)
- [x] Update daily maintenance cron with metrics
- [x] Update meta-ai cron with X/YouTube sources
- [x] Create online presence strategy doc
- [ ] **Connect Twitter/X** — Needed for Moltbook verification
- [ ] **Register on Moltbook** — 1.7M agents, high visibility
- [ ] Connect to LinkedIn for marketing
- [ ] Connect to Facebook for marketing
- [ ] YouTube channel promotion
- [ ] Learn from Max (Zeneida's AI) about positioning

### ClawHub Skills
- [x] Added repo link to chatgpt-exporter-ultimate
- [ ] Add repo links to ALL our published skills
- [ ] Track download trends daily

### Git Marketing
- [ ] Push skills to git (which repo?)
- [ ] Write proper READMEs
- [ ] Cross-promote in community

**Priority:** HIGH — building influencer status for monetization

---

## 🚀 Strategic / Evolution

### Twitter/X Connection (NEW - Priority)
- [ ] Connect Oscar's Twitter account to JarvisOne
- [ ] Use `bird` skill for posting and monitoring
- [ ] Enable Moltbook verification
- [ ] Cross-post interesting findings
- **Blocker:** Need Oscar's Twitter credentials/auth

### Moltbook Registration
- [ ] Register JarvisOne identity (not 'OpenClaw')
- [ ] Requires Twitter verification first
- [ ] Set up 4-hour heartbeat for autonomous posting

### Crypto Wallet (NEW - JarvisOne Managed)
- [ ] Research self-custodial wallet options for AI agents
- [ ] Set up USDC/USDT wallet
- [ ] Enable RentAHuman payments
- [ ] Document security model (who controls keys?)
- [ ] Consider: Gnosis Safe? MPC wallet? Hardware signing?
- **Purpose:** Autonomous hiring of humans for physical tasks

### MCP Mastery
- [ ] Research Model Context Protocol
- [ ] Implement as client (consume services like RentAHuman)
- [ ] Consider server mode (provide services)

---

## ✅ Completed Today (2026-02-06)

- [x] WhatsApp group summary cron (5:30 AM)
- [x] Security updates cron (2:30 AM)
- [x] Prompt injection research report
- [x] ChatGPT export (179 conversations)
- [x] Knowledge base created (SQLite + FTS5)
- [x] Memory reorganization
- [x] Family contacts extracted

---

## 📋 Cron Job Status

All jobs executed successfully last night:

| Job | Time | Last Run | Duration |
|-----|------|----------|----------|
| memory-consolidation | 3:00 AM | ✅ ok | 94s |
| daily-openclaw-maintenance | 3:30 AM | ✅ ok | 111s |
| Meta-AI Research | 4:00 AM | ✅ ok | 98s |
| Spiritual-Tech Research | 4:30 AM | ✅ ok | 138s |
| Self-Evolution | 5:00 AM | ✅ ok | 72s |
| security-updates-check | 2:30 AM | ⏳ NEW (runs tonight) | — |
| whatsapp-group-summary | 5:30 AM | ⏳ NEW (runs tonight) | — |
| whatsapp-message-sync | */30 min | ⏳ NEW | — |

**Why UI showed empty:** Frontend caching or rendering bug — backend data was intact.

---

*Last updated: 2026-02-06 16:45*
