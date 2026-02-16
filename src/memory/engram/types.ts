/**
 * ENGRAM — Event-Grained Memory with Retrieval-Augmented Notation
 * Core type definitions for the event store, compaction, and retrieval systems.
 */

export type EventKind =
	| "user_message"
	| "agent_message"
	| "tool_call"
	| "tool_result"
	| "system_event"
	| "compaction_marker"
	| "artifact_reference"
	| "persona_state"
	| "probe_result"
	| "humor_association"
	| "debate_synthesis"
	| "debate_trace";

export interface EventMetadata {
	taskId?: string;
	premiseRef?: string;
	supersededBy?: string;
	tags?: string[];
	artifactId?: string;
	embeddingStatus?: "pending" | "complete" | "failed";
}

export interface MemoryEvent {
	id: string;
	timestamp: string;
	turnId: number;
	sessionKey: string;
	kind: EventKind;
	content: string;
	tokens: number;
	metadata: EventMetadata;
}

export interface TimeRangeMarker {
	type: "time_range_marker";
	startTurnId: number;
	endTurnId: number;
	startTime: string;
	endTime: string;
	topicHints: string[];
	eventCount: number;
	tokenCount: number;
	level: number;
}

export interface ArtifactPreview {
	artifactId: string;
	contentType: "log" | "json" | "csv" | "search" | "text";
	preview: string;
	totalSize: number;
	lineCount: number;
}

export interface TaskState {
	version: number;
	taskId: string;
	phase: "planning" | "executing" | "debugging" | "reviewing" | "idle";
	goals: string[];
	constraints: string[];
	openLoops: string[];
	nextActions: string[];
	keyEvents: string[];
	premiseVersion: string;
	extensions: Record<string, unknown>;
	updatedAt: string;
	updatedByTurn: number;
}

export interface ScoredEvent extends MemoryEvent {
	score: number;
}

export interface RecallOptions {
	query: string | string[];
	maxTokens?: number;
	filters?: {
		taskId?: string;
		kinds?: EventKind[];
		since?: string;
		until?: string;
	};
}

export interface RecallResult {
	events: ScoredEvent[];
	totalCandidates: number;
	queryCount: number;
}

/** Kinds that should never be evicted during compaction */
export const NON_EVICTABLE_KINDS: ReadonlySet<EventKind> = new Set([
	"persona_state",
	"compaction_marker",
	"debate_synthesis",
]);
