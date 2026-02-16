/**
 * Unified Cognitive Architecture — Integration of ENGRAM + CORTEX + LIMBIC + SYNAPSE
 *
 * This is the main entry point that initializes all 4 systems and wires them together:
 * - ENGRAM as substrate for all event storage
 * - CORTEX PersonaState feeding LIMBIC HumorCalibration
 * - CORTEX drift detection triggering SYNAPSE debate for severe drift
 * - LIMBIC humor associations stored as ENGRAM events
 * - SYNAPSE debate conclusions persisted as ENGRAM artifacts
 */

import { EventStore } from "../engram/event-store.js";
import type { MemoryEvent, TaskState } from "../engram/types.js";
import {
	createDefaultPersonaState,
	renderPersonaState,
	injectPersonaState,
	runProbe,
	createDriftState,
	computeDrift,
	getHumorCalibration,
} from "../cortex/persona-state.js";
import type { PersonaState, DriftState, DriftAssessment, ProbeResult } from "../cortex/types.js";
import {
	evaluateHumorOpportunity,
	createHumorAssociation,
	discoverBridges,
} from "../limbic/humor-engine.js";
import type { HumorAssociation, HumorEvaluation } from "../limbic/types.js";
import { runDebate, measureCDI } from "../synapse/debate-engine.js";
import type { DebateResult, DebateParticipant, DebateConfig } from "../synapse/types.js";
import { createDefaultConfig } from "./config.js";
import type { CognitiveArchitectureConfig } from "./config.js";

export interface TurnResult {
	/** Events stored this turn */
	events: MemoryEvent[];
	/** Drift assessment (if probes ran) */
	drift?: DriftAssessment;
	/** Humor evaluation */
	humor?: HumorEvaluation;
	/** Debate triggered by severe drift */
	debate?: DebateResult;
	/** PersonaState blocks injected into context */
	personaInjection: { content: string; tier: string }[];
	/** Markers created by compaction */
	compactionMarkers: number;
}

export class CognitiveArchitecture {
	readonly eventStore: EventStore;
	readonly config: CognitiveArchitectureConfig;
	private personaState: PersonaState;
	private driftState: DriftState;
	private turnNumber = 0;
	private humorAttempts = 0;
	private probeResults: ProbeResult[] = [];
	private humorAssociations: HumorAssociation[] = [];

	constructor(config?: Partial<CognitiveArchitectureConfig>, personaName?: string) {
		this.config = { ...createDefaultConfig(), ...config };
		this.eventStore = new EventStore();
		this.personaState = createDefaultPersonaState(personaName ?? "Agent");
		this.driftState = createDriftState();
	}

	/** Get current PersonaState */
	getPersonaState(): PersonaState {
		return this.personaState;
	}

	/** Update PersonaState */
	updatePersonaState(update: Partial<PersonaState>): void {
		this.personaState = { ...this.personaState, ...update, version: this.personaState.version + 1, lastUpdated: new Date().toISOString() };
		// Persist to ENGRAM
		this.eventStore.append({
			turnId: this.turnNumber,
			sessionKey: "default",
			kind: "persona_state",
			content: JSON.stringify(this.personaState),
			metadata: { tags: ["persona", "cortex"] },
		});
	}

