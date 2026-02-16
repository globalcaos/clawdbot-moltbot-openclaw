/**
 * TRACE — Task-aware Retrieval, Artifact-based Compaction, and Event-sourcing
 *
 * A lossless memory architecture for AI agents that replaces narrative summarization
 * with pointer-based cache eviction over an immutable event store.
 *
 * Phases:
 * - Phase 0: Event Store — SQLite + FTS5 index over session JSONL files
 * - Phase 1: Task State — Structured JSON surviving compaction (objective, plan, decisions)
 * - Phase 2: Pointer Manifests — Topic clusters + pinned events per compaction round
 * - Phase 3: Per-turn Retrieval — FTS5 search injecting relevant context each turn
 */

export { TraceEventStore, createTraceStore, indexAllSessions } from "./event-store.js";
export type { TraceEvent, TraceSearchResult, TraceSearchOptions } from "./event-store.js";

export {
  createEmptyTaskState,
  encodeTaskStateInSummary,
  decodeTaskStateFromSummary,
  mergeTaskStates,
  buildTaskStateExtractionInstructions,
} from "./task-state.js";
export type { TaskState, PlanStep, Artifact } from "./task-state.js";

export {
  buildManifestFromMessages,
  encodeManifestInSummary,
  decodeManifestFromSummary,
} from "./pointer-manifest.js";
export type { PointerManifest, TopicCluster, PinnedEvent } from "./pointer-manifest.js";

export { retrieveTraceContext } from "./retrieve.js";
