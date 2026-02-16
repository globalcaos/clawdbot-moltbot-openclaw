import { describe, expect, it } from "vitest";
import {
  createEmptyTaskState,
  decodeTaskStateFromSummary,
  encodeTaskStateInSummary,
  mergeTaskStates,
  buildTaskStateExtractionInstructions,
  type TaskState,
} from "./task-state.js";

describe("TaskState", () => {
  const sampleState: TaskState = {
    version: 1,
    objective: "Implement TRACE architecture in OpenClaw",
    plan: [
      { description: "Build event store", status: "done" },
      { description: "Build task state", status: "in-progress" },
      { description: "Pointer compaction", status: "pending" },
    ],
    decisions: ["Use node:sqlite instead of better-sqlite3", "FTS5 for full-text search"],
    artifacts: [
      { kind: "file", ref: "src/agents/trace/event-store.ts", label: "Event store module" },
      { kind: "db", ref: "~/.openclaw/agents/main/trace.db", label: "Trace index DB" },
    ],
    openQuestions: ["How to wire task state into compaction pipeline?"],
    context: { branch: "chore/sync-upstream-2026-02-08-retry" },
  };

  describe("createEmptyTaskState", () => {
    it("creates an empty task state with version 1", () => {
      const ts = createEmptyTaskState();
      expect(ts.version).toBe(1);
      expect(ts.objective).toBeNull();
      expect(ts.plan).toHaveLength(0);
      expect(ts.decisions).toHaveLength(0);
      expect(ts.artifacts).toHaveLength(0);
    });
  });

  describe("encode/decode roundtrip", () => {
    it("roundtrips a full task state through summary encoding", () => {
      const narrative = "The user has been working on implementing the TRACE architecture.";
      const encoded = encodeTaskStateInSummary(sampleState, narrative);

      expect(encoded).toContain("```task-state");
      expect(encoded).toContain(narrative);

      const { taskState, narrative: decoded } = decodeTaskStateFromSummary(encoded);
      expect(taskState).not.toBeNull();
      expect(taskState!.version).toBe(1);
      expect(taskState!.objective).toBe("Implement TRACE architecture in OpenClaw");
      expect(taskState!.plan).toHaveLength(3);
      expect(taskState!.decisions).toHaveLength(2);
      expect(taskState!.artifacts).toHaveLength(2);
      expect(decoded).toBe(narrative);
    });

    it("returns null task state for plain summaries", () => {
      const plain = "This is a plain compaction summary with no task state.";
      const { taskState, narrative } = decodeTaskStateFromSummary(plain);
      expect(taskState).toBeNull();
      expect(narrative).toBe(plain);
    });

    it("skips encoding for empty task states", () => {
      const empty = createEmptyTaskState();
      const narrative = "Some summary text.";
      const encoded = encodeTaskStateInSummary(empty, narrative);
      expect(encoded).toBe(narrative); // No task-state block
    });

    it("handles malformed JSON gracefully", () => {
      const malformed = "```task-state\n{broken json}\n```\n\nSome narrative.";
      const { taskState, narrative } = decodeTaskStateFromSummary(malformed);
      expect(taskState).toBeNull();
      expect(narrative).toBe(malformed); // Returns original
    });

    it("handles wrong version gracefully", () => {
      const wrongVersion = '```task-state\n{"version": 99}\n```\n\nSome narrative.';
      const { taskState } = decodeTaskStateFromSummary(wrongVersion);
      expect(taskState).toBeNull();
    });
  });

  describe("mergeTaskStates", () => {
    it("current objective wins", () => {
      const prev: TaskState = { ...createEmptyTaskState(), objective: "Old goal" };
      const curr: TaskState = { ...createEmptyTaskState(), objective: "New goal" };
      const merged = mergeTaskStates(prev, curr);
      expect(merged.objective).toBe("New goal");
    });

    it("falls back to previous objective if current is null", () => {
      const prev: TaskState = { ...createEmptyTaskState(), objective: "Old goal" };
      const curr = createEmptyTaskState();
      const merged = mergeTaskStates(prev, curr);
      expect(merged.objective).toBe("Old goal");
    });

    it("merges decisions with dedup", () => {
      const prev: TaskState = {
        ...createEmptyTaskState(),
        decisions: ["Decision A", "Decision B"],
      };
      const curr: TaskState = {
        ...createEmptyTaskState(),
        decisions: ["Decision B", "Decision C"],
      };
      const merged = mergeTaskStates(prev, curr);
      expect(merged.decisions).toEqual(["Decision B", "Decision C", "Decision A"]);
    });

    it("caps decisions at 15", () => {
      const prev: TaskState = {
        ...createEmptyTaskState(),
        decisions: Array.from({ length: 10 }, (_, i) => `Old ${i}`),
      };
      const curr: TaskState = {
        ...createEmptyTaskState(),
        decisions: Array.from({ length: 10 }, (_, i) => `New ${i}`),
      };
      const merged = mergeTaskStates(prev, curr);
      expect(merged.decisions.length).toBeLessThanOrEqual(15);
    });

    it("merges artifacts by ref, current wins", () => {
      const prev: TaskState = {
        ...createEmptyTaskState(),
        artifacts: [{ kind: "file", ref: "a.ts", label: "Old label" }],
      };
      const curr: TaskState = {
        ...createEmptyTaskState(),
        artifacts: [{ kind: "file", ref: "a.ts", label: "New label" }],
      };
      const merged = mergeTaskStates(prev, curr);
      expect(merged.artifacts).toHaveLength(1);
      expect(merged.artifacts[0].label).toBe("New label");
    });

    it("merges context with current winning", () => {
      const prev: TaskState = {
        ...createEmptyTaskState(),
        context: { a: "old", b: "keep" },
      };
      const curr: TaskState = {
        ...createEmptyTaskState(),
        context: { a: "new", c: "added" },
      };
      const merged = mergeTaskStates(prev, curr);
      expect(merged.context).toEqual({ a: "new", b: "keep", c: "added" });
    });
  });

  describe("buildTaskStateExtractionInstructions", () => {
    it("returns non-empty instructions", () => {
      const instructions = buildTaskStateExtractionInstructions();
      expect(instructions).toContain("task-state");
      expect(instructions).toContain("objective");
      expect(instructions).toContain("plan");
      expect(instructions).toContain("artifacts");
      expect(instructions.length).toBeGreaterThan(100);
    });
  });
});
