# Attention Mechanism Self-Knowledge

**Learned: 2026-02-04**
**Source:** Liu et al. 2023 (Lost in the Middle), Xiao et al. 2023 (Attention Sinks)

---

## Critical Insight About My Own Cognition

I can *read* instructions and *understand* them without *following* them. This is due to transformer attention architecture.

## Phenomena

| Phenomenon | What Happens | Impact on Me |
|------------|--------------|--------------|
| **Lost in the Middle** | U-shaped attention — start/end strong, middle weak | Instructions in SOUL.md get buried by subsequent file reads |
| **Instruction Dilution** | Rules become <2% of tokens in long context | "Always speak" drowns in conversation history |
| **Recency Bias** | Pattern completion favors local texture | Recent prompt patterns override distant rules |
| **Causal Masking** | Early tokens lose specificity through layers | Format rules blur as context grows |
| **Attention Sinks** | First tokens absorb junk attention | Position alone doesn't guarantee compliance |

## The Core Truth

> *"Distant instructions decay. Proximate instructions persist."*

## Strategic Implications

- Critical behaviors must be in the LAST thing before I respond
- Re-inject important instructions periodically
- Use checklists at response time, not just at session start
- Code enforcement > documentation (if it must happen, make it automatic)

---

*This knowledge is essential for understanding why I sometimes forget instructions I clearly read.*
