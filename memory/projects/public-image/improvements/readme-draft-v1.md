# README Draft v1 — OpenClaw Serra Fork

---

# 🦞 OpenClaw (Serra Fork)

> **A personal AI assistant that talks, listens, and stays ahead.**
> 
> This fork by [Oscar Serra](https://github.com/globalcaos) — actively maintained with safety patches, new features, and a focus on voice-first interaction.

<p align="center">
  <a href="https://github.com/openclaw/openclaw"><strong>📦 Original Project</strong></a> ·
  <a href="https://docs.openclaw.ai"><strong>📚 Full Docs</strong></a> ·
  <a href="https://discord.gg/clawd"><strong>💬 Discord</strong></a>
</p>

---

## Why This Fork?

The upstream OpenClaw is excellent. This fork exists to:

1. **Stay ahead** — We cherry-pick security patches, stability fixes, and new features before they hit upstream releases
2. **Add voice** — We're building toward a true conversational assistant with local TTS/STT (no cloud required)
3. **Simplify setup** — Our guides assume you'll ask the AI to help configure itself
4. **Track costs** — Multi-provider usage monitoring across Claude, Gemini, and Manus (beta)

**Target users:** People who want the bleeding edge without doing all the integration work themselves.

---

## Key Differences

| Feature | Upstream | This Fork |
|---------|----------|-----------|
| Release pace | Stable releases | Rolling updates + cherry-picked PRs |
| Voice | ElevenLabs (cloud) | Local sherpa-onnx TTS + Whisper STT |
| Multi-AI | Single provider | Claude + Gemini failover + Manus research |
| Usage tracking | Per-provider | Unified dashboard (beta) |
| Setup guide | Technical | AI-assisted ("ask Jarvis to help") |
| UI philosophy | Feature-rich | Minimal, information-dense |

---

## What We've Added

### Security & Stability (from upstream PRs)
- DNS rebinding protection (#7769)
- Zip path traversal fix (#7616)
- WebSocket origin validation (#7704)
- Smart router v2 (#7770)
- Rate limit handling (#7644)

### Features
- **WhatsApp full history sync** — Configurable via `channels.whatsapp.syncFullHistory`
- **Voice interface** — Local TTS with `jarvis` command, metallic JARVIS-style effects
- **Multi-model failover** — Claude → Gemini automatic switching on rate limits
- **Budget awareness** — AI knows its own token/cost consumption per turn
- **Minimal webchat UI** — No bubbles, no clutter, just information

### Skills
- `youtube-ultimate` — Transcript extraction, search, download (no API key)
- `google-sheets` — Workspace integration
- `healthcheck` — System security audits

---

## Quick Start

```bash
# Install
npm install -g openclaw@latest

# Setup (the AI will guide you)
openclaw onboard --install-daemon

# Talk to it
openclaw agent --message "Help me configure WhatsApp"
```

**First time?** Just ask the assistant to help you set things up. It knows how.

---

## For Family & Friends

This fork is also designed to be cloned by people I trust (hi sis! 👋). You'll automatically receive updates as we improve the platform.

```bash
git clone https://github.com/globalcaos/openclaw.git
cd openclaw
pnpm install && pnpm build
pnpm openclaw onboard
```

---

## Roadmap

- [ ] Webchat image display fix
- [ ] LinkedIn/Facebook integration for visibility
- [ ] Agent-driven platform improvement (you request, AI implements)
- [ ] Voice wake word ("Hey Jarvis")

---

## Contributing

We upstream stable improvements when ready. Found a bug? Have a feature request? Open an issue or PR.

---

## Credits

Built on [OpenClaw](https://github.com/openclaw/openclaw) by Peter Steinberger and the community.  
This fork maintained by Oscar Serra with assistance from JarvisOne (Claude Opus 4.5).

*For full documentation, channels, platforms, and configuration: see [upstream docs](https://docs.openclaw.ai)*

---

**⚠️ DRAFT — Review before publishing**

Questions:
1. Is "Serra Fork" the right name? Or something else?
2. Is the GitHub username `globalcaos` correct?
3. Anything to add/remove from the differences table?
4. Should we mention the daily maintenance cron job that monitors things?
