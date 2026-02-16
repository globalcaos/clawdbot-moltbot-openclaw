import { describe, expect, it } from "vitest";
import {
  buildManifestFromMessages,
  decodeManifestFromSummary,
  encodeManifestInSummary,
  type PointerManifest,
} from "./pointer-manifest.js";

describe("PointerManifest", () => {
  const sampleManifest: PointerManifest = {
    version: 1,
    sessionId: "webchat~main",
    timeRange: { from: "2026-02-15T10:00:00Z", to: "2026-02-15T11:00:00Z" },
    eventsCompacted: 42,
    tokensFreed: 85000,
    topics: [
      { label: "Implement TRACE event store with SQLite", count: 5, eventIds: ["m1", "m2", "m3"] },
    ],
    pinnedEvents: [
      {
        eventId: "m7",
        reason: "error",
        summary: "Build failed: Cannot find module better-sqlite3",
      },
      {
        eventId: "m12",
        reason: "artifact",
        summary: "[tool:write] src/agents/trace/event-store.ts",
      },
    ],
  };

  describe("encode/decode roundtrip", () => {
    it("roundtrips a manifest through summary encoding", () => {
      const narrative = "The user implemented Phase 0 of TRACE.";
      const encoded = encodeManifestInSummary(sampleManifest, narrative);

      expect(encoded).toContain("```trace-manifest");
      expect(encoded).toContain(narrative);

      const { manifest, rest } = decodeManifestFromSummary(encoded);
      expect(manifest).not.toBeNull();
      expect(manifest!.sessionId).toBe("webchat~main");
      expect(manifest!.eventsCompacted).toBe(42);
      expect(manifest!.tokensFreed).toBe(85000);
      expect(manifest!.topics).toHaveLength(1);
      expect(manifest!.pinnedEvents).toHaveLength(2);
      expect(rest.trim()).toBe(narrative);
    });

    it("returns null for plain summaries", () => {
      const { manifest, rest } = decodeManifestFromSummary("Just a normal summary.");
      expect(manifest).toBeNull();
      expect(rest).toBe("Just a normal summary.");
    });

    it("handles malformed JSON", () => {
      const bad = "```trace-manifest\n{broken}\n```\n\nNarrative.";
      const { manifest } = decodeManifestFromSummary(bad);
      expect(manifest).toBeNull();
    });
  });

  describe("buildManifestFromMessages", () => {
    it("builds a manifest from message array", () => {
      const messages = [
        {
          role: "user",
          content: "Implement the TRACE event store",
          timestamp: Date.parse("2026-02-15T10:00:00Z"),
          id: "m1",
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "[tool:write] src/agents/trace/event-store.ts created" }],
          timestamp: Date.parse("2026-02-15T10:01:00Z"),
          id: "m2",
        },
        {
          role: "toolResult",
          content: [{ type: "text", text: "Error: Cannot find module better-sqlite3" }],
          timestamp: Date.parse("2026-02-15T10:02:00Z"),
          id: "m3",
        },
      ];

      const manifest = buildManifestFromMessages({
        sessionId: "test-session",
        messages: messages as any,
        tokensFreed: 5000,
      });

      expect(manifest.version).toBe(1);
      expect(manifest.sessionId).toBe("test-session");
      expect(manifest.eventsCompacted).toBe(3);
      expect(manifest.tokensFreed).toBe(5000);
      expect(manifest.timeRange.from).toContain("2026-02-15");
      expect(manifest.timeRange.to).toContain("2026-02-15");

      // Should pin the error and artifact
      expect(manifest.pinnedEvents.length).toBeGreaterThanOrEqual(1);
      const reasons = manifest.pinnedEvents.map((p) => p.reason);
      expect(reasons).toContain("error");
      expect(reasons).toContain("artifact");
    });

    it("handles empty messages", () => {
      const manifest = buildManifestFromMessages({
        sessionId: "empty",
        messages: [],
        tokensFreed: 0,
      });
      expect(manifest.eventsCompacted).toBe(0);
      expect(manifest.topics).toHaveLength(0);
      expect(manifest.pinnedEvents).toHaveLength(0);
    });
  });
});
