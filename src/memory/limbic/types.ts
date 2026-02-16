/**
 * LIMBIC — Latent Incongruity Model for Bridge-Informed Comedy
 * Humor potential, pattern recognition, and bridge discovery.
 */

export interface HumorCandidate {
	conceptA: string;
	conceptB: string;
	bridge: string;
	patternType: number;
	humorPotential: number;
	surprise: number;
	validity: number;
	distance: number;
}

export interface HumorAssociation {
	conceptA: string;
	conceptB: string;
	bridge: string;
	patternType: number;
	surpriseScore: number;
	humorConfidence: number;
	audience: string;
	contextTags: string[];
	timesUsed: number;
	lastUsed: string;
	discoveredVia: "conversation" | "generated" | "observed";
}

export interface SensitivityResult {
	blocked: boolean;
	reason?: string;
	sensitivityScore: number;
}

export type PatternType =
	| 1  // Antonymic Inversion
	| 2  // Scale Mismatch
	| 3  // Category Error
	| 4  // Expectation Subversion
	| 5  // Temporal Displacement
	| 6  // Register Collision
	| 7  // Domain Transfer
	| 8  // Similarity in Dissimilarity
	| 9  // Literal/Figurative Toggle
	| 10 // Status Inversion
	| 11 // Recursion/Self-Reference
	| 12; // Meta-Commentary

export interface HumorEvaluation {
	shouldAttempt: boolean;
	candidate?: HumorCandidate;
	reason: string;
}
