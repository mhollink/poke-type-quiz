import { dailyGameConfig } from "../dailyMoveGameConfig.ts";
import type { DailyMoveOption } from "../model/Round.ts";
import { pickRandomItem, type RandomSource } from "../utils/random.ts";

export function pickBestCandidate(
	candidates: readonly DailyMoveOption[],
	usedBestMoveIds: ReadonlySet<string>,
	random: RandomSource,
): DailyMoveOption {
	if (candidates.length === 0) {
		throw new Error("Cannot select a best move without candidates");
	}

	const maximumScore = candidates[0].score.score;

	let shortlist = candidates
		.filter(
			(candidate) =>
				candidate.score.score >=
				maximumScore * dailyGameConfig.minimumBestRatio,
		)
		.slice(0, dailyGameConfig.bestShortListSize);

	/*
	 * Some Pokémon may have only one or two moves within 85% of
	 * the absolute maximum. Fall back to the top ranked moves.
	 */
	if (shortlist.length < dailyGameConfig.minimumBestCandidates) {
		shortlist = candidates.slice(
			0,
			Math.min(dailyGameConfig.bestShortListSize, candidates.length),
		);
	}

	const unusedCandidates = shortlist.filter(
		(candidate) => !usedBestMoveIds.has(candidate.move.id),
	);

	if (unusedCandidates.length > 0) {
		shortlist = unusedCandidates;
	}

	return pickRandomItem(shortlist, random);
}

export function pickRelativeCandidate(
	candidates: readonly DailyMoveOption[],
	bestScore: number,
	upperScoreExclusive: number,
	targetRatio: number,
	selected: readonly DailyMoveOption[],
	random: RandomSource,
): DailyMoveOption {
	const selectedMoveIds = new Set(selected.map((option) => option.move.id));

	const selectedMoveTypes = new Set(selected.map((option) => option.move.type));

	const available = candidates.filter(
		(candidate) => !selectedMoveIds.has(candidate.move.id),
	);

	const belowPreviousTier = available.filter(
		(candidate) => candidate.score.score < upperScoreExclusive,
	);

	const distinctTypeCandidates = belowPreviousTier.filter(
		(candidate) => !selectedMoveTypes.has(candidate.move.type),
	);

	/*
	 * Prefer:
	 * 1. A lower-scoring move with a new type.
	 * 2. Any lower-scoring move.
	 * 3. A new type, even if the score overlaps.
	 * 4. Any unselected move.
	 */
	const pool =
		distinctTypeCandidates.length > 0
			? distinctTypeCandidates
			: belowPreviousTier.length > 0
				? belowPreviousTier
				: available.filter(
							(candidate) => !selectedMoveTypes.has(candidate.move.type),
						).length > 0
					? available.filter(
							(candidate) => !selectedMoveTypes.has(candidate.move.type),
						)
					: available;

	if (pool.length === 0) {
		throw new Error("Not enough distinct move candidates");
	}

	const ranked = pool.toSorted((left, right) => {
		const leftRatio = bestScore === 0 ? 0 : left.score.score / bestScore;

		const rightRatio = bestScore === 0 ? 0 : right.score.score / bestScore;

		const leftDistance = Math.abs(leftRatio - targetRatio);

		const rightDistance = Math.abs(rightRatio - targetRatio);

		return leftDistance - rightDistance || left.move.nr - right.move.nr;
	});

	const shortlist = ranked.slice(0, dailyGameConfig.tierShortListSize);

	return pickRandomItem(shortlist, random);
}
