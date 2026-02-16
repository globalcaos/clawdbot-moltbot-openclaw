/**
 * LIMBIC Humor Engine — humor potential, patterns, bridge discovery, sensitivity.
 */

import type { HumorCandidate, HumorAssociation, SensitivityResult, HumorEvaluation } from "./types.js";
import type { HumorCalibration } from "../cortex/types.js";

const SENSITIVE_CATEGORIES = new Set([
	"death", "grief", "illness", "trauma", "violence",
	"abuse", "suicide", "self-harm", "terrorism",
]);

const HUMOR_ZONE = {
	distanceMin: 0.6,
	distanceMax: 0.95,
	validityThreshold: 0.15,
	surpriseThreshold: 0.3,
};

/** Cosine distance (1 - cosine similarity) */
function cosineDistance(a: number[], b: number[]): number {
	if (a.length !== b.length || a.length === 0) return 1;
	let dot = 0;
	let normA = 0;
	let normB = 0;
	for (let i = 0; i < a.length; i++) {
		dot += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}
	const denom = Math.sqrt(normA) * Math.sqrt(normB);
	return denom === 0 ? 1 : 1 - dot / denom;
}

/** Cosine similarity */
function cosineSimilarity(a: number[], b: number[]): number {
	return 1 - cosineDistance(a, b);
}

/** Compute humor potential h_v2 */
export function humorPotentialV2(
	embA: number[],
	embB: number[],
	embBridge: number[],
	neighborRank?: number,
): number {
	const dist = cosineDistance(embA, embB);
	const validity = Math.min(cosineSimilarity(embBridge, embA), cosineSimilarity(embBridge, embB));
	const surprise = neighborRank !== undefined ? neighborRank / 100 : 0.5;
	return dist * Math.max(validity, 0) * surprise;
}

/** Check if a candidate falls in the humor zone */
export function isInHumorZone(candidate: HumorCandidate): boolean {
	return (
		candidate.distance >= HUMOR_ZONE.distanceMin &&
		candidate.distance <= HUMOR_ZONE.distanceMax &&
		candidate.validity >= HUMOR_ZONE.validityThreshold &&
		candidate.surprise >= HUMOR_ZONE.surpriseThreshold
	);
}

/** Sensitivity gate: check if humor is appropriate given context */
export function checkSensitivity(
	contextWords: string[],
	sensitivityThreshold: number,
): SensitivityResult {
	const lowerWords = contextWords.map((w) => w.toLowerCase());
	for (const word of lowerWords) {
		if (SENSITIVE_CATEGORIES.has(word)) {
			return { blocked: true, reason: `Sensitive topic: ${word}`, sensitivityScore: 1.0 };
		}
	}
	return { blocked: false, sensitivityScore: 0.0 };
}

/** Evaluate whether to attempt humor on this turn */
export function evaluateHumorOpportunity(
	messageContent: string,
	calibration: HumorCalibration,
	recentHumorAttempts: number,
	totalRecentTurns: number,
): HumorEvaluation {
	// Check frequency budget
	const currentRate = totalRecentTurns > 0 ? recentHumorAttempts / totalRecentTurns : 0;
	if (currentRate >= calibration.humorFrequency) {
		return { shouldAttempt: false, reason: "Humor frequency budget exceeded" };
	}

	// Sensitivity gate
	const words = messageContent.split(/\s+/);
	const sensitivity = checkSensitivity(words, calibration.sensitivityThreshold);
	if (sensitivity.blocked) {
		return { shouldAttempt: false, reason: sensitivity.reason ?? "Blocked by sensitivity gate" };
	}

	// Simplified: check if message length suggests conversational context (not tool-heavy)
	if (messageContent.length > 2000) {
		return { shouldAttempt: false, reason: "Message too long/technical for humor" };
	}

	return { shouldAttempt: true, reason: "Humor opportunity available" };
}

/** Create a humor association from a successful humor candidate */
export function createHumorAssociation(
	candidate: HumorCandidate,
	audience: string,
	contextTags: string[],
): HumorAssociation {
	return {
		conceptA: candidate.conceptA,
		conceptB: candidate.conceptB,
		bridge: candidate.bridge,
		patternType: candidate.patternType,
		surpriseScore: candidate.surprise,
		humorConfidence: 0.5, // initial confidence
		audience,
		contextTags,
		timesUsed: 0,
		lastUsed: new Date().toISOString(),
		discoveredVia: "conversation",
	};
}

/** Discover bridge candidates (simplified — in production uses embeddings + LLM) */
export function discoverBridges(
	conceptA: string,
	conceptB: string,
	preferredPatterns: number[],
): HumorCandidate[] {
	// Simplified bridge discovery: generate placeholder candidates
	// In production, this cascades: embedding arithmetic → orthogonal search → LLM generation
	const candidates: HumorCandidate[] = [];

	for (const pattern of preferredPatterns) {
		candidates.push({
			conceptA,
			conceptB,
			bridge: `bridge(${conceptA},${conceptB})`,
			patternType: pattern,
			humorPotential: 0.15 + Math.random() * 0.3,
			surprise: 0.4 + Math.random() * 0.4,
			validity: 0.2 + Math.random() * 0.5,
			distance: 0.6 + Math.random() * 0.3,
		});
	}

	return candidates.filter(isInHumorZone);
}
