# SYNAPSE: Multi-Model Deliberation Protocol

**Status:** Active Research / Implementation Phase
**Related:** Project HIPPOCAMPUS, Project LIMBIC

## Abstract

LLMs hallucinate. They are confident but wrong. SYNAPSE is a consensus protocol for _truth triangulation_ using multiple heterogeneous models (Claude 3 Opus, GPT-4o, Gemini 1.5 Pro) in a voting ring.

## Core Mechanism

1.  **The Architect (Claude):** Proposes the high-level plan or answer.
2.  **The Critic (GPT-4o):** Reviews the Architect's proposal for logic errors, security flaws, and hallucinations.
3.  **The Synthesizer (Gemini):** Merges the Architect's proposal with the Critic's feedback into a final, robust answer.
4.  **The Voter (Local Llama/Mistral):** Breaks ties if the Architect and Critic disagree fundamentally.

## The Protocol

When a high-stakes decision is detected (e.g., executing code, deleting files, sending external messages):

1.  **Freeze:** Pause execution.
2.  **Deliberate:** Spawn sub-agents (via `sessions_spawn`) for each role.
3.  **Vote:** Collect outputs. If consensus > 66%, proceed. Else, escalate to human.

## Implementation Status

- [x] **Sub-Agent Spawning:** Implemented via `sessions_spawn` tool.
- [x] **Role Definition:** `AGENTS.md` defines sub-agent roles.
- [ ] **Automated Voting Ring:** Scripting the consensus loop (planned).
