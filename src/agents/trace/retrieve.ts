/**
 * TRACE Per-turn Retrieval — Phase 3
 *
 * Before each agent turn, search the event store for context relevant to the
 * current user prompt. Inject matching events as a system-level context block
 * so the agent has access to compacted-away information.
 *
 * Design principles:
 * - Lightweight: no LLM call, just FTS5 search
 * - Budget-capped: max 2000 chars of retrieved context per turn
 * - Skip trivial prompts: short greetings, heartbeats, etc.
 * - Only activates after compaction (when trace.db has indexed events)
 */

import fs from "node:fs";
import path from "node:path";
import { createTraceStore, type TraceSearchResult } from "./event-store.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Max chars of retrieved context to inject */
const MAX_RETRIEVE_CHARS = 2000;
/** Minimum prompt length to trigger retrieval (skip "hi", "ok", etc.) */
const MIN_PROMPT_LENGTH = 20;
/** Max search results to consider */
const MAX_SEARCH_RESULTS = 5;

// ---------------------------------------------------------------------------
// Main retrieval function
// ---------------------------------------------------------------------------

export function retrieveTraceContext(params: {
  prompt: string;
  sessionId: string;
  agentDir: string;
}): string | null {
  const { prompt, sessionId, agentDir } = params;

  // Skip trivial prompts
  if (prompt.length < MIN_PROMPT_LENGTH) {
    return null;
  }

  // Check if trace.db exists
  const dbPath = path.join(agentDir, "trace.db");
  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const store = createTraceStore(agentDir);
  try {
    const stats = store.getStats();
    if (stats.totalEvents === 0) {
      return null;
    }

    // Build search query from prompt keywords
    const query = buildSearchQuery(prompt);
    if (!query) {
      return null;
    }

    // Search across all sessions (not just current — knowledge transfers)
    const results = store.search({
      query,
      limit: MAX_SEARCH_RESULTS,
    });

    if (results.length === 0) {
      return null;
    }

    // Filter out events from the current session's recent context
    // (they're already in the conversation — no need to duplicate)
    const recent = store.getRecent(sessionId, 20);
    const recentIds = new Set(recent.map((r) => r.event_id));
    const filtered = results.filter((r) => !recentIds.has(r.event_id));

    if (filtered.length === 0) {
      return null;
    }

    // Format retrieved context
    return formatRetrievedContext(filtered, MAX_RETRIEVE_CHARS);
  } finally {
    store.close();
  }
}

// ---------------------------------------------------------------------------
// Query building
// ---------------------------------------------------------------------------

/**
 * Extract meaningful keywords from the prompt for FTS5 search.
 * Drops common stop words and very short tokens.
 */
function buildSearchQuery(prompt: string): string | null {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "shall",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "as",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "about",
    "it",
    "its",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "our",
    "their",
    "what",
    "which",
    "who",
    "whom",
    "when",
    "where",
    "why",
    "how",
    "not",
    "no",
    "nor",
    "but",
    "or",
    "and",
    "if",
    "then",
    "else",
    "so",
    "just",
    "also",
    "very",
    "really",
    "now",
    "here",
    "there",
    "all",
    "any",
    "each",
    "every",
    "both",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "than",
    "too",
    "only",
    "same",
    "own",
    "keep",
    "going",
    "let",
    "make",
    "please",
    "tell",
    "show",
    "give",
  ]);

  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  // Deduplicate and take top 8 keywords
  const unique = [...new Set(words)].slice(0, 8);
  if (unique.length === 0) {
    return null;
  }

  // FTS5 OR query for broader matches
  return unique.join(" OR ");
}

// ---------------------------------------------------------------------------
// Context formatting
// ---------------------------------------------------------------------------

function formatRetrievedContext(results: TraceSearchResult[], maxChars: number): string {
  const lines: string[] = ["[Retrieved from session history]"];
  let chars = lines[0].length;

  for (const r of results) {
    const role = r.role ?? r.event_type;
    const text = r.text_content.slice(0, 400); // Cap individual results
    const line = `- [${role}] ${text}`;

    if (chars + line.length > maxChars) {
      break;
    }
    lines.push(line);
    chars += line.length;
  }

  if (lines.length <= 1) {
    return null as unknown as string;
  }
  return lines.join("\n");
}
