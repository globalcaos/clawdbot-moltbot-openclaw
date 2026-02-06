# /new and /reset Commands Fix

*Ensuring proper persona loading on session reset.*

---

## Status
✅ Closed (2026-02-04)

## Problem

When user ran `/new` or `/reset`, the session started without properly loading persona files (SOUL.md, USER.md, etc.).

### Root Cause
The `BARE_SESSION_RESET_PROMPT` in `get-reply-run.ts` only said "greet in persona" without instructing to read the files first.

## Solution

Updated the prompt to explicitly instruct file reading before greeting.

### File Modified
`/home/globalcaos/src/clawdbot-moltbot-openclaw/src/auto-reply/reply/get-reply-run.ts`

### Before
```typescript
const BARE_SESSION_RESET_PROMPT =
  "A new session was started via /new or /reset. Greet the user in your configured persona...";
```

### After
```typescript
const BARE_SESSION_RESET_PROMPT =
  "New session started. Before greeting: 1) Read SOUL.md, USER.md, AGENTS.md, IDENTITY.md, MEMORY.md, TOOLS.md from workspace. 2) Read memory/YYYY-MM-DD.md for today and yesterday. 3) Create today's log if missing. 4) Then greet briefly (1-3 sentences) in your configured persona and ask what to work on...";
```

## Lesson

> **Active reading > injected context.** If the power goes out, only written files survive. Don't rely on context injection.

---

*Completed: 2026-02-04*
*Branch: fix/webchat-new-session-alias*
*Commit: 7d5cccf16*
