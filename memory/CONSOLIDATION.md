# Memory Consolidation Protocol

*JarvisOne's "sleep" cycle — processing daily memories into long-term storage.*

---

## Inspiration

Human brains consolidate memories during sleep. Short-term episodic memories get processed, categorized, and stored in long-term memory. We replicate this with a nightly cron job.

---

## Schedule

**When:** 3:00 AM Europe/Madrid (nightly)
**Session:** Isolated (doesn't interrupt main session)
**Trigger:** Cron job `memory-consolidation`

---

## State Tracking

File: `memory/consolidation-state.json`

```json
{
  "lastConsolidation": "2026-02-04T03:00:00+01:00",
  "lastProcessedDate": "2026-02-04",
  "consolidationHistory": [
    { "date": "2026-02-04", "processed": ["2026-02-03.md", "2026-02-04.md"], "changes": 12 }
  ]
}
```

---

## Consolidation Levels

### Level 1: Factual Extraction
- **What:** Names, dates, facts, specifications
- **Where:** `bank/world.md`, `bank/entities/`
- **Example:** "Marcus was born December 15, 2025" → `bank/entities/Marcus.md`

### Level 2: Project Updates
- **What:** Progress, decisions, status changes
- **Where:** `memory/projects/<project>/`
- **Example:** "Committed webchat fix" → `projects/openclaw/webchat-fixes/`

### Level 3: Experience Logging
- **What:** What I did, tools I used, outcomes
- **Where:** `bank/experience.md`
- **Example:** "Applied 9 PRs to fork" → experience entry

### Level 4: Opinion Formation
- **What:** Beliefs, preferences, judgments (with confidence)
- **Where:** `bank/opinions.md`
- **Example:** "Oscar prefers wired over battery" → opinion with c=0.95

### Level 5: Lesson Derivation
- **What:** Abstract principles from specific events
- **Where:** Project `philosophy.md` files, `MEMORY.md`
- **Example:** "Code enforcement > documentation" principle

### Level 6: Pattern Recognition
- **What:** Recurring themes, connections between projects
- **Where:** Cross-cutting docs, `MEMORY.md`
- **Example:** "Security and UI both follow 'earn your space' principle"

---

## Process

1. **Read** `consolidation-state.json` to find last processed date
2. **Scan** daily logs from last processed date to today
3. **Extract** at each level (facts → patterns)
4. **Update** relevant files (don't duplicate, merge intelligently)
5. **Process** `## Retain` sections from daily logs
6. **Update** `consolidation-state.json` with completion time
7. **Report** summary of changes (optional notification)

---

## "Retain" Section Convention

Daily logs should have a `## Retain` section with items to consolidate:

```markdown
## Retain (Facts for Long-Term Memory)

- W @OpenClaw: Session indexing is opt-in via config
- B @Memory: Created project-based organization
- O(c=0.90) @Oscar: Prefers trust-first approach
```

Prefix codes:
- `W` — World fact (objective)
- `B` — Experience (what I did)
- `O(c=X.XX)` — Opinion with confidence score
- `@Entity` — Which entity/project this relates to

---

## Safeguards

- Never delete daily logs (archive, don't purge)
- Preserve original wording when uncertain
- Flag conflicts for human review
- Keep consolidation history for audit

---

*This document governs the nightly consolidation process.*
