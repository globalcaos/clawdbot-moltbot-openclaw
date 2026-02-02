# PROJECTS.md - OpenClaw Contributions Pipeline

## 📤 Full Pipeline

| #   | Type       | PR     | Commit        | Description                                                                                                                                                                                                              | Branch                              | Target              | Files Changed                                              | Status        | Verified   |
|-----|------------|--------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|---------------------|------------------------------------------------------------|---------------|------------|
| 1   | 🐛 Fix     | #6753  | `63f17a049`   | **Session key alias fix** — New session button now correctly uses the session alias (e.g., "main") instead of the raw internal key, fixing confusing display in UI                                                      | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `app-render.helpers.ts`                                    | ✅ Done       | ✔️ Yes     |
| 2   | 🐛 Fix     | #6753  | `d5a51b091`   | **Tool streaming fix** — Always broadcast tool execution events to webchat regardless of verbose setting, enabling real-time visibility of command output instead of waiting until completion                            | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `server-chat.ts`                                           | ✅ Done       | 🔍 Pending |
| 3   | 🐛 Fix     | UI-PR  | `fb455081d`   | **Security level naming** — Renamed the highest exec security level from ambiguous `all` to explicit `critical` for clarity in the dropdown selector                                                                     | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `storage.ts`, `app-render.helpers.ts`                      | ✅ Done       | ❓ No      |
| 4   | 🐛 Fix     | UI-PR  | `c20864a76`   | **Compaction indicator SVG fix** — Added explicit width/height/stroke styles to callout SVGs, fixing the bug where compaction indicator displayed as a giant blue box with black triangle                               | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `components.css`                                           | ✅ Done       | ❓ No      |
| 5   | 🐛 Fix     | UI-PR  | `ceb8c9a8b`   | **Anthropic failover patterns** — Added error detection patterns for Anthropic daily/monthly token limits ("exceeded your daily", "limit will reset", etc.) to properly trigger model fallback to Gemini                 | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `errors.ts`                                                | ✅ Done       | ❓ No      |
| 6   | ✨ Feat    | UI-PR  | `33f1417b7`   | **Voice transcript styling** — Added `.jarvis-voice` CSS class for purple italic text styling of spoken content, plus allowed `<span>` tag in markdown renderer for transcript formatting                               | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `components.css`, `markdown.ts`                            | ✅ Done       | ❓ No      |
| 7   | ✨ Feat    | UI-PR  | `c086fcbe9`   | **Token usage panel** — New panel at bottom of left nav showing per-provider usage bars (Claude 5h/Weekly, Gemini, etc.) with color-coded progress (green→yellow→red) and reset time tooltips                           | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `provider-usage.ts`, `app-render.ts`, `components.css`     | ✅ Done       | ❓ No      |
| 8   | ✨ Feat    | UI-PR  | `669602abf`   | **Thinking indicator improvement** — Shows animated dots whenever processing is active (not just when streaming), plus animated dots on Queue button and red Stop button for better visibility of background work       | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `chat.ts`, `components.css`                                | ✅ Done       | ❓ No      |
| 9   | ✨ Feat    | UI-PR  | `a92e2c432`   | **Responsive tables** — Removed 900px max-width constraint, tables now use width:100% and fit within window, cells wrap content properly                                                                                  | `fix/webchat-new-session-alias`     | openclaw/openclaw   | `grouped.css`, `text.css`                                  | ✅ Done       | ✔️ Yes     |
| 10  | ✨ Feat    | #6500  | —             | **Chrome auto-reattach** — Browser extension automatically reattaches to tab when it regains focus, eliminating need to manually click toolbar button after switching tabs                                               | (separate branch)                   | openclaw/openclaw   | —                                                          | 🔍 Review     | ❓ No      |
| 11  | ✨ Feat    | UI-PR  | —             | **Active model indicator** — Visually mark which AI model is currently being used in the token usage panel with a highlight or badge                                                                                     | —                                   | openclaw/openclaw   | —                                                          | 🔜 Planned    | —          |
| 12  | ✨ Feat    | UI-PR  | —             | **Reset time display** — Show token reset countdown prominently when provider quota is exhausted or nearly exhausted                                                                                                     | —                                   | openclaw/openclaw   | —                                                          | 🔜 Planned    | —          |
| 13  | ✨ Feat    | UI-PR  | —             | **Real-time Claude API check** — Query Anthropic API directly for actual token availability instead of relying on error responses                                                                                        | —                                   | openclaw/openclaw   | —                                                          | 🔜 Planned    | —          |
| 14  | 📦 Skill   | ClawHub| —             | **youtube-data-api** — Search YouTube videos, list subscriptions, browse playlists, get video details via Google YouTube Data API v3                                                                                     | —                                   | ClawHub             | `skills/youtube/`                                          | ⚠️ Low unique | ❓ No      |
| 15  | 📦 Skill   | —      | —             | **exec-display** — Security-classified command execution with color-coded levels (safe→critical), backend enforcement plugin, and 100+ pre-classified command patterns                                                   | —                                   | ClawHub             | `skills/exec-display/`                                     | 🚧 Maturing   | ❓ No      |
| 16  | 💭 Idea    | —      | —             | **Local AI fallback** — Install and configure a local LLM (e.g., Ollama) as unlimited fallback when all cloud providers are exhausted                                                                                    | —                                   | Local               | —                                                          | 💭 Future     | —          |

---

## PR Strategy

| PR Name | Contribs | Description |
|---------|----------|-------------|
| **#6753** | 1, 2 | Session key fix + Tool streaming (pending verification) |
| **UI-PR: Efficient UI Overhaul & Bug Fixes** | 3-9, 11-13 | Major webchat improvements: responsive tables, thinking indicators, token panel, SVG fixes, voice styling |
| **#6500** | 10 | Chrome extension auto-reattach (separate, under review) |

---

**Repo:** `~/src/clawdbot-moltbot-openclaw/`  
**Branch:** `fix/webchat-new-session-alias`  
**Commits ahead of main:** 9  
**Ready to push:** Partial (need to split PRs)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🐛 Fix | Bug fix |
| ✨ Feat | New feature |
| 📦 Skill | ClawHub skill package |
| 💭 Idea | Future consideration |
| 🔍 Review | Under review |
| 🔍 Pending | Awaiting verification |
| ✅ Done | Completed |
| 🔜 Planned | Not yet started |
| 🚧 Maturing | In development/testing |
| ⚠️ Warning | Has issues |
| ✔️ Yes | Verified by Oscar |
| ❓ No | Not yet verified |

---

*Last updated: 2026-02-02 14:00*
