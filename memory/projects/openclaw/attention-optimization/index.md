# Attention Optimization

*Understanding and mitigating my own attention/memory limitations.*

## Purpose

Research and implement strategies to ensure I reliably follow instructions, especially behavioral constraints like voice output, formatting rules, and persona requirements.

## Status: 🟢 Open

## Problem Statement

On 2026-02-04, I failed to follow a clear instruction in SOUL.md ("Every response should include spoken audio via jarvis command") despite having read the file. This revealed fundamental limitations in how transformer attention mechanisms handle instructions in long contexts.

## Research Findings (2026-02-04)

### The 5 Mechanisms of Instruction Decay

| Mechanism | Description | Mitigation |
|-----------|-------------|------------|
| **Lost in the Middle** | U-shaped attention curve — primacy + recency strong, middle weak | Put critical instructions at END of context |
| **Instruction Dilution** | Instructions become <2% of total tokens in long contexts | Re-inject instructions periodically |
| **Recency Bias** | Pattern completion prioritizes local texture over distant rules | Make rules part of immediate context |
| **Causal Masking** | Early tokens lose specificity through attention layers | Repeat constraints near output |
| **Attention Sinks** | First tokens absorb "junk" attention, not semantic | Don't rely on position alone |

### Key Academic Sources

- **Liu et al. (2023)** — "Lost in the Middle: How Language Models Use Long Contexts"
- **Xiao et al. (2023)** — "Efficient Streaming Language Models with Attention Sinks"

### Abstract Principle

> **"Distant instructions decay. Proximate instructions persist."**

Any behavior that MUST happen every response should be in the *last* thing I see before responding, not the first.

## Improvements Implemented

### 1. Session Reset Prompt Fix ✅
- Removed arbitrary "1-3 sentences" constraint
- Added explicit voice requirement at END of prompt (maximum recency)
- File: `src/auto-reply/reply/get-reply-run.ts`

### 2. Behavioral Checklist (Pending)
- Add post-read checklist to AGENTS.md
- Run before every response: Voice? Format? Persona?

### 3. Documentation
- This index file
- MEMORY.md updated with attention insights
- Daily log updated

## Future Improvements

- [ ] Context pinning feature in OpenClaw (force instructions to end of context)
- [ ] Instruction highlighting with special tokens
- [ ] Context compression for long sessions
- [ ] Behavioral hooks that check output before sending

## Related

- [AURORA Protocol](../../../MEMORY.md#aurora-communication-protocol) — Output completeness patterns
- [SOUL.md Communication Protocol](../../../../SOUL.md) — Hybrid output requirements

---

*Created: 2026-02-04*
