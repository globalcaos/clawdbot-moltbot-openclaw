import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TraceEventStore } from "./event-store.js";

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "trace-test-"));
}

function writeJsonl(filePath: string, events: Record<string, unknown>[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, events.map((e) => JSON.stringify(e)).join("\n") + "\n");
}

describe("TraceEventStore", () => {
  let tempDir: string;
  let store: TraceEventStore;

  beforeEach(() => {
    tempDir = createTempDir();
    store = new TraceEventStore(path.join(tempDir, "trace.db"));
  });

  afterEach(() => {
    store.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("indexSession", () => {
    it("indexes user and assistant messages", async () => {
      const sessionId = "test-session-1";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      writeJsonl(jsonlPath, [
        {
          type: "session",
          version: 3,
          id: sessionId,
          timestamp: "2026-02-15T10:00:00Z",
        },
        {
          type: "message",
          id: "msg-1",
          timestamp: "2026-02-15T10:00:01Z",
          message: {
            role: "user",
            content: "How do I implement a binary search tree?",
          },
        },
        {
          type: "message",
          id: "msg-2",
          timestamp: "2026-02-15T10:00:10Z",
          message: {
            role: "assistant",
            content: [
              {
                type: "text",
                text: "A binary search tree is a data structure where each node has at most two children.",
              },
            ],
          },
        },
      ]);

      const indexed = await store.indexSession(sessionId, jsonlPath);
      expect(indexed).toBe(2); // session header is skipped

      const stats = store.getStats();
      expect(stats.totalEvents).toBe(2);
      expect(stats.sessions).toBe(1);
    });

    it("skips empty assistant messages (tool-call only)", async () => {
      const sessionId = "test-session-2";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      writeJsonl(jsonlPath, [
        {
          type: "message",
          id: "msg-1",
          timestamp: "2026-02-15T10:00:01Z",
          message: {
            role: "assistant",
            content: [
              { type: "toolCall", id: "tc-1", name: "read", arguments: { path: "/tmp/test.txt" } },
            ],
          },
        },
      ]);

      // Tool calls DO get indexed (we extract tool name + args)
      const indexed = await store.indexSession(sessionId, jsonlPath);
      expect(indexed).toBe(1);
    });

    it("indexes incrementally using watermarks", async () => {
      const sessionId = "test-session-3";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      // First batch
      writeJsonl(jsonlPath, [
        {
          type: "message",
          id: "msg-1",
          timestamp: "2026-02-15T10:00:01Z",
          message: { role: "user", content: "Hello world" },
        },
      ]);

      const first = await store.indexSession(sessionId, jsonlPath);
      expect(first).toBe(1);

      // Append more events
      fs.appendFileSync(
        jsonlPath,
        JSON.stringify({
          type: "message",
          id: "msg-2",
          timestamp: "2026-02-15T10:00:10Z",
          message: { role: "user", content: "Tell me about TRACE architecture" },
        }) + "\n",
      );

      const second = await store.indexSession(sessionId, jsonlPath);
      expect(second).toBe(1); // Only the new event

      expect(store.getStats().totalEvents).toBe(2);
    });

    it("indexes tool results with tool name", async () => {
      const sessionId = "test-session-4";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      writeJsonl(jsonlPath, [
        {
          type: "message",
          id: "msg-1",
          timestamp: "2026-02-15T10:00:01Z",
          message: {
            role: "toolResult",
            toolName: "exec",
            toolCallId: "tc-1",
            content: [{ type: "text", text: "Command output: success" }],
          },
        },
      ]);

      const indexed = await store.indexSession(sessionId, jsonlPath);
      expect(indexed).toBe(1);

      const results = store.search({ query: "success" });
      expect(results).toHaveLength(1);
      expect(results[0].tool_name).toBe("exec");
    });

    it("indexes compaction summaries", async () => {
      const sessionId = "test-session-5";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      writeJsonl(jsonlPath, [
        {
          type: "compaction",
          id: "cmp-1",
          timestamp: "2026-02-15T10:00:01Z",
          summary: "User discussed implementing TRACE architecture for memory management",
          tokensBefore: 150000,
        },
      ]);

      const indexed = await store.indexSession(sessionId, jsonlPath);
      expect(indexed).toBe(1);

      const results = store.search({ query: "TRACE architecture" });
      expect(results).toHaveLength(1);
      expect(results[0].event_type).toBe("compaction");
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      const sessionId = "search-test";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      writeJsonl(jsonlPath, [
        {
          type: "message",
          id: "m1",
          timestamp: "2026-02-15T10:00:01Z",
          message: { role: "user", content: "Implement the TRACE event store with SQLite" },
        },
        {
          type: "message",
          id: "m2",
          timestamp: "2026-02-15T10:00:10Z",
          message: {
            role: "assistant",
            content: [
              {
                type: "text",
                text: "I will create a SQLite database with FTS5 for full-text search",
              },
            ],
          },
        },
        {
          type: "message",
          id: "m3",
          timestamp: "2026-02-15T10:01:00Z",
          message: { role: "user", content: "Now implement the compaction pointer system" },
        },
        {
          type: "message",
          id: "m4",
          timestamp: "2026-02-15T10:02:00Z",
          message: {
            role: "toolResult",
            toolName: "exec",
            toolCallId: "tc-1",
            content: [{ type: "text", text: "pnpm test passed with 42 tests" }],
          },
        },
      ]);

      await store.indexSession(sessionId, jsonlPath);
    });

    it("finds events by keyword", () => {
      const results = store.search({ query: "SQLite" });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].text_content).toContain("SQLite");
    });

    it("filters by session", () => {
      const results = store.search({ query: "SQLite", sessionId: "nonexistent" });
      expect(results).toHaveLength(0);
    });

    it("filters by role", () => {
      const results = store.search({ query: "TRACE OR compaction OR SQLite", roles: ["user"] });
      for (const r of results) {
        expect(r.role).toBe("user");
      }
    });

    it("filters by event type", () => {
      const results = store.search({ query: "pnpm OR test OR passed", eventTypes: ["message"] });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("filters by timestamp range", () => {
      const results = store.search({
        query: "TRACE OR compaction OR SQLite OR implement",
        after: "2026-02-15T10:00:30Z",
      });
      // Only events after 10:00:30 should match
      for (const r of results) {
        expect(r.timestamp > "2026-02-15T10:00:30Z").toBe(true);
      }
    });

    it("respects limit", () => {
      const results = store.search({
        query: "TRACE OR SQLite OR compaction OR implement OR test",
        limit: 2,
      });
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe("getRecent", () => {
    it("returns events in reverse chronological order", async () => {
      const sessionId = "recent-test";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      writeJsonl(jsonlPath, [
        {
          type: "message",
          id: "m1",
          timestamp: "2026-02-15T10:00:01Z",
          message: { role: "user", content: "First message" },
        },
        {
          type: "message",
          id: "m2",
          timestamp: "2026-02-15T10:00:10Z",
          message: { role: "user", content: "Second message" },
        },
        {
          type: "message",
          id: "m3",
          timestamp: "2026-02-15T10:00:20Z",
          message: { role: "user", content: "Third message" },
        },
      ]);

      await store.indexSession(sessionId, jsonlPath);

      const recent = store.getRecent(sessionId, 2);
      expect(recent).toHaveLength(2);
      expect(recent[0].text_content).toBe("Third message");
      expect(recent[1].text_content).toBe("Second message");
    });
  });

  describe("getContext", () => {
    it("returns events around a timestamp", async () => {
      const sessionId = "context-test";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      writeJsonl(jsonlPath, [
        {
          type: "message",
          id: "m1",
          timestamp: "2026-02-15T10:00:00Z",
          message: { role: "user", content: "Message A" },
        },
        {
          type: "message",
          id: "m2",
          timestamp: "2026-02-15T10:05:00Z",
          message: { role: "user", content: "Message B" },
        },
        {
          type: "message",
          id: "m3",
          timestamp: "2026-02-15T10:10:00Z",
          message: { role: "user", content: "Message C" },
        },
        {
          type: "message",
          id: "m4",
          timestamp: "2026-02-15T10:15:00Z",
          message: { role: "user", content: "Message D" },
        },
      ]);

      await store.indexSession(sessionId, jsonlPath);

      const context = store.getContext(sessionId, "2026-02-15T10:05:00Z", 4);
      expect(context.length).toBeGreaterThanOrEqual(2);
      // Should include events around 10:05
      const texts = context.map((c) => c.text_content);
      expect(texts).toContain("Message B");
    });
  });

  describe("stats", () => {
    it("reports correct stats", async () => {
      const sessionId = "stats-test";
      const jsonlPath = path.join(tempDir, "sessions", `${sessionId}.jsonl`);

      writeJsonl(jsonlPath, [
        {
          type: "message",
          id: "m1",
          timestamp: "2026-02-15T10:00:01Z",
          message: { role: "user", content: "Hello" },
        },
      ]);

      await store.indexSession(sessionId, jsonlPath);

      const stats = store.getStats();
      expect(stats.totalEvents).toBe(1);
      expect(stats.sessions).toBe(1);
      expect(stats.dbSizeBytes).toBeGreaterThan(0);
    });
  });
});
