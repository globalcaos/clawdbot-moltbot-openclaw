# Memory Consolidation Protocol

_JarvisOne's "sleep" cycle — processing daily memories into long-term storage._

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
  "lastConsolidation": "2026-02-09T03:00:00+01:00",
  "lastProcessedDate": "2026-02-09",
  "consolidationHistory": [...]
}
```

---

## Information Routing Table

**Organize by USE CASE first, then by TOPIC within each bucket.**

### Tier 1: Bank (Persistent Facts — rarely change, always relevant)

| Destination               | What goes here                                                                                  | Examples                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `bank/entities/<Name>.md` | Facts about a specific person: bio, contact, relationships, character traits                    | "Marcus was born Dec 15 2025" → `entities/Marcus.md` |
| `bank/world.md`           | Objective facts about the world, systems, places — NOT about people                             | "Olivella has a POUM urban plan"                     |
| `bank/contacts.md`        | Phone numbers, JIDs, group names, contact lookup data                                           | "+34659418105 = Oscar"                               |
| `bank/experience.md`      | What JarvisOne DID (action log, chronological)                                                  | "Fixed WhatsApp 515 error"                           |
| `bank/opinions.md`        | Subjective beliefs with confidence scores — Oscar's preferences, JarvisOne's learned principles | "O(c=0.90) @Oscar: Prefers wired over battery"       |

### Tier 2: Topics (Thematic knowledge — load by relevance to current task)

| Destination                  | What goes here                                                             | Examples                                    |
| ---------------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| `topics/family.md`           | Family relationships, activities, dynamics, pets                           | "Dogs: Coco and Kiwi"                       |
| `topics/work_business.md`    | Talleres SERRA, spin-off, governance, sales, tenders                       | "Sent governance proposal to Tristany"      |
| `topics/spirituality.md`     | Beliefs, meditation, channeling, past lives, research findings             | "Akashic reading about fusion reactor team" |
| `topics/inventions.md`       | Invention ideas, details, workshop/home construction                       | "Piano LED device specs"                    |
| `topics/tech_preferences.md` | Hardware, software, AI tool stack, comparison prefs, YouTube subscriptions | "Prefers Amazon.es for purchase links"      |
| `topics/lifestyle.md`        | Recipes, finance, daily routine, hobbies                                   | "Blinchiki recipe: 3 cups flour, 6 eggs"    |
| `topics/ai_contributions.md` | ClawHub skills, OpenClaw PRs, AI collaboration vision                      | "Published youtube-data-api v1.0.0"         |
| `topics/ai_platforms.md`     | AI Council strategy, subscriptions, agent ecosystem, model comparisons     | "Moltbook.com: social network for agents"   |

### Tier 3: Projects (Task-specific — load only when working on that project)

| Destination                     | What goes here                                    | Examples                                |
| ------------------------------- | ------------------------------------------------- | --------------------------------------- |
| `projects/<name>/index.md`      | Project overview, status, decisions, architecture | "Pallet scan roadmap phase 2"           |
| `projects/<name>/<subtopic>.md` | Detailed project sub-components                   | "openclaw/history.md for fork sync log" |

### Tier 4: Knowledge (Technical reference — load when needed for specific problems)

| Destination            | What goes here                                        | Examples                          |
| ---------------------- | ----------------------------------------------------- | --------------------------------- |
| `knowledge/<topic>.md` | Technical knowledge, security findings, how-to guides | "Prompt injection defense layers" |

---

## Decision Tree: Where Does This Information Go?

```
Is it about a SPECIFIC PERSON?
  → YES → bank/entities/<Person>.md
  → NO ↓

Is it an ACTION that JarvisOne performed?
  → YES → bank/experience.md
  → NO ↓

Is it a SUBJECTIVE BELIEF or PREFERENCE (Oscar's or JarvisOne's)?
  → YES → bank/opinions.md (with confidence score)
  → NO ↓

Is it tied to a SPECIFIC PROJECT?
  → YES → projects/<project>/
  → NO ↓

Is it TECHNICAL KNOWLEDGE (how-to, reference, security)?
  → YES → knowledge/<topic>.md
  → NO ↓

Does it fit an EXISTING TOPIC?
  → YES → topics/<matching-topic>.md
  → NO ↓

CREATE A NEW TOPIC (see "New Bucket Policy" below)
```

---

## New Bucket Policy

When information doesn't fit any existing bucket:

1. **Check twice.** Re-read `memory/memory-index.md`. Is there really no existing bucket? Often the information fits if you think about it from the USE CASE perspective (who needs this, when?).

2. **If truly new, create a topic file:**
   - File: `topics/<descriptive-name>.md`
   - Use lowercase, hyphens for spaces: `topics/health-wellness.md`
   - Start with a `# Title` and brief description of what goes here
   - Add at least 3 items before creating (don't create a file for one fact)

3. **Update the index immediately:**
   - Add the new file to `memory/memory-index.md` under "Core Memory Topics"
   - This is MANDATORY — an unindexed file is a lost file

4. **Grouping principle: USE CASE first, TOPIC second.**
   - Bad: `topics/dogs.md` (too narrow — who loads this and when?)
   - Good: `topics/family.md` → "## Pets" section (loaded when discussing family)
   - Bad: `topics/bitcoin.md` (when would this be loaded independently?)
   - Good: `topics/lifestyle.md` → "## Financial" section (loaded with lifestyle context)

5. **When in doubt, append to the closest existing topic** with a clear `## New Section` header. It's better to have a slightly broad topic file than 50 ultra-specific files that never get loaded.

---

## Consolidation Levels

### Level 1: Factual Extraction

- **What:** Names, dates, facts, specifications
- **Where:** `bank/world.md`, `bank/entities/`
- **Example:** "Marcus was born December 15, 2025" → `bank/entities/Marcus.md`

### Level 2: Project Updates

- **What:** Progress, decisions, status changes
- **Where:** `memory/projects/<project>/`
- **Example:** "Committed webchat fix" → `projects/openclaw/`

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
- **Where:** `bank/opinions.md` or relevant `knowledge/` file
- **Example:** "Code enforcement > documentation" principle

### Level 6: Pattern Recognition

- **What:** Recurring themes, connections between projects
- **Where:** Relevant topic file or new `knowledge/` entry
- **Example:** "Security and UI both follow 'earn your space' principle"

---

## Process

1. **Read** `consolidation-state.json` to find last processed date
2. **Read** `memory/memory-index.md` to know the current bucket structure
3. **Scan** daily logs from last processed date to today
4. **For each piece of information**, use the Decision Tree above to route it
5. **Merge intelligently** — don't duplicate. If a fact already exists, skip or update it
6. **Process** `## Retain` sections from daily logs (explicit consolidation requests)
7. **If you created new files**, update `memory/memory-index.md`
8. **Update** `consolidation-state.json` with completion time
9. **Report** summary of changes to `consolidation-logs/YYYY-MM-DD.md`

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
- If a daily log has >20 items, process in batches to avoid context overload

---

## Cron Research Output Handling

The other cron jobs (meta-ai, spiritual-tech, self-evolution, security, maintenance) write to their own directories. The consolidation job should NOT re-process these — they are handled by periodic manual "sleep cycle" consolidations (like the one done 2026-02-09). The nightly job only processes `daily logs` (memory/YYYY-MM-DD.md).

---

_This document governs the nightly consolidation process. Updated: 2026-02-09._
