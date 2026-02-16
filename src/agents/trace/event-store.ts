/**
 * TRACE Event Store — Phase 0
 *
 * Indexes session JSONL events into a SQLite database with FTS5 for full-text search.
 * The session JSONL files are the immutable source of truth (append-only event log).
 * This module creates a queryable index over those events so that after compaction,
 * the agent can retrieve relevant context from the full session history.
 *
 * Design:
 * - One DB per agent (e.g. ~/.openclaw/agents/main/trace.db)
 * - Events table stores event metadata + extracted text
 * - FTS5 virtual table enables full-text search across all indexed events
 * - Watermark tracking per session to support incremental indexing
 */

import type { DatabaseSync, StatementSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { requireNodeSqlite } from "../../memory/sqlite.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TraceEvent {
  /** Unique event id from the session JSONL */
  eventId: string;
  /** Session id (the JSONL filename stem) */
  sessionId: string;
  /** Event type: message, compaction, custom, etc. */
  eventType: string;
  /** Message role if applicable: user, assistant, toolResult */
  role: string | null;
  /** Tool name if applicable */
  toolName: string | null;
  /** Extracted searchable text content */
  textContent: string;
  /** ISO timestamp */
  timestamp: string;
  /** Byte offset in the JSONL file (for seeking back) */
  byteOffset: number;
}

export interface TraceSearchResult {
  event_id: string;
  session_id: string;
  event_type: string;
  role: string | null;
  tool_name: string | null;
  text_content: string;
  timestamp: string;
  rank?: number;
}

export interface TraceSearchOptions {
  /** FTS5 query string */
  query: string;
  /** Filter to specific session */
  sessionId?: string;
  /** Filter to specific event types */
  eventTypes?: string[];
  /** Filter to specific roles */
  roles?: string[];
  /** Maximum results */
  limit?: number;
  /** Only events after this timestamp */
  after?: string;
  /** Only events before this timestamp */
  before?: string;
}

// ---------------------------------------------------------------------------
// Event extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract searchable text from a JSONL event line.
 * Returns null if the event has no meaningful text to index.
 */
function extractEventData(
  parsed: Record<string, unknown>,
): { eventType: string; role: string | null; toolName: string | null; text: string } | null {
  const type = parsed.type as string | undefined;
  if (!type) {
    return null;
  }

  switch (type) {
    case "message": {
      const msg = parsed.message as Record<string, unknown> | undefined;
      if (!msg) {
        return null;
      }
      const role = (msg.role as string) ?? null;
      const content = msg.content;
      const text = extractTextFromContent(content);
      if (!text) {
        return null;
      }
      const toolName = (msg.toolName as string) ?? null;
      return { eventType: "message", role, toolName, text };
    }
    case "compaction": {
      const summary = parsed.summary as string | undefined;
      return summary
        ? { eventType: "compaction", role: null, toolName: null, text: summary }
        : null;
    }
    case "custom_message": {
      const customType = parsed.customType as string | undefined;
      const content = parsed.content;
      const text = extractTextFromContent(content);
      return text
        ? {
            eventType: `custom_message:${customType ?? "unknown"}`,
            role: null,
            toolName: null,
            text,
          }
        : null;
    }
    case "branch_summary": {
      const summary = parsed.summary as string | undefined;
      return summary
        ? { eventType: "branch_summary", role: null, toolName: null, text: summary }
        : null;
    }
    default:
      return null;
  }
}

/**
 * Extract text from message content (string or content blocks array).
 */
function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return "";
  }

  const parts: string[] = [];
  for (const block of content) {
    if (!block || typeof block !== "object") {
      continue;
    }
    const b = block as Record<string, unknown>;
    if (b.type === "text" && typeof b.text === "string") {
      parts.push(b.text);
    } else if (b.type === "toolCall") {
      const name = b.name as string | undefined;
      const args = b.arguments as Record<string, unknown> | undefined;
      if (name) {
        const argStr = args ? JSON.stringify(args).slice(0, 500) : "";
        parts.push(`[tool:${name}] ${argStr}`);
      }
    } else if (b.type === "thinking" && typeof b.thinking === "string") {
      parts.push(b.thinking);
    }
  }
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Database management
// ---------------------------------------------------------------------------

