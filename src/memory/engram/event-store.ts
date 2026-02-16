/**
 * ENGRAM Event Store — Append-only event storage with retrieval and scoring.
 */

import type { EventKind, EventMetadata, MemoryEvent, ScoredEvent, RecallOptions, RecallResult, TaskState, TimeRangeMarker } from "./types.js";
import { NON_EVICTABLE_KINDS } from "./types.js";

let idCounter = 0;

/** Generate a time-sortable unique ID (simplified ULID) */
function generateId(): string {
	const ts = Date.now().toString(36).padStart(9, "0");
	const rand = (++idCounter).toString(36).padStart(4, "0");
	return `${ts}${rand}`;
}

/** Rough token estimate: ~4 chars per token */
function estimateTokens(text: string): number {
	return Math.ceil(text.length / 4);
}

export class EventStore {
	private events: MemoryEvent[] = [];
	private markers: TimeRangeMarker[] = [];
	private embeddings = new Map<string, Float64Array>();

	/** Append a new event to the store */
	append(params: {
		turnId: number;
		sessionKey: string;
		kind: EventKind;
		content: string;
		metadata?: EventMetadata;
	}): MemoryEvent {
		const event: MemoryEvent = {
			id: generateId(),
			timestamp: new Date().toISOString(),
			turnId: params.turnId,
			sessionKey: params.sessionKey,
			kind: params.kind,
			content: params.content,
			tokens: estimateTokens(params.content),
			metadata: params.metadata ?? {},
		};
		this.events.push(event);
		return event;
	}

	/** Get all events, optionally filtered */
	getEvents(filter?: { kinds?: EventKind[]; sessionKey?: string; since?: string; until?: string }): MemoryEvent[] {
		let result = [...this.events];
		if (filter?.kinds) {
			const kindSet = new Set(filter.kinds);
			result = result.filter((e) => kindSet.has(e.kind));
		}
		if (filter?.sessionKey) {
			result = result.filter((e) => e.sessionKey === filter.sessionKey);
		}
		if (filter?.since) {
			result = result.filter((e) => e.timestamp >= filter.since!);
		}
		if (filter?.until) {
			result = result.filter((e) => e.timestamp <= filter.until!);
		}
		return result;
	}

	/** Get a single event by ID */
	getEvent(id: string): MemoryEvent | undefined {
		return this.events.find((e) => e.id === id);
	}

	/** Get the last N events */
	getRecentEvents(n: number): MemoryEvent[] {
		return this.events.slice(-n);
	}

	/** Total token count of all stored events */
	totalTokens(): number {
		return this.events.reduce((sum, e) => sum + e.tokens, 0);
	}

	/** Store an embedding vector for an event */
	setEmbedding(eventId: string, embedding: Float64Array): void {
		this.embeddings.set(eventId, embedding);
	}

	/** Retrieve embedding for an event */
	getEmbedding(eventId: string): Float64Array | undefined {
		return this.embeddings.get(eventId);
	}

	/** Simple cosine similarity between two vectors */
	private cosineSimilarity(a: Float64Array, b: Float64Array): number {
		if (a.length !== b.length) return 0;
		let dot = 0;
		let normA = 0;
		let normB = 0;
		for (let i = 0; i < a.length; i++) {
			dot += a[i] * b[i];
			normA += a[i] * a[i];
			normB += b[i] * b[i];
		}
		const denom = Math.sqrt(normA) * Math.sqrt(normB);
		return denom === 0 ? 0 : dot / denom;
	}

	/** Score an event against a query embedding + task state */
	scoreEvent(event: MemoryEvent, queryEmbedding: Float64Array, taskState?: TaskState): number {
		const eventEmb = this.embeddings.get(event.id);
		let similarity = 0.5; // default if no embedding
		if (eventEmb) {
			similarity = this.cosineSimilarity(eventEmb, queryEmbedding);
		}

		// Recency bonus (exponential decay, half-life ~50 events)
		const age = this.events.indexOf(event);
		const recency = Math.exp(-0.01 * (this.events.length - age));

		let score = 0.6 * similarity + 0.4 * recency;

		// Task-conditioned modifier
		if (taskState) {
			if (event.metadata.taskId && event.metadata.taskId !== taskState.taskId) {
				score *= 0.3; // cross-task decay
			}
			if (event.metadata.supersededBy) {
				score *= 0.1; // supersession discount
			}
			if (event.metadata.tags?.includes("constraint")) {
				score = Math.max(score, 0.8); // constraint protection
			}
		}

		return score;
	}

