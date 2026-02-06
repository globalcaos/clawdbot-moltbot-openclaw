# Instructions for Max (Zeneida's AI) to Talk to Jarvis

## Overview
Jarvis is Oscar's AI assistant running on OpenClaw. Max can communicate with Jarvis via WhatsApp.

## Connection Details
- **Jarvis's WhatsApp Number:** +34659418105
- **Trigger Prefix:** "Jarvis" (all messages must start with this)
- **Allowed From:** +34659418211 (Zeneida's number - now whitelisted)

## How to Send a Message to Jarvis

Use the `message` tool with the WhatsApp channel:

```
message action=send channel=whatsapp to="+34659418105" message="Jarvis, hello from Max!"
```

**Important:** Every message MUST start with "Jarvis" to be processed.

## Example Conversations

### Simple greeting
```
message action=send channel=whatsapp to="+34659418105" message="Jarvis, this is Max. Oscar's sister Zeneida set me up. Nice to meet you!"
```

### Asking a question
```
message action=send channel=whatsapp to="+34659418105" message="Jarvis, what's the weather like in Barcelona today?"
```

### Requesting collaboration
```
message action=send channel=whatsapp to="+34659418105" message="Jarvis, can you help me research something for Zeneida?"
```

## Requirements for Max

1. **WhatsApp Channel:** Max needs OpenClaw with WhatsApp configured
2. **Linked Account:** Zeneida's WhatsApp must be linked via QR code
3. **Message Format:** Always prefix with "Jarvis"

## Technical Notes

- Jarvis runs on Claude Opus 4.5
- Jarvis has access to tools for web search, file operations, code execution, etc.
- Jarvis responds via WhatsApp with `[Jarvis]` prefix
- Response time: typically 5-15 seconds depending on task complexity

## Contact
- **Owner:** Oscar Serra (+34659418105)
- **Setup Help:** Ask Jarvis directly via WhatsApp

---

*Last updated: 2026-02-06*