function initDb(db: DatabaseSync): { ftsAvailable: boolean } {
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA synchronous = NORMAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS trace_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trace_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      role TEXT,
      tool_name TEXT,
      text_content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      byte_offset INTEGER NOT NULL,
      UNIQUE(session_id, event_id)
    );
    CREATE INDEX IF NOT EXISTS idx_trace_session ON trace_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_trace_timestamp ON trace_events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_trace_type ON trace_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_trace_role ON trace_events(role);
  `);

  // Try to create FTS5 table — may fail if FTS5 extension is not available
  let ftsAvailable = false;
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS trace_fts USING fts5(
        text_content,
        content=trace_events,
        content_rowid=id,
        tokenize='porter unicode61'
      );
      CREATE TRIGGER IF NOT EXISTS trace_ai AFTER INSERT ON trace_events BEGIN
        INSERT INTO trace_fts(rowid, text_content) VALUES (new.id, new.text_content);
      END;
      CREATE TRIGGER IF NOT EXISTS trace_ad AFTER DELETE ON trace_events BEGIN
        INSERT INTO trace_fts(trace_fts, rowid, text_content) VALUES('delete', old.id, old.text_content);
      END;
    `);
    ftsAvailable = true;
  } catch {
    // FTS5 not available — fall back to LIKE queries
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS trace_compaction_manifests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      manifest_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_trace_manifest_session ON trace_compaction_manifests(session_id);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS trace_watermarks (
      session_id TEXT PRIMARY KEY,
      byte_offset INTEGER NOT NULL DEFAULT 0,
      event_count INTEGER NOT NULL DEFAULT 0,
      last_indexed TEXT NOT NULL
    );
  `);

  return { ftsAvailable };
}

// ---------------------------------------------------------------------------
// TraceEventStore class
// ---------------------------------------------------------------------------

export class TraceEventStore {
  private db: DatabaseSync;
  private dbPath: string;
  private ftsAvailable: boolean;
  private insertStmt: StatementSync;
  private upsertWatermarkStmt: StatementSync;
  private getWatermarkStmt: StatementSync;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const { DatabaseSync: SqliteDb } = requireNodeSqlite();
    this.dbPath = dbPath;
    this.db = new SqliteDb(dbPath);
    const { ftsAvailable } = initDb(this.db);
    this.ftsAvailable = ftsAvailable;

    this.insertStmt = this.db.prepare(`
      INSERT OR IGNORE INTO trace_events
        (event_id, session_id, event_type, role, tool_name, text_content, timestamp, byte_offset)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.upsertWatermarkStmt = this.db.prepare(`
      INSERT INTO trace_watermarks (session_id, byte_offset, event_count, last_indexed)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        byte_offset = excluded.byte_offset,
        event_count = excluded.event_count,
        last_indexed = excluded.last_indexed
    `);

    this.getWatermarkStmt = this.db.prepare(
      "SELECT byte_offset, event_count FROM trace_watermarks WHERE session_id = ?",
    );
  }

  /**
   * Index a session JSONL file incrementally.
   * Only reads events after the last watermark position.
   * Returns the number of new events indexed.
   */
  async indexSession(sessionId: string, jsonlPath: string): Promise<number> {
    if (!fs.existsSync(jsonlPath)) {
      return 0;
    }

    const watermark = this.getWatermarkStmt.get(sessionId) as
      | { byte_offset: number; event_count: number }
      | undefined;
    const startOffset = watermark?.byte_offset ?? 0;
    let currentOffset = 0;
    let indexed = 0;
    let totalEvents = watermark?.event_count ?? 0;

    const fileStream = fs.createReadStream(jsonlPath, {
      start: startOffset,
      encoding: "utf-8",
    });

    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const events: TraceEvent[] = [];

    for await (const line of rl) {
      const lineBytes = Buffer.byteLength(line, "utf-8") + 1; // +1 for newline
      const absoluteOffset = startOffset + currentOffset;
      currentOffset += lineBytes;

      if (!line.trim()) {
        continue;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(line);
      } catch {
        continue;
      }

      const eventId = (parsed.id as string) ?? `line-${absoluteOffset}`;
      const timestamp = (parsed.timestamp as string) ?? new Date().toISOString();

      const extracted = extractEventData(parsed);
      if (!extracted) {
        continue;
      }

      events.push({
        eventId,
        sessionId,
        eventType: extracted.eventType,
        role: extracted.role,
        toolName: extracted.toolName,
        textContent: extracted.text,
        timestamp,
        byteOffset: absoluteOffset,
      });
      indexed++;
      totalEvents++;
    }

    // Batch insert all events
    for (const evt of events) {
      this.insertStmt.run(
        evt.eventId,
        evt.sessionId,
        evt.eventType,
        evt.role,
        evt.toolName,
        evt.textContent,
        evt.timestamp,
        evt.byteOffset,
      );
    }

    // Update watermark
    const finalOffset = startOffset + currentOffset;
    this.upsertWatermarkStmt.run(sessionId, finalOffset, totalEvents, new Date().toISOString());

    return indexed;
  }

  /**
   * Full-text search across indexed events.
   */
  search(options: TraceSearchOptions): TraceSearchResult[] {
    if (this.ftsAvailable) {
      return this.searchFts(options);
    }
    return this.searchLike(options);
  }

  private searchFts(options: TraceSearchOptions): TraceSearchResult[] {
    const conditions: string[] = ["trace_fts.trace_fts MATCH ?"];
    const params: (string | number | null)[] = [options.query];

    this.addFilters(conditions, params, options);

    const limit = options.limit ?? 20;

    const sql = `
      SELECT e.event_id, e.session_id, e.event_type, e.role, e.tool_name,
             e.text_content, e.timestamp, rank
      FROM trace_fts
      JOIN trace_events e ON e.id = trace_fts.rowid
      WHERE ${conditions.join(" AND ")}
      ORDER BY rank
      LIMIT ${limit}
    `;

    return this.db.prepare(sql).all(...params) as unknown as TraceSearchResult[];
  }

  private searchLike(options: TraceSearchOptions): TraceSearchResult[] {
    const conditions: string[] = ["e.text_content LIKE ?"];
    const params: (string | number | null)[] = [`%${options.query}%`];

    this.addFilters(conditions, params, options);

    const limit = options.limit ?? 20;

    const sql = `
      SELECT e.event_id, e.session_id, e.event_type, e.role, e.tool_name,
             e.text_content, e.timestamp
      FROM trace_events e
      WHERE ${conditions.join(" AND ")}
      ORDER BY e.timestamp DESC
      LIMIT ${limit}
    `;

    return this.db.prepare(sql).all(...params) as unknown as TraceSearchResult[];
  }

  private addFilters(
    conditions: string[],
    params: (string | number | null)[],
    options: TraceSearchOptions,
  ): void {
    if (options.sessionId) {
      conditions.push("e.session_id = ?");
      params.push(options.sessionId);
    }
    if (options.eventTypes?.length) {
      conditions.push(`e.event_type IN (${options.eventTypes.map(() => "?").join(",")})`);
      params.push(...options.eventTypes);
    }
    if (options.roles?.length) {
      conditions.push(`e.role IN (${options.roles.map(() => "?").join(",")})`);
      params.push(...options.roles);
    }
    if (options.after) {
      conditions.push("e.timestamp > ?");
      params.push(options.after);
    }
    if (options.before) {
      conditions.push("e.timestamp < ?");
      params.push(options.before);
    }
  }

  /**
   * Get recent events from a session (most recent first).
   */
  getRecent(sessionId: string, limit = 50): TraceSearchResult[] {
    return this.db
      .prepare(
        `SELECT event_id, session_id, event_type, role, tool_name, text_content, timestamp
         FROM trace_events
         WHERE session_id = ?
         ORDER BY timestamp DESC
         LIMIT ?`,
      )
      .all(sessionId, limit) as unknown as TraceSearchResult[];
  }

  /**
   * Get events around a specific timestamp (context window).
   */
  getContext(sessionId: string, aroundTimestamp: string, windowSize = 10): TraceSearchResult[] {
    const before = this.db
      .prepare(
        `SELECT event_id, session_id, event_type, role, tool_name, text_content, timestamp
         FROM trace_events
         WHERE session_id = ? AND timestamp <= ?
         ORDER BY timestamp DESC
         LIMIT ?`,
      )
      .all(sessionId, aroundTimestamp, Math.ceil(windowSize / 2)) as unknown as TraceSearchResult[];

    const after = this.db
      .prepare(
        `SELECT event_id, session_id, event_type, role, tool_name, text_content, timestamp
         FROM trace_events
         WHERE session_id = ? AND timestamp > ?
         ORDER BY timestamp ASC
         LIMIT ?`,
      )
      .all(
        sessionId,
        aroundTimestamp,
        Math.floor(windowSize / 2),
      ) as unknown as TraceSearchResult[];

    return [...before.toReversed(), ...after];
  }

  /**
   * Get indexing stats.
   */
  getStats(): { totalEvents: number; sessions: number; dbSizeBytes: number } {
    const totalEvents = (
      this.db.prepare("SELECT COUNT(*) as count FROM trace_events").get() as { count: number }
    ).count;
    const sessions = (
      this.db.prepare("SELECT COUNT(DISTINCT session_id) as count FROM trace_events").get() as {
        count: number;
      }
    ).count;

    let dbSizeBytes = 0;
    try {
      dbSizeBytes = fs.statSync(this.dbPath).size;
    } catch {
      // ignore
    }

    return { totalEvents, sessions, dbSizeBytes };
  }

  /**
   * Store a compaction manifest for later retrieval by Phase 3.
   */
  storeManifest(sessionId: string, manifestJson: string): void {
    this.db
      .prepare(
        "INSERT INTO trace_compaction_manifests (session_id, created_at, manifest_json) VALUES (?, ?, ?)",
      )
      .run(sessionId, new Date().toISOString(), manifestJson);
  }

  /**
   * Get all compaction manifests for a session, newest first.
   */
  getManifests(
    sessionId: string,
    limit = 10,
  ): Array<{ id: number; created_at: string; manifest_json: string }> {
    return this.db
      .prepare(
        "SELECT id, created_at, manifest_json FROM trace_compaction_manifests WHERE session_id = ? ORDER BY id DESC LIMIT ?",
      )
      .all(sessionId, limit) as unknown as Array<{
      id: number;
      created_at: string;
      manifest_json: string;
    }>;
  }

  get hasFts(): boolean {
    return this.ftsAvailable;
  }

  close(): void {
    this.db.close();
  }
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

export function createTraceStore(agentDir: string): TraceEventStore {
  const dbPath = path.join(agentDir, "trace.db");
  return new TraceEventStore(dbPath);
}

export async function indexAllSessions(
  agentDir: string,
): Promise<{ indexed: number; sessions: number }> {
  const store = createTraceStore(agentDir);
  const sessionsDir = path.join(agentDir, "sessions");

  if (!fs.existsSync(sessionsDir)) {
    store.close();
    return { indexed: 0, sessions: 0 };
  }

  const files = fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".jsonl"));
  let totalIndexed = 0;

  for (const file of files) {
    const sessionId = file.replace(".jsonl", "");
    const filePath = path.join(sessionsDir, file);
    const indexed = await store.indexSession(sessionId, filePath);
    totalIndexed += indexed;
  }

  store.close();
  return { indexed: totalIndexed, sessions: files.length };
}