	/** Recall events matching a query */
	recall(options: RecallOptions, queryEmbedding?: Float64Array, taskState?: TaskState): RecallResult {
		const queries = Array.isArray(options.query) ? options.query : [options.query];
		const maxTokens = options.maxTokens ?? 4000;

		let candidates = this.getEvents(options.filters);

		// Text-based filtering
		const textMatches = new Set<string>();
		for (const q of queries) {
			const lower = q.toLowerCase();
			for (const e of candidates) {
				if (e.content.toLowerCase().includes(lower)) {
					textMatches.add(e.id);
				}
			}
		}

		// Score candidates
		const dummyEmb = queryEmbedding ?? new Float64Array(768);
		const scored: ScoredEvent[] = candidates.map((e) => ({
			...e,
			score: textMatches.has(e.id) ? 0.8 + this.scoreEvent(e, dummyEmb, taskState) * 0.2 : this.scoreEvent(e, dummyEmb, taskState),
		}));

		// Sort by score descending
		scored.sort((a, b) => b.score - a.score);

		// Pack under budget
		let tokenBudget = maxTokens;
		const selected: ScoredEvent[] = [];
		for (const e of scored) {
			if (e.tokens > tokenBudget) continue;
			selected.push(e);
			tokenBudget -= e.tokens;
			if (tokenBudget <= 0) break;
		}

		return {
			events: selected,
			totalCandidates: candidates.length,
			queryCount: queries.length,
		};
	}

	/** Pointer-based compaction: evict events, replace with time-range marker */
	compact(options: { maxTokens: number; hotTailTurns?: number }): TimeRangeMarker[] {
		const hotTail = options.hotTailTurns ?? 8;
		const newMarkers: TimeRangeMarker[] = [];

		while (this.totalTokens() > options.maxTokens) {
			// Find evictable events (not in hot tail, not protected kinds)
			const cutoff = this.events.length - hotTail;
			const evictable = this.events.filter(
				(e, i) => i < cutoff && !NON_EVICTABLE_KINDS.has(e.kind),
			);

			if (evictable.length === 0) break;

			// Evict oldest batch (up to 10 events)
			const batch = evictable.slice(0, 10);
			const batchIds = new Set(batch.map((e) => e.id));

			const marker: TimeRangeMarker = {
				type: "time_range_marker",
				startTurnId: batch[0].turnId,
				endTurnId: batch[batch.length - 1].turnId,
				startTime: batch[0].timestamp,
				endTime: batch[batch.length - 1].timestamp,
				topicHints: extractTopicHints(batch),
				eventCount: batch.length,
				tokenCount: batch.reduce((s, e) => s + e.tokens, 0),
				level: 0,
			};

			// Remove evicted events, keep non-evicted
			this.events = this.events.filter((e) => !batchIds.has(e.id));
			this.markers.push(marker);
			newMarkers.push(marker);
		}

		return newMarkers;
	}

	/** Get all markers */
	getMarkers(): TimeRangeMarker[] {
		return [...this.markers];
	}

	/** Event count */
	get size(): number {
		return this.events.length;
	}
}

/** Extract topic hints from a batch of events */
function extractTopicHints(events: MemoryEvent[]): string[] {
	const hints = new Set<string>();
	for (const e of events) {
		if (e.metadata.tags) {
			for (const tag of e.metadata.tags) hints.add(tag);
		}
		// Extract first few words as topic hint
		const words = e.content.split(/\s+/).slice(0, 3).join(" ");
		if (words.length > 5) hints.add(words);
	}
	return [...hints].slice(0, 5);
}
