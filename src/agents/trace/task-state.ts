/**
 * TRACE Task State — Phase 1
 *
 * A structured JSON object that survives compaction. Instead of relying solely
 * on a narrative summary (which loses structure), the Task State captures the
 * agent's current working context in a machine-readable format.
 *
 * The Task State is:
 * 1. Extracted from the conversation before compaction
 * 2. Persisted as a structured prefix in the compaction summary
 * 3. Available to the agent after compaction for task continuity
 *
 * Format: Embedded in the compaction summary as a fenced JSON block:
 *   ```task-state
 *   { ... }
 *   ```
 *   followed by the narrative summary.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskState {
  /** Schema version for forward compatibility */
  version: 1;
  /** Primary objective the user is working toward */
  objective: string | null;
  /** Ordered plan steps (if any active plan) */
  plan: PlanStep[];
  /** Key decisions made during the session */
  decisions: string[];
  /** Important artifacts: files, URLs, commits, etc. */
  artifacts: Artifact[];
  /** Open questions or blockers */
  openQuestions: string[];
  /** Session-level context that should persist */
  context: Record<string, string>;
}

export interface PlanStep {
  /** Step description */
  description: string;
  /** done, in-progress, pending */
  status: "done" | "in-progress" | "pending";
}

export interface Artifact {
  /** What kind: file, url, commit, db, etc. */
  kind: string;
  /** Path or URL */
  ref: string;
  /** Brief description */
  label: string;
}

// ---------------------------------------------------------------------------
// Task State encoding/decoding
// ---------------------------------------------------------------------------

const TASK_STATE_FENCE_START = "```task-state\n";
const TASK_STATE_FENCE_END = "\n```";

/**
 * Create a fresh empty task state.
 */
export function createEmptyTaskState(): TaskState {
  return {
    version: 1,
    objective: null,
    plan: [],
    decisions: [],
    artifacts: [],
    openQuestions: [],
    context: {},
  };
}

/**
 * Encode a TaskState into a compaction summary prefix.
 * Returns the full summary string with task state + narrative.
 */
export function encodeTaskStateInSummary(taskState: TaskState, narrativeSummary: string): string {
  // Only include task state if it has meaningful content
  if (!hasContent(taskState)) {
    return narrativeSummary;
  }

  const json = JSON.stringify(taskState, null, 2);
  return `${TASK_STATE_FENCE_START}${json}${TASK_STATE_FENCE_END}\n\n${narrativeSummary}`;
}

/**
 * Decode a TaskState from a compaction summary.
 * Returns the task state and the remaining narrative.
 */
export function decodeTaskStateFromSummary(summary: string): {
  taskState: TaskState | null;
  narrative: string;
} {
  const fenceIdx = summary.indexOf(TASK_STATE_FENCE_START);
  if (fenceIdx === -1) {
    return { taskState: null, narrative: summary };
  }

  const jsonStart = fenceIdx + TASK_STATE_FENCE_START.length;
  const fenceEnd = summary.indexOf(TASK_STATE_FENCE_END, jsonStart);
  if (fenceEnd === -1) {
    return { taskState: null, narrative: summary };
  }

  const jsonStr = summary.slice(jsonStart, fenceEnd);
  const narrative = summary.slice(fenceEnd + TASK_STATE_FENCE_END.length).trimStart();

  try {
    const parsed = JSON.parse(jsonStr) as TaskState;
    if (parsed.version !== 1) {
      return { taskState: null, narrative: summary };
    }
    return { taskState: parsed, narrative };
  } catch {
    return { taskState: null, narrative: summary };
  }
}

/**
 * Check if a task state has any meaningful content.
 */
function hasContent(ts: TaskState): boolean {
  return !!(
    ts.objective ||
    ts.plan.length > 0 ||
    ts.decisions.length > 0 ||
    ts.artifacts.length > 0 ||
    ts.openQuestions.length > 0 ||
    Object.keys(ts.context).length > 0
  );
}

// ---------------------------------------------------------------------------
// Task State extraction prompt
// ---------------------------------------------------------------------------

/**
 * Build the custom instructions for compaction that will extract a Task State.
 * This is appended to the compaction prompt so the LLM produces both
 * the narrative summary AND the structured task state.
 */
export function buildTaskStateExtractionInstructions(): string {
  return `
IMPORTANT: Before writing the narrative summary, extract a structured Task State
as a fenced JSON block. This must be the FIRST thing in your output.

Format:
\`\`\`task-state
{
  "version": 1,
  "objective": "The primary goal the user is working toward (or null)",
  "plan": [
    {"description": "Step description", "status": "done|in-progress|pending"}
  ],
  "decisions": ["Key decision 1", "Key decision 2"],
  "artifacts": [
    {"kind": "file|url|commit|db", "ref": "path or URL", "label": "brief description"}
  ],
  "openQuestions": ["Unresolved question 1"],
  "context": {"key": "value pairs of session-level context"}
}
\`\`\`

Rules for the Task State:
- objective: The current high-level goal. Null if just chatting.
- plan: Only include if there's an active multi-step plan. Mark completed steps as "done".
- decisions: Important choices that affect future work. Max 10, most recent first.
- artifacts: Files created/modified, URLs referenced, commits made. Max 20.
- openQuestions: Things that need resolution. Max 5.
- context: Key-value pairs for anything else (e.g., "branch": "feat/trace", "model": "opus").
- Be concise. Each string should be 1-2 sentences max.
- Omit empty arrays and null values where possible for brevity.

After the task-state block, write the narrative summary as usual.`.trim();
}

// ---------------------------------------------------------------------------
// Merge task states across compactions
// ---------------------------------------------------------------------------

/**
 * Merge a previous task state with a newly extracted one.
 * The new state takes priority, but we preserve artifacts and decisions
 * from the old state that aren't superseded.
 */
export function mergeTaskStates(previous: TaskState, current: TaskState): TaskState {
  // Current objective always wins
  const objective = current.objective ?? previous.objective;

  // Plan: if current has a plan, use it; otherwise keep previous
  const plan = current.plan.length > 0 ? current.plan : previous.plan;

  // Decisions: merge, dedup by text, keep most recent first, cap at 15
  const allDecisions = [...current.decisions];
  for (const d of previous.decisions) {
    if (!allDecisions.includes(d)) {
      allDecisions.push(d);
    }
  }
  const decisions = allDecisions.slice(0, 15);

  // Artifacts: merge by ref, current wins on conflict, cap at 30
  const artifactMap = new Map<string, Artifact>();
  for (const a of previous.artifacts) {
    artifactMap.set(a.ref, a);
  }
  for (const a of current.artifacts) {
    artifactMap.set(a.ref, a); // overwrite
  }
  const artifacts = [...artifactMap.values()].slice(0, 30);

  // Open questions: use current, fall back to previous
  const openQuestions =
    current.openQuestions.length > 0 ? current.openQuestions : previous.openQuestions;

  // Context: merge, current wins
  const context = { ...previous.context, ...current.context };

  return { version: 1, objective, plan, decisions, artifacts, openQuestions, context };
}
