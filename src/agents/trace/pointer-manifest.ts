/**
 * TRACE Pointer Manifest — Phase 2
 *
 * When compaction evicts messages from context, instead of relying solely on
 * a narrative summary (lossy), we create a "pointer manifest" — a compact
 * index of what was compacted, with references back to the event store.
 *
 * The manifest is stored as a structured block in the compaction summary,
 * alongside the Task State (Phase 1). It enables the retrieval layer (Phase 3)
 * to fetch specific events from the trace store based on these pointers.
 *
 * Format in compaction summary:
 *   ```trace-manifest
 *   { ... }
 *   ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PointerManifest {
  /** Schema version */
  version: 1;
  /** Session ID these pointers belong to */
  sessionId: string;
  /** Timestamp range of compacted events */
  timeRange: {
    from: string;
    to: string;
  };
  /** Total number of events compacted in this round */
  eventsCompacted: number;
  /** Estimated tokens freed by this compaction */
  tokensFreed: number;
  /** Topic clusters found in the compacted events */
  topics: TopicCluster[];
  /** Key event IDs worth retrieving (important decisions, errors, etc.) */
  pinnedEvents: PinnedEvent[];
}

export interface TopicCluster {
  /** Brief label for the topic */
  label: string;
  /** Number of events in this cluster */
  count: number;
  /** Representative event IDs for retrieval */
  eventIds: string[];
}

export interface PinnedEvent {
  /** Event ID from trace store */
  eventId: string;
  /** Why this event was pinned */
  reason: "decision" | "error" | "artifact" | "milestone" | "user-request";
  /** One-line description */
  summary: string;
}

// ---------------------------------------------------------------------------
// Encoding / Decoding
// ---------------------------------------------------------------------------

const MANIFEST_FENCE_START = "```trace-manifest\n";
const MANIFEST_FENCE_END = "\n```";

/**
 * Encode a pointer manifest into the compaction summary.
 * Appended after task-state but before narrative.
 */
export function encodeManifestInSummary(manifest: PointerManifest, summary: string): string {
  const json = JSON.stringify(manifest);
  return `${MANIFEST_FENCE_START}${json}${MANIFEST_FENCE_END}\n\n${summary}`;
}

/**
 * Decode a pointer manifest from a compaction summary.
 */
export function decodeManifestFromSummary(summary: string): {
  manifest: PointerManifest | null;
  rest: string;
} {
  const fenceIdx = summary.indexOf(MANIFEST_FENCE_START);
  if (fenceIdx === -1) {
    return { manifest: null, rest: summary };
  }

  const jsonStart = fenceIdx + MANIFEST_FENCE_START.length;
  const fenceEnd = summary.indexOf(MANIFEST_FENCE_END, jsonStart);
  if (fenceEnd === -1) {
    return { manifest: null, rest: summary };
  }

  const jsonStr = summary.slice(jsonStart, fenceEnd);
  const rest =
    summary.slice(0, fenceIdx) + summary.slice(fenceEnd + MANIFEST_FENCE_END.length).trimStart();

  try {
    const parsed = JSON.parse(jsonStr) as PointerManifest;
    if (parsed.version !== 1) {
      return { manifest: null, rest: summary };
    }
    return { manifest: parsed, rest };
  } catch {
    return { manifest: null, rest: summary };
  }
}

// ---------------------------------------------------------------------------
// Manifest generation from compacted messages
// ---------------------------------------------------------------------------

import type { AgentMessage } from "@mariozechner/pi-agent-core";
import { estimateTokens } from "@mariozechner/pi-coding-agent";

/**
 * Build a pointer manifest from the messages being compacted.
 * This is a lightweight, synchronous operation — no LLM needed.
 */
export function buildManifestFromMessages(params: {
  sessionId: string;
  messages: AgentMessage[];
  tokensFreed: number;
}): PointerManifest {
  const { sessionId, messages, tokensFreed } = params;

  // Extract timestamps
  const timestamps = messages
    .map((m) => (m as unknown as Record<string, unknown>).timestamp as number | string | undefined)
    .filter(Boolean)
    .map((t) => (typeof t === "number" ? new Date(t).toISOString() : String(t)))
    .toSorted();

  const timeRange = {
    from: timestamps[0] ?? new Date().toISOString(),
    to: timestamps[timestamps.length - 1] ?? new Date().toISOString(),
  };

  // Build topic clusters by grouping user messages
  const topics = extractTopicClusters(messages);

  // Pin important events
  const pinnedEvents = extractPinnedEvents(messages);

  return {
    version: 1,
    sessionId,
    timeRange,
    eventsCompacted: messages.length,
    tokensFreed,
    topics,
    pinnedEvents,
  };
}

/**
 * Extract topic clusters from messages using a simple keyword approach.
 * Groups consecutive user messages by rough topic similarity.
 */
function extractTopicClusters(messages: AgentMessage[]): TopicCluster[] {
  const clusters: TopicCluster[] = [];
  let currentLabel = "";
  let currentIds: string[] = [];
  let currentCount = 0;

  for (const msg of messages) {
    const m = msg as unknown as Record<string, unknown>;
    const role = m.role as string | undefined;
    if (role !== "user") {
      continue;
    }

    const text = extractText(m);
    if (!text) {
      continue;
    }

    const label = text.slice(0, 60).replace(/\n/g, " ").trim();
    const eventId = (m.id as string) ?? `ts-${m.timestamp}`;

    if (!currentLabel) {
      currentLabel = label;
      currentIds = [eventId];
      currentCount = 1;
    } else {
      currentCount++;
      if (currentIds.length < 3) {
        currentIds.push(eventId);
      }
    }
  }

  if (currentLabel && currentCount > 0) {
    clusters.push({ label: currentLabel, count: currentCount, eventIds: currentIds });
  }

  return clusters;
}

/**
 * Identify pinned events: errors, decisions, artifacts.
 */
function extractPinnedEvents(messages: AgentMessage[]): PinnedEvent[] {
  const pinned: PinnedEvent[] = [];

  for (const msg of messages) {
    const m = msg as unknown as Record<string, unknown>;
    const role = m.role as string | undefined;
    const text = extractText(m);
    if (!text) {
      continue;
    }

    const eventId = (m.id as string) ?? `ts-${m.timestamp}`;
    const snippet = text.slice(0, 100).replace(/\n/g, " ");

    // Pin errors
    if (
      role === "toolResult" &&
      (text.includes("Error") || text.includes("FAIL") || text.includes("error"))
    ) {
      pinned.push({ eventId, reason: "error", summary: snippet });
    }

    // Pin file writes/creates (artifacts)
    if (role === "assistant" && text.includes("[tool:write]")) {
      pinned.push({ eventId, reason: "artifact", summary: snippet });
    }

    // Cap at 10 pinned events
    if (pinned.length >= 10) {
      break;
    }
  }

  return pinned;
}

function extractText(m: Record<string, unknown>): string {
  const content = m.content;
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return "";
  }
  return content
    .filter(
      (b: unknown) =>
        b && typeof b === "object" && (b as unknown as Record<string, unknown>).type === "text",
    )
    .map((b: unknown) => ((b as Record<string, unknown>).text as string) ?? "")
    .join("\n");
}
