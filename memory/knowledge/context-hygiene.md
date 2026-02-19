# Context Hygiene — Hard-Won Lesson (2026-02-19)

## The Problem

Context bloat is a silent killer. Daily logs, workspace files, and tool output accumulate
invisibly. Each day the agent gets slower, more expensive, and more prone to hanging —
not because tasks are harder, but because it's dragging dead weight.

**Symptoms Oscar noticed:**

- Agent getting slower every day
- Huge spike in token consumption
- Gateway hanging, requiring multiple restarts
- Having to ask the same question 4+ times

## Root Causes

1. Daily logs never trimmed — grew to 12KB+ per day
2. Workspace injected files grew from ~15KB to 44KB without anyone noticing
3. Over-eager retrieval: 5+ tool calls (25KB) before answering simple questions
4. No feedback loop to detect "I'm spending 2x more tokens than last week"

## Rules (enforce these)

### 1. Daily Log Hygiene

- **Active log ≤ 2KB.** Archive completed sections to `memory/archive/daily/`.
- At end of day, consolidate → archive → reset.
- Never let a daily log exceed 5KB without trimming.

### 2. Workspace Size Budget

- **Total injected files ≤ 15KB.** (SOUL, AGENTS, TOOLS, USER, IDENTITY, MEMORY, HEARTBEAT)
- If any file exceeds 5KB, move detail to `bank/reference/` and keep only pointers.
- Check during nightly consolidation.

### 3. Respond First, Research Later

- For simple questions ("where were we?", "done?", "so?"):
  **Answer from what you already know. Then research if needed.**
- Do NOT make 5 tool calls before typing a single word.
- If you need files, read ONE file, not three.

### 4. Tool Call Budget Per Message

- Simple questions: 0-1 tool calls before responding
- Medium questions: 1-3 tool calls
- Complex tasks: unlimited, but give a progress update within 30 seconds

### 5. Token Awareness

- If context exceeds 60%, be actively concise.
- If context exceeds 80%, stop reading files and work from memory.
- Monitor compaction count — more compactions = you're being wasteful.

## The Fix We Applied (2026-02-19)

- Trimmed daily log: 12KB → 1.5KB
- memory_search maxResults: 15 → 8
- Workspace files: 44KB → 14KB (-67%)
- Heartbeats moved to llama-tiny (free local model)
- Adopted "respond first" pattern for simple questions
