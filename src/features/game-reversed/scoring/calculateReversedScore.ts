import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";
import { reversedGameConfig } from "../reversedGameConfig";

export interface CalculateReversedScoreInput {
	readonly timeRemainingMs: number;
	readonly typeCount: number;
	readonly canonicalOrder: boolean;
	readonly correctAnswersBeforeRound: number;
	readonly challengeDifficulty: number;
}

export function calculateReversedScore({
	timeRemainingMs,
	typeCount,
	canonicalOrder,
	correctAnswersBeforeRound,
	challengeDifficulty,
}: CalculateReversedScoreInput): ScoreBreakdown {
	const remainingRatio = clamp(
		timeRemainingMs / reversedGameConfig.roundDurationMs,
		0,
		1,
	);

	const speedMultiplier = 1 + remainingRatio;

	const typeMultiplier =
		typeCount === 2 ? reversedGameConfig.dualTypeMultiplier : 1;

	const difficultyMultiplier = typeMultiplier * (1 + challengeDifficulty);

	const precisionMultiplier =
		typeCount === 2 && canonicalOrder
			? reversedGameConfig.canonicalOrderMultiplier
			: 1;

	const streakMultiplier = Math.min(
		reversedGameConfig.maximumStreakMultiplier,
		1 + correctAnswersBeforeRound * reversedGameConfig.streakMultiplierStep,
	);

	const totalPoints = Math.round(
		reversedGameConfig.basePoints *
			speedMultiplier *
			difficultyMultiplier *
			precisionMultiplier *
			streakMultiplier,
	);

	return {
		basePoints: reversedGameConfig.basePoints,
		speedMultiplier,
		difficultyMultiplier,
		streakMultiplier,
		precisionMultiplier,
		totalPoints,
	};
}

function clamp(value: number, minimum: number, maximum: number): number {
	return Math.min(maximum, Math.max(minimum, value));
}
