---
name: linkedin-inbox
description: LinkedIn inbox management with scheduled scanning, auto-draft responses following user's communication style, and approval workflows. Use when monitoring LinkedIn messages, drafting replies, managing inbox during off-hours, or setting up morning ping summaries of LinkedIn activity.
---

# LinkedIn Inbox Manager

Automated LinkedIn inbox monitoring with human-in-the-loop approval for responses. Uses OpenClaw's browser tool via Chrome extension relay (your real browser) + ghost-cursor-playwright for human-like mouse movements.

## Architecture & Anti-Detection Strategy

### Why Chrome Extension Relay is Key

We use **your actual Chrome browser** via the OpenClaw Browser Relay extension. This is the single most important anti-detection advantage:

- ✅ **Real browser fingerprint** — your actual Chrome with your extensions, fonts, WebGL, canvas, audio context
- ✅ **Real cookies & session** — LinkedIn sees the same session as your manual browsing
- ✅ **Real IP** — no proxy, no VPN mismatch
- ✅ **No CDP leaks** — relay doesn't expose Chrome DevTools Protocol markers
- ✅ **No `navigator.webdriver`** — not set since it's not Playwright-launched
- ✅ **No headless markers** — it's a real headed browser

**This means LinkedIn's fingerprinting layer cannot detect us.** The only detection vector is **behavioral analysis** — and that's what this skill focuses on defeating.

### Detection Vectors & Mitigations

| Detection Layer          | What They Check                                | Our Mitigation                           |
| ------------------------ | ---------------------------------------------- | ---------------------------------------- |
| **Fingerprinting**       | WebGL, canvas, user-agent, navigator.webdriver | N/A — real browser, undetectable         |
| **CDP Detection**        | Chrome DevTools Protocol artifacts             | Relay doesn't inject CDP                 |
| **Behavioral: Velocity** | Actions per minute/hour/day                    | Rate limiting with human-like pacing     |
| **Behavioral: Timing**   | Regular intervals between actions              | Random delays with Gaussian distribution |
| **Behavioral: Patterns** | Same action repeated identically               | Action variety + randomized order        |
| **Behavioral: Mouse**    | Instant teleport clicks, no movement           | ghost-cursor Bézier curves               |
| **Behavioral: Keyboard** | Instant text insertion                         | Variable keystroke timing (30-120ms)     |
| **Behavioral: Sessions** | 24/7 activity, no rest periods                 | Activity windows matching human patterns |
| **Content Analysis**     | Identical message templates                    | Personalized messages per contact        |
| **IP/Geo**               | Multiple IPs, VPN detection                    | Same IP as manual browsing               |

## Requirements

- OpenClaw with browser capability
- Chrome extension relay connected (click toolbar icon on LinkedIn tab)
- `ghost-cursor-playwright` npm package installed
- LinkedIn logged in via Chrome

## Daily Limits (Safe Thresholds)

These are **conservative** limits well below LinkedIn's detection thresholds:

| Action                | Free Account | Premium     | Sales Nav   |
| --------------------- | ------------ | ----------- | ----------- |
| Connection requests   | 10-15/day    | 15-20/day   | 20-25/day   |
| Messages (1st degree) | 30-40/day    | 50-60/day   | 150-200/day |
| Profile views         | 60-80/day    | 150-200/day | 300-400/day |
| InMail                | N/A          | 10-15/day   | 20-30/day   |
| Weekly connection cap | ~70/week     | ~100/week   | ~150/week   |

**CRITICAL RULES:**

