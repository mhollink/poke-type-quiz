import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";

export interface CalculateClassicScoreInput {
	readonly roundDurationMs: number;
	readonly timeRemainingMs: number;
	readonly availableAnswerCount: number;
	readonly roundIndex: number;
}

export function calculateClassicScore({
	roundDurationMs,
	timeRemainingMs,
	availableAnswerCount,
	roundIndex,
}: CalculateClassicScoreInput): ScoreBreakdown {
	const remainingRatio = clamp(timeRemainingMs / roundDurationMs, 0, 1);

	const speedMultiplier = 1 + remainingRatio / 5;

	const answerScarcity = 1 / Math.max(1, availableAnswerCount);
	const progression = Math.min(roundIndex * 0.04, 1.5);

	const difficultyMultiplier =
		1 + Math.min(answerScarcity * 8, 1) + progression;

	const basePoints = 125;

	const totalPoints = Math.round(
		basePoints * speedMultiplier * difficultyMultiplier,
	);

	return {
		basePoints,
		speedMultiplier,
		difficultyMultiplier,
		streakMultiplier: 1,
		precisionMultiplier: 1,
		totalPoints,
	};
}

function clamp(value: number, minimum: number, maximum: number): number {
	return Math.min(maximum, Math.max(minimum, value));
}
