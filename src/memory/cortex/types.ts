/**
 * CORTEX — Consistent Objective Reference for Trait Expression
 * PersonaState, drift detection, and identity preservation.
 */

export interface HardRule {
	id: string;
	rule: string;
	category: "safety" | "identity" | "style" | "policy";
	examples: string[];
}

export interface Trait {
	dimension: string;
	targetValue: number;
	description: string;
	calibrationExamples: string[];
}

export interface VoiceMarkers {
	avgSentenceLength: number;
	vocabularyTier: "casual" | "standard" | "technical" | "academic";
	hedgingLevel: "never" | "rare" | "moderate" | "frequent";
	emojiUsage: "never" | "rare" | "moderate" | "frequent";
	signaturePhrases: string[];
	forbiddenPhrases: string[];
}

export interface HumorCalibration {
	humorFrequency: number;
	preferredPatterns: number[];
	sensitivityThreshold: number;
	audienceModel: Record<string, unknown>;
}

export interface RelationalState {
	perUserAdjustments: Record<string, { formalityShift: number; humorShift: number }>;
}

export interface PersonaState {
	version: number;
	lastUpdated: string;
	name: string;
	identityStatement: string;
	hardRules: HardRule[];
	traits: Trait[];
	voiceMarkers: VoiceMarkers;
	relational: RelationalState;
	humor: HumorCalibration;
	referenceSamples: string[];
}

export type ProbeType = "hard_rule" | "style" | "full_audit";

export interface ProbeResult {
	probeType: ProbeType;
	turnNumber: number;
	timestamp: string;
	scores: Record<string, number>;
	passed: boolean;
	violations: string[];
	rawOutput: string;
	model: string;
	inputTokens: number;
	outputTokens: number;
	latencyMs: number;
	cost: number;
}

export type DriftAction = "none" | "mild_reinforce" | "moderate_refresh" | "severe_rebase";

export interface DriftState {
	ewmaScore: number;
	consistency: number;
	lastAction: DriftAction;
	history: Array<{ turnNumber: number; score: number; consistency: number; action: DriftAction }>;
	userCorrectionWindow: boolean[];
}

export interface DriftAssessment {
	score: number;
	consistency: number;
	action: DriftAction;
	triggerSynapseDebate: boolean;
}
