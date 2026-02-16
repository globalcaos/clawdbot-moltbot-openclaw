import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TraceEventStore } from "./event-store.js";
import { retrieveTraceContext } from "./retrieve.js";

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "trace-retrieve-test-"));
}

function writeJsonl(filePath: string, events: Record<string, unknown>[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, events.map((e) => JSON.stringify(e)).join("\n") + "\n");
}

describe("retrieveTraceContext", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = createTempDir();
    // Create trace.db with some indexed events
    const store = new TraceEventStore(path.join(tempDir, "trace.db"));
    const jsonlPath = path.join(tempDir, "sessions", "test-session.jsonl");

    writeJsonl(jsonlPath, [
      {
        type: "message",
        id: "m1",
        timestamp: "2026-02-15T10:00:01Z",
        message: {
          role: "user",
          content: "How do I implement a binary search tree in TypeScript?",
        },
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
              text: "A binary search tree (BST) is a data structure where each node has at most two children. The left child is always smaller than the parent, and the right child is always larger.",
            },
          ],
        },
      },
      {
        type: "message",
        id: "m3",
        timestamp: "2026-02-15T10:01:00Z",
        message: {
          role: "user",
          content: "Now implement the TRACE architecture with SQLite and FTS5 for full-text search",
        },
      },
      {
        type: "message",
        id: "m4",
        timestamp: "2026-02-15T10:02:00Z",
        message: {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "I created the TRACE event store using node:sqlite with FTS5. It indexes session JSONL events incrementally using byte-offset watermarks.",
            },
          ],
        },
      },
    ]);

    await store.indexSession("test-session", jsonlPath);
    store.close();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("retrieves relevant context for a matching prompt", () => {
    const result = retrieveTraceContext({
      prompt: "Tell me more about the binary search tree implementation",
      sessionId: "other-session", // different session so results aren't filtered
      agentDir: tempDir,
    });
    expect(result).not.toBeNull();
    expect(result).toContain("binary search tree");
  });

  it("returns null for short/trivial prompts", () => {
    const result = retrieveTraceContext({
      prompt: "hi",
      sessionId: "test-session",
      agentDir: tempDir,
    });
    expect(result).toBeNull();
  });

  it("returns null when no trace.db exists", () => {
    const emptyDir = createTempDir();
    const result = retrieveTraceContext({
      prompt: "Tell me about TRACE architecture implementation details",
      sessionId: "test",
      agentDir: emptyDir,
    });
    expect(result).toBeNull();
    fs.rmSync(emptyDir, { recursive: true, force: true });
  });

  it("caps output at MAX_RETRIEVE_CHARS", () => {
    const result = retrieveTraceContext({
      prompt: "Tell me about binary search tree and TRACE architecture with SQLite FTS5",
      sessionId: "other-session",
      agentDir: tempDir,
    });
    if (result) {
      expect(result.length).toBeLessThanOrEqual(2500); // some overhead
    }
  });

  it("retrieves TRACE-related context", () => {
    const result = retrieveTraceContext({
      prompt: "What was the TRACE architecture we discussed with SQLite?",
      sessionId: "other-session",
      agentDir: tempDir,
    });
    expect(result).not.toBeNull();
    expect(result).toContain("TRACE");
  });
});
