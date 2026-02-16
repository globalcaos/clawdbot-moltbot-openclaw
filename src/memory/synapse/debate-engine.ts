/**
 * SYNAPSE Debate Engine — CDI measurement, RAAC protocol, debate architectures.
 */

import type { CDIMeasurement, DebateResult, DebateRound, DebateCost, DebateConfig, DebateParticipant, DebateArchitecture } from "./types.js";

/** Pearson correlation coefficient */
function pearsonCorrelation(a: boolean[], b: boolean[]): number {
	const n = Math.min(a.length, b.length);
	if (n === 0) return 0;
	const meanA = a.reduce((s, v) => s + (v ? 1 : 0), 0) / n;
	const meanB = b.reduce((s, v) => s + (v ? 1 : 0), 0) / n;
	let cov = 0;
	let varA = 0;
	let varB = 0;
	for (let i = 0; i < n; i++) {
		const da = (a[i] ? 1 : 0) - meanA;
		const db = (b[i] ? 1 : 0) - meanB;
		cov += da * db;
		varA += da * da;
		varB += db * db;
	}
	const denom = Math.sqrt(varA) * Math.sqrt(varB);
	return denom === 0 ? 0 : cov / denom;
}

/** Measure Cognitive Diversity Index across model error profiles */
export function measureCDI(errorProfiles: Record<string, boolean[]>): CDIMeasurement {
	const models = Object.keys(errorProfiles);
	const n = models.length;
	let sumCorrelation = 0;
	let pairs = 0;
	const pairwiseCorrelations: Record<string, number> = {};

	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			const r = pearsonCorrelation(errorProfiles[models[i]], errorProfiles[models[j]]);
			pairwiseCorrelations[`${models[i]}-${models[j]}`] = r;
			sumCorrelation += r;
			pairs++;
		}
	}

	const cdi = pairs > 0 ? 1 - sumCorrelation / pairs : 0;

	return {
		modelSet: models,
		errorProfiles,
		pairwiseCorrelations,
		cdi,
		timestamp: new Date().toISOString(),
	};
}

/** Generate a proposal for a debate round (mock — in production calls LLM) */
function generateProposal(task: string, role: string, previousSynthesis?: string): string {
	const prefix = previousSynthesis ? `Building on: ${previousSynthesis.slice(0, 100)}... ` : "";
	return `${prefix}[${role}] Proposal for: ${task}`;
}

/** Run a single debate round with mock LLM calls */
export function runDebateRound(
	task: string,
	participants: DebateParticipant[],
	roundNumber: number,
	previousSynthesis?: string,
): DebateRound {
	// Phase 1: PROPOSE
	const proposals: Record<string, string> = {};
	for (const p of participants) {
		proposals[p.modelId] = generateProposal(task, p.role, previousSynthesis);
	}

	// Phase 2: CHALLENGE
	const challenges: Record<string, Record<string, string>> = {};
	for (const attacker of participants) {
		challenges[attacker.modelId] = {};
		for (const target of participants) {
			if (attacker.modelId !== target.modelId) {
				challenges[attacker.modelId][target.modelId] = `[${attacker.role}] Challenge to ${target.role}: consider edge cases`;
			}
		}
	}

	// Phase 3: DEFEND
	const defenses: Record<string, string> = {};
	for (const p of participants) {
		defenses[p.modelId] = `[${p.role}] Defense: addressed concerns`;
	}

	// Phase 4: SYNTHESIZE
	const synthesis = `Synthesis R${roundNumber}: Integrated perspectives from ${participants.map((p) => p.role).join(", ")} on: ${task}`;

	// Phase 5: RATIFY
	const ratification: Record<string, "accept" | "reject" | "amend"> = {};
	for (const p of participants) {
		ratification[p.modelId] = "accept"; // Default to accept in mock
	}

	const cost: DebateCost = {
		totalInputTokens: participants.length * 500,
		totalOutputTokens: participants.length * 200,
		estimatedUSD: participants.length * 0.01,
	};

	// Check convergence (in production: semantic distance between syntheses)
	const converged = roundNumber > 1 && previousSynthesis !== undefined;

	return { roundNumber, proposals, challenges, defenses, synthesis, ratification, converged, cost };
}

/** Run a full debate using the specified architecture */
export function runDebate(
	task: string,
	participants: DebateParticipant[],
	config: DebateConfig,
	architecture: DebateArchitecture = "full_synapse",
): DebateResult {
	const startedAt = new Date().toISOString();
	const rounds: DebateRound[] = [];
	let converged = false;
	let totalCost: DebateCost = { totalInputTokens: 0, totalOutputTokens: 0, estimatedUSD: 0 };

	for (let r = 1; r <= config.maxRounds; r++) {
		const prevSynthesis = rounds.length > 0 ? rounds[rounds.length - 1].synthesis : undefined;
		const round = runDebateRound(task, participants, r, prevSynthesis);
		rounds.push(round);

		totalCost = {
			totalInputTokens: totalCost.totalInputTokens + round.cost.totalInputTokens,
			totalOutputTokens: totalCost.totalOutputTokens + round.cost.totalOutputTokens,
			estimatedUSD: totalCost.estimatedUSD + round.cost.estimatedUSD,
		};

		// Check ratification
		const rejectCount = Object.values(round.ratification).filter((v) => v === "reject").length;
		if (rejectCount > participants.length * config.ratificationThreshold) {
			continue; // Need repair round
		}

		if (round.converged || totalCost.estimatedUSD >= config.maxBudgetUSD) {
			converged = round.converged;
			break;
		}
	}

	const finalSynthesis = rounds.length > 0 ? rounds[rounds.length - 1].synthesis : "No synthesis produced";

	return {
		task,
		architecture,
		rounds,
		finalSynthesis,
		converged,
		totalCost,
		participants,
		startedAt,
		completedAt: new Date().toISOString(),
	};
}
