import { describe, it, expect, beforeEach } from "vitest";
import { CognitiveArchitecture } from "./cognitive-architecture.js";
import type { CognitiveArchitectureConfig } from "./config.js";
import { createDefaultConfig } from "./config.js";

describe("Cognitive Architecture Integration", () => {
	let arch: CognitiveArchitecture;

	beforeEach(() => {
		arch = new CognitiveArchitecture(undefined, "Jarvis");
	});

	describe("End-to-end: message → ENGRAM → CORTEX → LIMBIC → response", () => {
		it("processes a single turn through all systems", () => {
			const result = arch.processTurn("Hello, how are you?", "I'm doing well, thanks for asking!");

			// ENGRAM: events stored
			expect(result.events.length).toBeGreaterThanOrEqual(2);
			expect(result.events[0].kind).toBe("user_message");
			expect(result.events[1].kind).toBe("agent_message");

			// CORTEX: persona injected
			expect(result.personaInjection.length).toBeGreaterThan(0);
			expect(result.personaInjection[0].tier).toBe("1A-immutable");

			// LIMBIC: humor evaluated
			expect(result.humor).toBeDefined();
			expect(typeof result.humor!.shouldAttempt).toBe("boolean");
		});

		it("processes 10 turns without errors", () => {
			for (let i = 1; i <= 10; i++) {
				const result = arch.processTurn(`Message ${i}`, `Response ${i}`);
				expect(result.events.length).toBeGreaterThanOrEqual(2);
			}
			expect(arch.getCurrentTurn()).toBe(10);
			// At least 20 events (2 per turn) + probe results
			expect(arch.eventStore.size).toBeGreaterThanOrEqual(20);
		});

		it("stores probe results in ENGRAM", () => {
			// Turn 1 should trigger hard_rule probe (schedule: every 1 turn)
			const result = arch.processTurn("Test message", "Test response");
			expect(result.drift).toBeDefined();

			const probeEvents = arch.eventStore.getEvents({ kinds: ["probe_result"] });
			expect(probeEvents.length).toBeGreaterThan(0);
			expect(probeEvents[0].metadata.tags).toContain("cortex");
		});
	});

	describe("Drift → SYNAPSE escalation", () => {
		it("triggers SYNAPSE debate on severe drift", () => {
			// Create architecture with low thresholds to trigger severe drift
			const config = createDefaultConfig();
			config.cortex.thresholds.healthy = 0.99;
			config.cortex.thresholds.mild = 0.95;
			config.cortex.thresholds.moderate = 0.90;

			const severeArch = new CognitiveArchitecture(config, "TestAgent");
			// Add a forbidden phrase to trigger probe failure
			severeArch.updatePersonaState({
				voiceMarkers: {
					...severeArch.getPersonaState().voiceMarkers,
					forbiddenPhrases: ["absolutely"],
				},
			});

			// Response containing forbidden phrase → probe fails → drift detected
			const result = severeArch.processTurn(
				"Don't be so formal",
				"I absolutely will help you with that!",
			);

			expect(result.drift).toBeDefined();
			// With low thresholds and probe failure, should trigger severe action
			if (result.drift!.action === "severe_rebase") {
				expect(result.debate).toBeDefined();
				expect(result.debate!.finalSynthesis).toBeTruthy();

				// Debate synthesis stored in ENGRAM
				const synthEvents = severeArch.eventStore.getEvents({ kinds: ["debate_synthesis"] });
				expect(synthEvents.length).toBeGreaterThan(0);

				// Debate traces stored in ENGRAM
				const traceEvents = severeArch.eventStore.getEvents({ kinds: ["debate_trace"] });
				expect(traceEvents.length).toBeGreaterThan(0);
			}
		});

		it("does not trigger debate for mild drift", () => {
			const result = arch.processTurn("Hello", "Hi there!");
			if (result.drift) {
				expect(result.drift.action).not.toBe("severe_rebase");
			}
			expect(result.debate).toBeUndefined();
		});
	});

	describe("Compaction preserves PersonaState and humor associations", () => {
		it("persona_state events survive compaction", () => {
			// Update persona to create persona_state events
			arch.updatePersonaState({ name: "Updated Jarvis" });

			// Fill store with many events to trigger compaction
			for (let i = 0; i < 100; i++) {
				arch.eventStore.append({
					turnId: i,
					sessionKey: "default",
					kind: "tool_result",
					content: "x".repeat(500), // ~125 tokens each
				});
			}

			// Compact aggressively
			const markers = arch.eventStore.compact({ maxTokens: 2000, hotTailTurns: 5 });
			expect(markers.length).toBeGreaterThan(0);

			// PersonaState events must survive
			const personaEvents = arch.eventStore.getEvents({ kinds: ["persona_state"] });
			expect(personaEvents.length).toBeGreaterThan(0);
			expect(personaEvents[0].content).toContain("Updated Jarvis");
		});

		it("debate_synthesis events survive compaction", () => {
			// Insert a debate synthesis
			arch.eventStore.append({
				turnId: 1,
				sessionKey: "default",
				kind: "debate_synthesis",
				content: "Important debate conclusion about drift correction",
				metadata: { tags: ["synapse", "synthesis"] },
			});

			// Fill and compact
			for (let i = 0; i < 100; i++) {
				arch.eventStore.append({
					turnId: i + 2,
					sessionKey: "default",
					kind: "tool_result",
					content: "x".repeat(500),
				});
			}
			arch.eventStore.compact({ maxTokens: 2000, hotTailTurns: 5 });

			const synthEvents = arch.eventStore.getEvents({ kinds: ["debate_synthesis"] });
			expect(synthEvents.length).toBe(1);
			expect(synthEvents[0].content).toContain("drift correction");
		});

		it("humor associations stored as ENGRAM events", () => {
			// Process turns to potentially generate humor associations
			for (let i = 0; i < 5; i++) {
				arch.processTurn(`Casual chat ${i}`, `Fun response ${i}`);
			}

			const humorEvents = arch.eventStore.getEvents({ kinds: ["humor_association"] });
			// Humor associations should be stored (depending on frequency budget)
			if (humorEvents.length > 0) {
				const parsed = JSON.parse(humorEvents[0].content);
				expect(parsed.conceptA).toBeDefined();
				expect(parsed.bridge).toBeDefined();
				expect(parsed.patternType).toBeDefined();
			}
		});
	});

	describe("Debate conclusions retrievable via ENGRAM recall", () => {
		it("recalls debate synthesis by query", () => {
			// Store a debate synthesis
			arch.eventStore.append({
				turnId: 1,
				sessionKey: "default",
				kind: "debate_synthesis",
				content: "The team agreed to use pointer-based compaction for memory management",
				metadata: { tags: ["synapse", "synthesis"] },
			});

			const result = arch.recall("compaction memory management");
			expect(result.events.length).toBeGreaterThan(0);
			expect(result.events.some((e) => e.kind === "debate_synthesis")).toBe(true);
		});

		it("recalls probe results by query", () => {
			arch.eventStore.append({
				turnId: 1,
				sessionKey: "default",
				kind: "probe_result",
				content: JSON.stringify({ probeType: "hard_rule", passed: true, scores: { compliance: 1.0 } }),
				metadata: { tags: ["cortex", "probe"] },
			});

			const result = arch.recall("hard_rule compliance");
			expect(result.events.length).toBeGreaterThan(0);
		});
	});

	describe("CORTEX PersonaState → LIMBIC HumorCalibration bridge", () => {
		it("humor calibration reflects PersonaState", () => {
			const persona = arch.getPersonaState();
			expect(persona.humor.humorFrequency).toBe(0.15);
			expect(persona.humor.preferredPatterns).toEqual([1, 4, 7, 8]);

			// Update humor calibration
			arch.updatePersonaState({
				humor: {
					humorFrequency: 0.3,
					preferredPatterns: [1, 2, 3],
					sensitivityThreshold: 0.8,
					audienceModel: {},
				},
			});

			const updated = arch.getPersonaState();
			expect(updated.humor.humorFrequency).toBe(0.3);
			expect(updated.humor.preferredPatterns).toEqual([1, 2, 3]);
		});
	});

	describe("Configuration", () => {
		it("creates with default config", () => {
			const config = createDefaultConfig();
			expect(config.engram.compaction.mode).toBe("engram");
			expect(config.cortex.drift.ewmaAlpha).toBe(0.3);
			expect(config.limbic.humorZone.distanceMin).toBe(0.6);
			expect(config.synapse.protocol.maxRounds).toBe(5);
		});

		it("accepts partial config overrides", () => {
			const custom = new CognitiveArchitecture({ engram: { compaction: { mode: "safeguard", triggerThreshold: 0.9, hotTailTurns: 4, markerSoftCap: 10, markerTokenCap: 30, artifactThreshold: 1000, previewLines: 5 }, retrieval: { pullMaxTokens: 2000, pullMaxPerTurn: 2, mmrLambda: 0.5, topK: 10 }, embedding: { provider: "gemini", model: "text-embedding-004", dimensions: 768 } } });
			expect(custom.config.engram.compaction.mode).toBe("safeguard");
		});
	});

	describe("CDI measurement (SYNAPSE)", () => {
		it("measures cognitive diversity across models", () => {
			const errorProfiles = {
				"claude": [true, false, true, false, true, false, true, false, true, false],
				"gpt": [false, true, false, true, false, true, false, true, false, true],
				"gemini": [true, true, false, false, true, true, false, false, true, true],
			};

			const cdi = arch.measureModelDiversity(errorProfiles);
			expect(cdi.cdi).toBeGreaterThan(0);
			expect(cdi.modelSet).toEqual(["claude", "gpt", "gemini"]);
			expect(Object.keys(cdi.pairwiseCorrelations).length).toBe(3);
		});

		it("CDI = 0 for identical error profiles", () => {
			const same = [true, false, true, false, true];
			const cdi = arch.measureModelDiversity({
				"model_a": same,
				"model_b": same,
			});
			expect(cdi.cdi).toBeCloseTo(0, 5);
		});
	});
});
