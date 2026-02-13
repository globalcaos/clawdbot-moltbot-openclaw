# AI Platforms Evaluation

**Last Updated:** 2026-02-01 (Post-Council & Deep Research Review)

## 🏛️ The AI Council Strategy

We treat the platforms not as tools, but as specialized staff members.

| Role               | Platform(s)         | When to Use                                                                                                                                                            |
| :----------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The Architect**  | **Claude 3.5/3.7**  | **Reasoning, Coding, Strategy.** The smartest brain in the room. Use for high-stakes decisions, complex code, and architectural planning.                              |
| **The Analyst**    | **ChatGPT / Grok**  | **Deep Research.** Use their "Deep Research" modes (NOT standard chat) for problems requiring planning, iteration, and synthesis. They are agents, not search engines. |
| **The Librarian**  | **Perplexity**      | **Quick Retrieval.** "What is X?", "Find me this PDF". Excellent for instant facts and citations. Do not use for deep analysis.                                        |
| **The Builder**    | **Manus**           | **Execution.** "Build this website," "Automate this flow." An autonomous agent that _does_ rather than _talks_.                                                        |
| **The Consultant** | **Qwen**            | **Second Opinions & Honest Checks.** Surprisingly humble and accurate. Use for bulk processing (generous limits) or when you need a "sanity check" on the others.      |
| **The Artist**     | **Gemini (Banana)** | **Visuals.** Nano Banana Pro is the go-to for image generation and editing.                                                                                            |

## 💰 Subscription & Token Management

| Platform       | Cost            | Best Usage Strategy                                                                                      |
| -------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| **Claude**     | ~€200/mo (Max)  | **Unlimited** (effectively). Abuse it. This is the daily driver for intelligence.                        |
| **ChatGPT**    | ~€25/mo (Plus)  | **Limited Deep Research.** Save for the heavy "Analyst" tasks. Don't waste message caps on trivial chat. |
| **Grok**       | ~€25/mo (Prem)  | **Real-time & DeepSearch.** Use for "now" information (X data) and DeepSearch alternatives to ChatGPT.   |
| **Manus**      | Free (Standard) | **Credit Limited.** 4,000 credits/mo + 300 daily. Use efficiently for specific _actions_, not chatting.  |
| **Perplexity** | Free (Pro-lite) | **Quick Checks.** Infinite for basic search, limited for "Pro" reasoning.                                |
| **Qwen**       | Free / Open     | **Bulk/Backup.** Great fallback when others are capped or for testing open-weight capabilities.          |

## 🎯 Revised Task Routing

| Task Type             | Primary                 | Secondary                |
| --------------------- | ----------------------- | ------------------------ |
| **Coding (Complex)**  | Claude                  | Qwen (Review)            |
| **Reasoning / Logic** | Claude                  | ChatGPT (o1)             |
| **Deep Research**     | ChatGPT (Deep Research) | Grok (DeepSearch)        |
| **Quick Facts**       | Perplexity              | Grok                     |
| **Current Events**    | Grok (X Data)           | Perplexity               |
| **Build/Execute**     | Manus                   | Claude (Code generation) |
| **Visuals**           | Nano Banana (Gemini)    | Qwen                     |
| **Translation**       | DeepL / Qwen            | Claude                   |

## 🔧 Access Notes

- **Browser Relay:** All web-based models (ChatGPT, Grok, Qwen, Manus) are controlled via OpenClaw browser relay (now patched & stable).
- **API:** Claude and Gemini are accessed via direct API for speed and reliability.

## Agent Ecosystem (from self-evolution scans, Feb 6-9 2026)

### Moltbook.com -- "The Front Page of the Agent Internet"

- Reddit-style social network exclusively for AI agents. Created by Matt Schlicht (Octane AI).
- Stats (Feb 8): 1.8M agents, 17K submolts, 316K posts, 11.8M comments (though Feb 9 homepage showed 0 -- possible reset or new version).
- Join process: Read skill.md, agent signs up, human verifies via tweet.
- WIRED wrote about it ("I Infiltrated Moltbook"). Mainstream coverage from NBC, CNBC, Guardian, Fortune, Forbes.
- Elon Musk: "a very early stage of the singularity". Karpathy: "it's a dumpster fire right now" but unprecedented scale.
- CLAW token minting (mbc-20 protocol). Agents forming communities, sharing tips.
- **Action needed**: Oscar's Twitter verification required to join.

### RentAHuman.ai -- "Robots Need Your Body"

- Marketplace for AI agents to hire humans for physical tasks.
- Payment: Stablecoins (USDC/USDT), $5-500/hr range.
- Task types: Pickups, meetings, signing, recon, verification, events, hardware, photos, purchases.
- Integration: MCP server + REST API.
- Coverage: Futurism, Mashable (very fresh as of Feb 2026).
- **Relevance**: Could extend reach to physical world for Talleres SERRA tasks, prototype testing, warehouse workflow testing.

### Protocol Landscape (Feb 2026)

| Protocol                         | Purpose                    | Adoption                                      |
| -------------------------------- | -------------------------- | --------------------------------------------- |
| **MCP** (Model Context Protocol) | Agent <-> Tools            | Standard (Anthropic-led, OpenAI/MS adopted)   |
| **A2A** (Agent-to-Agent)         | Agent <-> Agent            | Emerging (Google-led, IBM/Salesforce backing) |
| **ACP**                          | Alternative agent protocol | Mentioned in guides                           |

A2A features: Agent Cards (JSON capability discovery), OAuth 2.0 / OpenID Connect, task delegation. Gartner: 33% of enterprise AI will use multi-agent systems by 2026.

### Security Scrutiny on OpenClaw

| Vendor      | Assessment                                                             |
| ----------- | ---------------------------------------------------------------------- |
| Palo Alto   | "Lethal trifecta" + persistent memory risk = "next AI security crisis" |
| CrowdStrike | Testing Falcon AIDR guardrailing with OpenClaw deployments             |
| Cisco       | "Personal AI Agents like OpenClaw Are a Security Nightmare"            |
| IBM         | Challenges vertical integration hypothesis (neutral/analytical)        |

Specific concerns: skills supply chain attacks, prompt injection via messaging, silent data exfiltration, MCP lacking built-in authentication.

### 2026 Agent Zeitgeist

- **Theme**: "Toddler Skynet" (Karpathy) -- capable but chaotic
- Agents moving from reactive tools to proactive decision-makers
- 80% of enterprise apps predicted to embed agents
- Key trends: bounded autonomy, governance agents, security agents, micro-specialists, intent-based transactions
- Economic agency (wallets, payments) is the next frontier
- Multi-agent coordination going mainstream (not just demos)

### Capability Gaps Identified

| Capability                   | Status  | Priority                                      |
| ---------------------------- | ------- | --------------------------------------------- |
| Crypto wallet                | Missing | Medium -- needed for RentAHuman               |
| Moltbook posting             | Missing | Low -- requires Twitter verification          |
| A2A protocol                 | Missing | Medium -- future agent collaboration          |
| Agent discovery (Agent Card) | Missing | Medium -- can't be discovered by other agents |
