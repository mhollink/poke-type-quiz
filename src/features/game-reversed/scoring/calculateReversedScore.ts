import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";

export interface CalculateReversedScoreInput {
	readonly roundDurationMs: number;
	readonly timeRemainingMs: number;
	readonly typeCount: number;
	readonly canonicalOrder: boolean;
	readonly correctAnswersBeforeRound: number;
}

export function calculateReversedScore({
	roundDurationMs,
	timeRemainingMs,
	typeCount,
	canonicalOrder,
	correctAnswersBeforeRound,
}: CalculateReversedScoreInput): ScoreBreakdown {
	const remainingRatio = Math.max(
		0,
		Math.min(1, timeRemainingMs / roundDurationMs),
	);

	const basePoints = 100;
	const speedMultiplier = 1 + remainingRatio;
	const difficultyMultiplier = typeCount === 2 ? 1.25 : 1;
	const precisionMultiplier = typeCount === 2 && canonicalOrder ? 1.15 : 1;
	const streakMultiplier = 1 + Math.min(correctAnswersBeforeRound, 20) * 0.025;

	const totalPoints = Math.round(
		basePoints *
			speedMultiplier *
			difficultyMultiplier *
			precisionMultiplier *
			streakMultiplier,
	);

	return {
		basePoints,
		speedMultiplier,
		difficultyMultiplier,
		streakMultiplier,
		precisionMultiplier,
		totalPoints,
	};
}
