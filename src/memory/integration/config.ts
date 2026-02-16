/**
 * Unified Cognitive Architecture Configuration
 * Combines all 4 system configs: ENGRAM, CORTEX, LIMBIC, SYNAPSE
 */

export interface EngramConfig {
	compaction: {
		mode: "safeguard" | "engram";
		triggerThreshold: number;
		hotTailTurns: number;
		markerSoftCap: number;
		markerTokenCap: number;
		artifactThreshold: number;
		previewLines: number;
	};
	retrieval: {
		pullMaxTokens: number;
		pullMaxPerTurn: number;
		mmrLambda: number;
		topK: number;
	};
	embedding: {
		provider: "gemini" | "openai" | "voyage";
		model: string;
		dimensions: number;
	};
}

export interface CortexConfig {
	persona: {
		maxBudgetFraction: number;
	};
	drift: {
		baseWeightUser: number;
		baseWeightProbe: number;
		ewmaAlpha: number;
		sparsityThreshold: number;
		maxProbeBoost: number;
		probeSchedule: { hardRule: number; style: number; fullAudit: number };
	};
	thresholds: {
		healthy: number;
		mild: number;
		moderate: number;
	};
}

export interface LimbicConfig {
	humorZone: {
		distanceMin: number;
		distanceMax: number;
		validityThreshold: number;
		surpriseThreshold: number;
	};
	bridge: {
		candidateCount: number;
		minBridgeQuality: number;
	};
}

export interface SynapseConfig {
	protocol: {
		maxRounds: number;
		convergenceThreshold: number;
		convergenceLambda: number;
		ratificationThreshold: number;
	};
	cost: {
		maxBudgetPerDebate: number;
		warningThreshold: number;
	};
}

export interface CognitiveArchitectureConfig {
	engram: EngramConfig;
	cortex: CortexConfig;
	limbic: LimbicConfig;
	synapse: SynapseConfig;
}

/** Default configuration matching paper hyperparameters */
export function createDefaultConfig(): CognitiveArchitectureConfig {
	return {
		engram: {
			compaction: {
				mode: "engram",
				triggerThreshold: 0.85,
				hotTailTurns: 8,
				markerSoftCap: 20,
				markerTokenCap: 60,
				artifactThreshold: 2000,
				previewLines: 10,
			},
			retrieval: {
				pullMaxTokens: 4000,
				pullMaxPerTurn: 3,
				mmrLambda: 0.7,
				topK: 20,
			},
			embedding: {
				provider: "gemini",
				model: "text-embedding-004",
				dimensions: 768,
			},
		},
		cortex: {
			persona: {
				maxBudgetFraction: 0.05,
			},
			drift: {
				baseWeightUser: 0.7,
				baseWeightProbe: 0.3,
				ewmaAlpha: 0.3,
				sparsityThreshold: 0.05,
				maxProbeBoost: 0.3,
				probeSchedule: { hardRule: 1, style: 5, fullAudit: 20 },
			},
			thresholds: {
				healthy: 0.85,
				mild: 0.70,
				moderate: 0.50,
			},
		},
		limbic: {
			humorZone: {
				distanceMin: 0.6,
				distanceMax: 0.95,
				validityThreshold: 0.15,
				surpriseThreshold: 0.3,
			},
			bridge: {
				candidateCount: 50,
				minBridgeQuality: 0.1,
			},
		},
		synapse: {
			protocol: {
				maxRounds: 5,
				convergenceThreshold: 0.1,
				convergenceLambda: 0.5,
				ratificationThreshold: 0.5,
			},
			cost: {
				maxBudgetPerDebate: 5.0,
				warningThreshold: 2.0,
			},
		},
	};
}