	/** Process a full turn through the cognitive architecture */
	processTurn(
		userMessage: string,
		agentResponse: string,
		sessionKey = "default",
	): TurnResult {
		this.turnNumber++;
		const events: MemoryEvent[] = [];
		const result: TurnResult = {
			events: [],
			personaInjection: [],
			compactionMarkers: 0,
		};

		// 1. ENGRAM: Store user message
		events.push(
			this.eventStore.append({
				turnId: this.turnNumber,
				sessionKey,
				kind: "user_message",
				content: userMessage,
			}),
		);

		// 2. CORTEX: Inject PersonaState into context
		const maxPersonaTokens = Math.floor(200000 * this.config.cortex.persona.maxBudgetFraction);
		result.personaInjection = injectPersonaState(this.personaState, maxPersonaTokens);

		// 3. ENGRAM: Store agent response
		events.push(
			this.eventStore.append({
				turnId: this.turnNumber,
				sessionKey,
				kind: "agent_message",
				content: agentResponse,
			}),
		);

		// 4. CORTEX: Run probes (async in production, synchronous here)
		const { drift } = this.config.cortex;
		const probeSchedule = drift.probeSchedule;
		const turnProbes: ProbeResult[] = [];

		if (this.turnNumber % probeSchedule.hardRule === 0) {
			turnProbes.push(runProbe("hard_rule", agentResponse, this.personaState, this.turnNumber));
		}
		if (this.turnNumber % probeSchedule.style === 0) {
			turnProbes.push(runProbe("style", agentResponse, this.personaState, this.turnNumber));
		}
		if (this.turnNumber % probeSchedule.fullAudit === 0) {
			turnProbes.push(runProbe("full_audit", agentResponse, this.personaState, this.turnNumber));
		}

		// Store probe results in ENGRAM
		for (const probe of turnProbes) {
			this.eventStore.append({
				turnId: this.turnNumber,
				sessionKey,
				kind: "probe_result",
				content: JSON.stringify(probe),
				metadata: { tags: ["cortex", "probe", probe.probeType] },
			});
			this.probeResults.push(probe);
		}

		// 5. CORTEX: Compute drift
		if (turnProbes.length > 0) {
			const driftAssessment = computeDrift(
				userMessage,
				turnProbes,
				this.driftState,
				{
					ewmaAlpha: drift.ewmaAlpha,
					baseWeightUser: drift.baseWeightUser,
					baseWeightProbe: drift.baseWeightProbe,
					sparsityThreshold: drift.sparsityThreshold,
					maxProbeBoost: drift.maxProbeBoost,
					healthyThreshold: this.config.cortex.thresholds.healthy,
					mildThreshold: this.config.cortex.thresholds.mild,
					moderateThreshold: this.config.cortex.thresholds.moderate,
				},
			);
			result.drift = driftAssessment;

			// 6. CORTEX → SYNAPSE: Trigger debate for severe drift
			if (driftAssessment.triggerSynapseDebate) {
				const debateResult = this.triggerDriftDebate(userMessage, sessionKey);
				result.debate = debateResult;
			}
		}

		// 7. LIMBIC: Evaluate humor opportunity
		const humorCalibration = getHumorCalibration(this.personaState);
		const humorEval = evaluateHumorOpportunity(
			userMessage,
			humorCalibration,
			this.humorAttempts,
			this.turnNumber,
		);
		result.humor = humorEval;

		if (humorEval.shouldAttempt) {
			this.humorAttempts++;
			// Discover bridges and store as ENGRAM events
			const bridges = discoverBridges("topic_a", "topic_b", humorCalibration.preferredPatterns);
			for (const bridge of bridges) {
				const association = createHumorAssociation(bridge, "default_audience", ["conversation"]);
				this.humorAssociations.push(association);
				this.eventStore.append({
					turnId: this.turnNumber,
					sessionKey,
					kind: "humor_association",
					content: JSON.stringify(association),
					metadata: { tags: ["limbic", "humor", `pattern_${bridge.patternType}`] },
				});
			}
		}

		// 8. ENGRAM: Compaction if needed
		const maxTokens = Math.floor(200000 * this.config.engram.compaction.triggerThreshold);
		if (this.eventStore.totalTokens() > maxTokens) {
			const markers = this.eventStore.compact({
				maxTokens,
				hotTailTurns: this.config.engram.compaction.hotTailTurns,
			});
			result.compactionMarkers = markers.length;
		}

		result.events = events;
		return result;
	}

	/** Trigger a SYNAPSE debate for drift correction */
	private triggerDriftDebate(context: string, sessionKey: string): DebateResult {
		const participants: DebateParticipant[] = [
			{ modelId: "claude-opus", role: "architect" },
			{ modelId: "gpt-o3", role: "critic" },
			{ modelId: "gemini-pro", role: "pragmatist" },
		];

		const debateConfig: DebateConfig = {
			maxRounds: this.config.synapse.protocol.maxRounds,
			convergenceThreshold: this.config.synapse.protocol.convergenceThreshold,
			convergenceLambda: this.config.synapse.protocol.convergenceLambda,
			ratificationThreshold: this.config.synapse.protocol.ratificationThreshold,
			maxBudgetUSD: this.config.synapse.cost.maxBudgetPerDebate,
		};

		const debateResult = runDebate(
			`Drift correction strategy for: ${context.slice(0, 200)}`,
			participants,
			debateConfig,
		);

		// Store debate traces as ENGRAM events (marked for eager eviction)
		for (const round of debateResult.rounds) {
			this.eventStore.append({
				turnId: this.turnNumber,
				sessionKey,
				kind: "debate_trace",
				content: JSON.stringify(round),
				metadata: { tags: ["synapse", "debate", "trace"] },
			});
		}

		// Store final synthesis as durable artifact
		this.eventStore.append({
			turnId: this.turnNumber,
			sessionKey,
			kind: "debate_synthesis",
			content: debateResult.finalSynthesis,
			metadata: { tags: ["synapse", "debate", "synthesis"] },
		});

		return debateResult;
	}

	/** Recall events from ENGRAM */
	recall(query: string | string[], taskState?: TaskState) {
		return this.eventStore.recall({ query }, undefined, taskState);
	}

	/** Get all humor associations */
	getHumorAssociations(): HumorAssociation[] {
		return [...this.humorAssociations];
	}

	/** Get drift history */
	getDriftHistory() {
		return this.driftState.history;
	}

	/** Get current turn number */
	getCurrentTurn(): number {
		return this.turnNumber;
	}

	/** Measure CDI across models */
	measureModelDiversity(errorProfiles: Record<string, boolean[]>) {
		return measureCDI(errorProfiles);
	}
}
