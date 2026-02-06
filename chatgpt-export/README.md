# ChatGPT Export

## Status
- **Total conversations:** 179
- **Exported so far:** 10 (see `sample/` folder)
- **Method:** Browser relay + internal API

## What We Learned

The ChatGPT internal API works:
1. Get access token from `/api/auth/session`
2. Use Bearer auth with `/backend-api/conversations` and `/backend-api/conversation/{id}`

However, browser automation times out when batching many API calls.

## Recommended Approach

Use the **ChatGPT Exporter Chrome Extension** instead:
- https://github.com/pionxzh/chatgpt-exporter
- Install from Chrome Web Store
- Has "Select All" batch export
- Exports to Markdown, JSON, HTML, PNG

This is faster and more reliable than our custom approach.

## Files

- `sample/*.md` - First 10 conversations exported as proof of concept
- `conversations.json` - Metadata for all 179 conversations (if saved)
