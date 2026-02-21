---
name: outlook-hack
version: 2.6.0
description: "Your agent reads Outlook email all day. Drafts replies for you. Won't send a single one. Not even if you ask nicely."
metadata:
  {
    "openclaw":
      {
        "emoji": "📧",
        "os": ["linux", "darwin"],
        "requires": { "capabilities": ["browser"] },
        "notes":
          {
            "security": "This skill captures Outlook Web session tokens via browser tab sharing to make direct REST calls to Microsoft's internal APIs. No API keys or admin approval needed. SENDING IS CODE-DISABLED: the skill physically cannot send, reply, or forward emails. It reads, searches, and creates drafts only. Drafts land in the user's Drafts folder for manual review and sending. No credentials are stored beyond the session token lifetime (8-24 hours).",
          },
      },
  }
---

# Outlook Hack

**Your AI agent won't email the CEO at 3am.**

Not because there's a setting. Not because there's a policy. Because the code physically cannot send emails. We removed that capability the way you'd remove a chainsaw from a toddler — completely and without negotiation.

**What it does:** reads, searches, and drafts replies. The drafts land in your Drafts folder. You review. You hit send. The AI never does.

**What it won't do:**

- Won't beg IT for API access
- Won't need admin to enable IMAP
- Won't die after 20 minutes like a browser extension with commitment issues
- Won't send, forward, or reply on your behalf — ever
- Won't make you explain to compliance why an AI is loose in your inbox

**How it works:** Open Outlook Web once. OpenClaw grabs the auth tokens from your existing browser session. Done. One handshake in the morning, reads all day. No IT ticket. No extensions to babysit. No OAuth dance with Azure AD.

Every token refresh, every session recovery, every edge case where Microsoft decides to rotate cookies at 2pm on a Tuesday — handled. Because we're that kind of obsessive.

**The punchline:** Your security team's biggest fear is "what if it sends something?" This skill can't. The send function doesn't exist. It writes drafts — you pull the trigger. Sleep well.

## Capabilities

- 📧 Read and search emails across all folders
- 📅 Access calendar events
- 👥 Browse contacts
- ✏️ Create email drafts (lands in Drafts folder — never sends)

## How It Works (Technical)

1. Share your Outlook Web tab with OpenClaw via the Browser Relay
2. The skill captures your authenticated session tokens
3. From that point, it makes direct REST calls to Microsoft's internal Outlook APIs
4. Works autonomously until the session naturally expires (typically 8-24 hours)
5. Next day: share the tab again. One handshake. That's it.

The skill is NOT scraping the page. It speaks Outlook's own internal API language, authenticated through your existing browser session.

## The Full Stack

Pair with [**whatsapp-ultimate**](https://clawhub.com/globalcaos/whatsapp-ultimate) for messaging and [**jarvis-voice**](https://clawhub.com/globalcaos/jarvis-voice) for voice. Part of a 13-skill cognitive architecture.

👉 **[Clone it. Fork it. Break it. Make it yours.](https://github.com/globalcaos/clawdbot-moltbot-openclaw)**
