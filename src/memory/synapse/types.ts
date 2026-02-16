/**
 * SYNAPSE — Structured Yield of Negotiated Agreements through Parallel Synthesis Engines
 * Multi-model debate protocol, CDI measurement, and persistent deliberation.
 */

export interface CDIMeasurement {
	modelSet: string[];
	errorProfiles: Record<string, boolean[]>;
	pairwiseCorrelations: Record<string, number>;
	cdi: number;
	timestamp: string;
}

export type DebateRole = "architect" | "critic" | "pragmatist" | "researcher" | "synthesizer";

export interface DebateParticipant {
	modelId: string;
	role: DebateRole;
}

export interface DebateRound {
	roundNumber: number;
	proposals: Record<string, string>;
	challenges: Record<string, Record<string, string>>;
	defenses: Record<string, string>;
	synthesis: string;
	ratification: Record<string, "accept" | "reject" | "amend">;
	converged: boolean;
	cost: DebateCost;
}

export interface DebateCost {
	totalInputTokens: number;
	totalOutputTokens: number;
	estimatedUSD: number;
}

export interface DebateResult {
	task: string;
	architecture: DebateArchitecture;
	rounds: DebateRound[];
	finalSynthesis: string;
	converged: boolean;
	totalCost: DebateCost;
	participants: DebateParticipant[];
	startedAt: string;
	completedAt: string;
}

export type DebateArchitecture = "fan_out" | "moderated_tribunal" | "full_synapse" | "sequential";

export interface DebateConfig {
	maxRounds: number;
	convergenceThreshold: number;
	convergenceLambda: number;
	ratificationThreshold: number;
	maxBudgetUSD: number;
}
