# Sprint: Webchat Fixes

*Session handling, /new, /reset, and related improvements.*

---

## Improvements

| Improvement | Description | Status |
|-------------|-------------|--------|
| [new-reset-command](./new-reset-command/) | Fixed session reset prompt | ✅ Closed |

## Details

### /new and /reset commands (2026-02-04)

**Problem:** Session reset wasn't loading persona files properly.

**Fix:** Updated `BARE_SESSION_RESET_PROMPT` to instruct agent to read workspace files before greeting.

**Commit:** `7d5cccf16` on `fix/webchat-new-session-alias`

**Status:** ✅ Closed — committed and pushed

---

*Last updated: 2026-02-04*
