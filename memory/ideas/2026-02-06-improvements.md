# Improvement Ideas - 2026-02-06

Captured from Oscar's brainstorm session.

## 🔍 Transparency & Visibility

### Agent Status Dashboard
- [ ] Show when thinking vs idle (visual indicator)
- [ ] Display count of background agents running
- [ ] Show which model each agent is using
- [ ] Real-time visibility into parallel work

### Browser Extension Upgrades
- [ ] **Tab grouping**: Auto-group shared tabs, ungroup when released
- [ ] **Remove overlay**: "OpenClaw browser relay" banner is redundant with tab groups
- [ ] **Click visualization**: Big yellow transparent circle flashing on clicks
- [ ] **Focus indicator**: Show where mouse/focus is pointing
- [ ] **No new tabs**: Prevent creating tabs (defeats purpose of sharing specific tabs)
- [ ] **Persistence**: Remember shared tabs across browser crashes/restarts

## 📨 Message Handling

### WhatsApp Prefix Trigger
- [x] Read ALL incoming messages (not just triggered)
- [ ] Only respond when message starts with "Jarvis" (case-insensitive)
- [ ] Silently observe otherwise (for context awareness)
- This is the `triggerPrefix` feature we started implementing

### Group Chat Summaries
- [ ] Cron at **5:30 AM**: Summarize group chats with 50+ unread messages
- [ ] Deliver summary to Oscar's main session or DM

## 🔐 Security

### Automated Security Updates
- [ ] Cron at **2:30 AM**: Check for security updates
- [ ] Use healthcheck skill for audit

### Prompt Injection Protection
- [ ] Research current attack vectors
- [ ] Document defense strategies
- [ ] Implement protective measures
- [ ] This is an "arms race" - stay ahead

## 📦 Publishing

### ClawHub Marketing
- [ ] Push skill to git
- [ ] Proper marketing/documentation
- [ ] (Need clarification on which skill)

## 🛠️ Infrastructure

### Cron Job Reliability
- [ ] Investigate why cron tab appeared empty
- [ ] Determine if jobs executed last night
- [ ] Add persistence/recovery mechanism
- [ ] Prevent future disappearance

---

*Source: Oscar brainstorm 2026-02-06 15:35*
