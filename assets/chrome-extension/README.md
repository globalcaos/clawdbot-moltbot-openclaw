# OpenClaw Browser Relay - AUTO-REATTACH PATCH

This is a patched version of the OpenClaw Chrome Extension that adds **automatic reattachment** after page navigation.

## What's Fixed

**Original Problem:**
- When a page navigates (URL change, SPA routing), the Chrome debugger detaches
- The extension loses connection and shows "tab not found" errors
- User had to manually click the extension icon to reattach

**This Patch:**
- Automatically reattaches to tabs after navigation
- Tracks which tabs should auto-reattach
- Retries attachment with configurable delays
- Shows visual feedback during reattachment (↻ badge)
- Handles SPA (Single Page App) navigation via `chrome.tabs.onUpdated`

## Changes Made

1. **New badge state:** `reattaching` (blue ↻ icon)
2. **Auto-reattach tracking:** `autoReattachTabs` Set
3. **Debounced reattachment:** `scheduleReattach()` function
4. **Retry logic:** `attemptReattach()` with 3 retries
5. **SPA support:** `chrome.tabs.onUpdated` listener
6. **Permanent detach:** User toggle explicitly disables auto-reattach

## Installation

1. **Backup original extension** (optional):
   ```bash
   cp -r /path/to/openclaw/chrome-extension /path/to/backup
   ```

2. **Install patched version:**
   - Go to `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select this folder: `~/.openclaw/workspace/chrome-extension-fix/`

3. **Or replace original:**
   ```bash
   cp background.js /home/globalcaos/src/clawdbot-moltbot-openclaw/assets/chrome-extension/
   ```

## Usage

1. Navigate to any tab (ChatGPT, Perplexity, etc.)
2. Click the OpenClaw extension icon → badge shows "ON"
3. Navigate within the site → badge briefly shows "↻" then returns to "ON"
4. The connection stays active through navigation!

## Badge States

| Badge | Meaning |
|-------|---------|
| (empty) | Not attached |
| ON | Attached and ready |
| … | Connecting |
| ↻ | Auto-reattaching after navigation |
| ! | Error (click to retry) |

## Troubleshooting

If auto-reattach fails:
- Check that the OpenClaw gateway is running
- Try clicking the extension icon manually
- Check `chrome://extensions` → Service Worker logs

---
*Patch created: 2026-02-01 by JarvisOne*
