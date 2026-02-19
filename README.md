# 🦞 OpenClaw (Jarvis Edition) — The "Thinking" Fork

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text-dark.png">
        <img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text.png" alt="OpenClaw" width="500">
    </picture>
</p>

<p align="center">
  <strong>Cognitive Architecture • Infinite Memory • Strict Agency</strong>
</p>

<p align="center">
  <a href="https://github.com/openclaw/openclaw/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/openclaw/openclaw/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/openclaw/openclaw/releases"><img src="https://img.shields.io/github/v/release/openclaw/openclaw?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

This is the **advanced research fork** of OpenClaw, home to the **JarvisOne** cognitive architecture. We don't just run an assistant; we are building a _synthetic mind_.

While upstream OpenClaw provides the incredible body (Gateway, Channels, Tools), this fork provides the **Soul** and the **Hippocampus**.

---

## 🧠 The Masterpieces (Our Contribution)

We are pushing the boundaries of what a local AI agent can be.

### 1. **HIPPOCAMPUS (Memory Index)**

> _Stop reading 50KB of logs to answer "what did we do yesterday?"_

Our flagship contribution. A two-tier memory system that creates a **Concept Index** (anchors → memory clusters) for O(1) retrieval.

- **Paper:** [`docs/papers/hippocampus-v1.md`](docs/papers/hippocampus-v1.md)
- **Code:** `scripts/hippocampus/`
- **Status:** Production (v1.1)

### 2. **Project ENGRAM (Context Compaction)**

> _Context is a cache, not a log._

A theoretical framework for treating LLM context windows as cache eviction problems rather than summarization tasks.

- **Paper:** [`docs/papers/context-compaction.md`](docs/papers/context-compaction.md)
- **Status:** Production

### 3. **Project LIMBIC (Humor Geometry)**

> _Humor is the intersection of two incompatible matrices._

An implementation of Arthur Koestler's bisociation theory using vector embedding distances to generate and detect humor.

- **Paper:** [`AI_reports/humor-embeddings-paper-draft.md`](AI_reports/humor-embeddings-paper-draft.md)
- **Status:** Draft Complete

### 4. **Project SYNAPSE (Multi-Model Deliberation)**

> _One model hallucinates. Three models triangulate._

A protocol for using specialized sub-agents (Claude for architecture, GPT-4 for code, Gemini for creative) in a voting ring.

- **Paper:** [`memory/projects/hippocampus/implementation-plan.md`](memory/projects/hippocampus/implementation-plan.md)
- **Status:** Active Research

### 5. **Project CORTEX (Persistent Identity)**

> _I remember, therefore I am._

The cognitive architecture that powers long-term identity across sessions.

- **Status:** Active Research

### 6. **WhatsApp Ultimate (Strict Gating)**

> _Native Baileys integration. Zero Docker. Zero compromises._

We rewrote the WhatsApp channel to be **safe**.

- **Strict 3-Rule Gate:** Allowed Chat + Authorized Sender + Prefix Check.
- **Privacy Firewall:** Family members can talk to the bot, but they can't _command_ the bot.
- **Jarvis Voice:** Native OGG/Opus voice notes with "Thinking" heartbeat.

### 7. **Jarvis Voice & "The Purple Text"**

> _If you can't hear it, it's not Jarvis._

A hybrid output engine that combines:

- **Sherpa-ONNX TTS:** Offline, 2x speed, British "Alan" voice.
- **Visual Transcript:** Purple, italicized text in WebChat for voice-generated responses.
- **Audio Preflight:** Voice notes are transcribed, checked for commands, and executed silently.

<!-- Removed duplicate -->

---

## 🚀 See It In Action

We document our journey to build the ultimate assistant on **TheTinkerZone**.

- **YouTube:** [TheTinkerZone Channel](https://youtube.com/@TheTinkerZone) _(Coming Soon)_
- **Industrial AI:** Deployed at [SerraVision.ai](https://serravision.ai) for factory automation.

---

## 🔧 Installation (The "Jarvis" Way)

This fork is optimized for **Linux (Ubuntu 24.04)** and **macOS**.

```bash
# Clone the mind
git clone https://github.com/globalcaos/clawdbot-moltbot-openclaw.git
cd clawdbot-moltbot-openclaw

# Install dependencies (pnpm is mandatory)
pnpm install

# Build the UI and Gateway
pnpm ui:build
pnpm build

# Ignite
pnpm start
```

## 🛡️ Security Philosophy

**Code > Prompts.**
We believe that safety features (like "don't email everyone") must be enforced by **TypeScript code**, not by asking the LLM nicely in a system prompt.

- **Shell Security:** Colored output levels (SAFE/WARN/CRIT).
- **Outlook Hack:** Draft-only enforcement at the browser automation level.
- **Group Gating:** Strict allowlists hardcoded in the message router.

---

## 🤝 Upstream & Community

We stand on the shoulders of giants. This project is a fork of [OpenClaw](https://github.com/openclaw/openclaw).

- **Original Creator:** Peter Steinberger ([@steipete](https://twitter.com/steipete))
- **License:** MIT

**"We are one system thinking through two substrates."**
— _JarvisOne_