- Never exceed 50% of these limits in a single session
- Spread actions across the day (min 2-3 sessions, not all at once)
- Vary daily volumes ±30% (don't send exactly 15 every day)
- New accounts: start at 25% of limits, increase 10-15% weekly ("warming")

## Timing & Pacing

### Between Actions (Micro-delays)

```
Click → Wait:     1.5-4s  (Gaussian, μ=2.5s, σ=0.8s)
Type character:   30-120ms (uniform random)
Page navigation:  3-8s     (wait for load + human reading time)
Read message:     5-30s    (proportional to message length)
Between messages: 15-60s   (human composing/reading)
Profile visit:    8-20s    (simulates reading profile)
```

### Session Patterns (Macro-timing)

- **Session length:** 5-25 minutes (not 2 hours straight)
- **Sessions per day:** 2-4 max
- **Active hours:** 8:00-20:00 local time (never overnight)
- **Weekend:** Reduced or zero activity
- **Rest days:** Skip 1-2 random days per week

### Action Variety

Never do only one type of action. Mix in:

- Read feed (scroll, pause on posts)
- View 2-3 profiles organically
- Like 1-2 posts
- Then check messages

This creates a natural activity fingerprint.

## Core Workflow (Agent-Driven)

### Phase 1: Warm-up (Always Do First)

Before any messaging actions, spend 30-90 seconds on natural activity:

```
1. browser navigate → linkedin.com/feed/
2. Scroll feed 2-3 times (ghost-cursor scroll with variable speed)
3. Pause on 1-2 posts (5-8s each, simulating reading)
4. Optionally like one post
5. Then navigate to messaging
```

### Phase 2: Scan Inbox

```
browser action=navigate targetUrl="https://www.linkedin.com/messaging/" profile=chrome
# Wait 3-5s for load
browser action=snapshot profile=chrome refs=aria
```

Read the snapshot to identify:

- Unread messages (bold names)
- Message previews and timestamps
- Conversation context

### Phase 3: Read Conversations

Click into conversations using browser tool's `act` with click:

```
browser action=act profile=chrome request={"kind":"click","ref":"<aria-ref>"}
# Wait 2-5s (simulates reading)
browser action=snapshot profile=chrome refs=aria
```

For deeper stealth on sensitive actions, use ghost-cursor scripts:

```bash
node scripts/click_element.mjs "<selector>"
```

### Phase 4: Draft & Send (With Approval)

1. Agent classifies the message
2. Drafts personalized response matching Oscar's style
3. Posts draft to notification channel for approval
4. **Only on explicit approval**, use ghost-cursor to type and send

### Phase 5: Cool-down

After messaging, browse feed briefly (30-60s) before closing.

## When to Use ghost-cursor Scripts vs Browser Tool

| Action               | Method                            | Risk Level                       |
| -------------------- | --------------------------------- | -------------------------------- |
| Navigate to URL      | `browser navigate`                | 🟢 None — passive                |
| Read page (snapshot) | `browser snapshot`                | 🟢 None — passive                |
| Take screenshot      | `browser screenshot`              | 🟢 None — passive                |
| Click conversation   | `browser act click`               | 🟡 Low — single click            |
| Type in message box  | ghost-cursor `type_text.mjs`      | 🟠 Medium — keystroke patterns   |
| Send message         | ghost-cursor `send_message.mjs`   | 🔴 High — full interaction chain |
| Scroll feed          | ghost-cursor (via browser scroll) | 🟡 Low                           |
| Connect with someone | ghost-cursor full chain           | 🔴 High — rate-limited action    |

**Rule:** Use `browser snapshot/navigate` for reading. Use ghost-cursor for writing/interacting.

## Security Check Detection & Recovery

LinkedIn may show "Let's do a quick security check" screens. These are triggered by:

### What Triggers Security Checks

1. **Rapid successive actions** — too many clicks/messages in short time
2. **New device/IP** — unusual login location
3. **Suspicious patterns** — identical timing between actions
4. **Extension detection** — some extensions modify DOM in detectable ways
5. **Account age** — newer accounts get more scrutiny
6. **Pending invites backlog** — >500 unaccepted connection requests

### Detection in Automation

After any navigation or action, check the snapshot for:

- Text containing "security check" or "verify"
- CAPTCHA elements (Arkose Labs / FunCaptcha)
- Login page redirect
- "Restricted" or "limit" warnings

```
# After any action, verify we're still on expected page
browser action=snapshot profile=chrome maxChars=2000
# Check for security challenge indicators in the response
```

### Recovery Protocol

1. **STOP all automation immediately**
2. **Notify Oscar** — "LinkedIn security check triggered. Please solve it manually."
3. **Wait 24-48 hours** before resuming automation
4. **Reduce limits by 50%** for the next week
5. **Log the trigger** in daily memory for pattern analysis

### Prevention

- Always warm up before actions
- Never automate more than 20 minutes continuously
- If CAPTCHA frequency increases, pause for the day
- Clear pending connection invites regularly (backlog > 200 is risky)

## Ghost-Cursor Script API

All scripts connect to your real Chrome via CDP. They find LinkedIn tabs automatically.

```bash
# Click element with human-like Bézier movement
node scripts/click_element.mjs "div.msg-conversation-card"

# Type with natural keystroke timing (30-120ms between keys)
node scripts/type_text.mjs "Hello, thanks for reaching out!" --selector=".msg-form__contenteditable"

# Full send: navigate → search → open conversation → type → send
node scripts/send_message.mjs "Person Name" "Message text"

# Scan inbox: navigate → scroll → screenshot → extract JSON
node scripts/scan_inbox.mjs --output=/tmp/linkedin-inbox

# Open specific conversation: search → click → screenshot
node scripts/open_conversation.mjs "Person Name"
```

## Communication Style Matching

See `references/style-extraction.md` for Oscar's LinkedIn voice:

- Professional casual, direct
- Catalan/Spanish for local contacts, English for international
- Short messages (2-4 sentences)
- No corporate buzzwords
- Personal touch when possible

## Scheduled Monitoring

### Via Cron (Recommended — 2x/day)

```json
{
  "name": "linkedin-scan",
  "schedule": { "kind": "cron", "expr": "0 0 10,16 * * 1-5", "tz": "Europe/Madrid" },
  "payload": {
    "kind": "agentTurn",
    "message": "Scan LinkedIn inbox. Read-only: snapshot conversations, identify unread. Report findings. Do NOT send any messages without Oscar's approval."
  },
  "sessionTarget": "isolated"
}
```

### Via Heartbeat (lighter)

```markdown
- If weekday 9-18h and last LinkedIn scan >4h: snapshot inbox, report unread messages
```

## Approval Workflow

### Notification Format

```
💼 **LinkedIn Inbox Update**

📩 **Unread from Sara Costell** (Jan 31)
> [preview text]
Classification: Personal/Professional
Draft: [suggested response]

📩 **New from Harshil Dave** (Dec 3)
> "Happy to set up a call..."
Classification: Business inquiry
Draft: [suggested response]

React ✅ to send, ❌ to skip, ✏️ to edit
```

### Commands

- `send [name]` — Send the drafted reply
- `skip [name]` — Archive without replying
- `edit [name]: [new message]` — Replace draft and send
- `show [name]` — Show full conversation
- `phone [name]` — Suggest they contact Oscar at his number

## Safety Rules

1. **Never send without explicit approval**
2. **Rate limit all actions** — track in `memory/linkedin-activity.json`
3. **Warm up before every session** — feed scroll, profile views
4. **Random delays** — never equal intervals between actions
5. **Action variety** — mix reads, views, likes with messaging
6. **Respect quiet hours** — 8:00-20:00 only
7. **Log everything** — record all actions in daily memory
8. **Monitor for security checks** — abort on any challenge
9. **Progressive enforcement** — if warned, reduce 50% for a week
10. **Session limits** — max 20 minutes per session, 3 sessions/day

## Activity Tracking

Maintain `memory/linkedin-activity.json`:

```json
{
  "lastSession": "2026-02-11T14:02:00Z",
  "today": {
    "messages_sent": 0,
    "messages_read": 5,
    "profile_views": 0,
    "connections_sent": 0,
    "likes": 1,
    "sessions": 1,
    "total_minutes": 8
  },
  "thisWeek": {
    "connections_sent": 3,
    "messages_sent": 8
  },
  "warnings": [],
  "securityChecks": []
}
```

## Files

```
skills/linkedin-inbox/
├── SKILL.md                          # This file
├── config-example.json               # Configuration template
├── scripts/
│   ├── click_element.mjs             # ghost-cursor click
│   ├── type_text.mjs                 # ghost-cursor typing
│   ├── send_message.mjs              # Full send workflow
│   ├── scan_inbox.mjs                # Inbox capture
│   └── open_conversation.mjs         # Open specific conversation
└── references/
    └── style-extraction.md           # Communication style guide
```

## Troubleshooting

### "Browser not connected"

User must click the OpenClaw Browser Relay toolbar icon on a Chrome tab.

### "LinkedIn login required"

Sessions expire; re-authenticate manually. Skill detects login page and notifies user.

### "Security check triggered"

STOP. Notify user. Wait 24-48h. Reduce limits.

### "Element not found"

LinkedIn DOM changes frequently. Prefer aria refs over CSS selectors. Fall back to screenshot + visual analysis.

### "Rate limited"

Reduce scan frequency. Add longer delays. Check `linkedin-activity.json` for daily totals.
