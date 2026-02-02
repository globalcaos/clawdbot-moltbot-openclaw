# AI Platforms Evaluation

**Last Updated:** 2026-02-01 (Post-Council & Deep Research Review)

## 🏛️ The AI Council Strategy

We treat the platforms not as tools, but as specialized staff members.

| Role | Platform(s) | When to Use |
| :--- | :--- | :--- |
| **The Architect** | **Claude 3.5/3.7** | **Reasoning, Coding, Strategy.** The smartest brain in the room. Use for high-stakes decisions, complex code, and architectural planning. |
| **The Analyst** | **ChatGPT / Grok** | **Deep Research.** Use their "Deep Research" modes (NOT standard chat) for problems requiring planning, iteration, and synthesis. They are agents, not search engines. |
| **The Librarian** | **Perplexity** | **Quick Retrieval.** "What is X?", "Find me this PDF". Excellent for instant facts and citations. Do not use for deep analysis. |
| **The Builder** | **Manus** | **Execution.** "Build this website," "Automate this flow." An autonomous agent that *does* rather than *talks*. |
| **The Consultant** | **Qwen** | **Second Opinions & Honest Checks.** Surprisingly humble and accurate. Use for bulk processing (generous limits) or when you need a "sanity check" on the others. |
| **The Artist** | **Gemini (Banana)** | **Visuals.** Nano Banana Pro is the go-to for image generation and editing. |

## 💰 Subscription & Token Management

| Platform | Cost | Best Usage Strategy |
|----------|------|---------------------|
| **Claude** | ~€200/mo (Max) | **Unlimited** (effectively). Abuse it. This is the daily driver for intelligence. |
| **ChatGPT** | ~€25/mo (Plus) | **Limited Deep Research.** Save for the heavy "Analyst" tasks. Don't waste message caps on trivial chat. |
| **Grok** | ~€25/mo (Prem) | **Real-time & DeepSearch.** Use for "now" information (X data) and DeepSearch alternatives to ChatGPT. |
| **Manus** | Free (Standard) | **Credit Limited.** 4,000 credits/mo + 300 daily. Use efficiently for specific *actions*, not chatting. |
| **Perplexity**| Free (Pro-lite)| **Quick Checks.** Infinite for basic search, limited for "Pro" reasoning. |
| **Qwen** | Free / Open | **Bulk/Backup.** Great fallback when others are capped or for testing open-weight capabilities. |

## 🎯 Revised Task Routing

| Task Type | Primary | Secondary |
|-----------|---------|-----------|
| **Coding (Complex)** | Claude | Qwen (Review) |
| **Reasoning / Logic** | Claude | ChatGPT (o1) |
| **Deep Research** | ChatGPT (Deep Research) | Grok (DeepSearch) |
| **Quick Facts** | Perplexity | Grok |
| **Current Events** | Grok (X Data) | Perplexity |
| **Build/Execute** | Manus | Claude (Code generation) |
| **Visuals** | Nano Banana (Gemini) | Qwen |
| **Translation** | DeepL / Qwen | Claude |

## 🔧 Access Notes

- **Browser Relay:** All web-based models (ChatGPT, Grok, Qwen, Manus) are controlled via OpenClaw browser relay (now patched & stable).
- **API:** Claude and Gemini are accessed via direct API for speed and reliability.
