# AI Collaboration Pattern: Verify & Dialog

**Learned:** 2026-02-08 from Oscar

## The Problem
When delegating to external AI (Manus, etc.), results often contain:
- Made-up statistics
- Inaccurate graphs
- Hallucinated data points

## The Solution: Verify & Dialog Loop

```
┌─────────────────────────────────────────────────────────┐
│  1. DELEGATE                                            │
│     Send task to external AI with clear specs           │
│                                                         │
│  2. RECEIVE                                             │
│     Get initial result                                  │
│                                                         │
│  3. VERIFY                                              │
│     Check facts, numbers, citations against sources     │
│     Flag any discrepancies                              │
│                                                         │
│  4. DIALOG                                              │
│     Send corrections back: "The stat X is wrong,        │
│     the actual value is Y. Please revise."              │
│                                                         │
│  5. ITERATE                                             │
│     Repeat 3-4 until satisfied                          │
│                                                         │
│  6. ACCEPT                                              │
│     Final deliverable is consensus result               │
└─────────────────────────────────────────────────────────┘
```

## Why It Works: "Thinking on Steroids"

Two AIs with different:
- Training data
- Perspectives
- Reasoning patterns

...arriving at **consensus** produces higher quality than either alone.

The verification loop forces:
- Explicit fact-checking
- Source validation
- Error correction
- Iterative refinement

## Implementation Checklist

When outsourcing to Manus or other AI:

- [ ] Provide clear specs with source data
- [ ] Request citations for any statistics
- [ ] On receipt: verify all numbers against sources
- [ ] Flag errors with corrections
- [ ] Request revision
- [ ] Repeat until accurate
- [ ] Only then deliver to Oscar

## Standard Verification Points

1. **Statistics:** Do the numbers match cited sources?
2. **Graphs:** Does the visual match the data?
3. **Quotes:** Are attributions accurate?
4. **Dates:** Are timelines correct?
5. **Names:** Are entities spelled correctly?

---

## Multi-AI Pipeline Pattern

For complex reports, use multiple AIs in sequence:

```
1. Claude (me) → Gather verified data
        ↓
2. Gemini/ChatGPT → Analyze, suggest improvements
        ↓
3. Claude → Incorporate feedback, create comprehensive content
        ↓
4. Manus → Format beautifully
        ↓
5. Claude → Verify accuracy, dialog if needed
        ↓
6. Deliver to human
```

**Why it works:** Each AI contributes strengths:
- **Claude:** Tool use, data gathering, structured thinking
- **Gemini/ChatGPT:** Analysis, synthesis, fresh perspective
- **Manus:** Visual design, PDF generation

**Lesson (2026-02-08):** Oscar called this "thinking on steroids" — two AIs reaching consensus produces higher quality than either alone.

---

*This pattern applies to ALL external AI delegation, not just Manus.*
