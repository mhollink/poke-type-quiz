import type {
	GameConfig,
	ScoreCalculation,
	ScoringConfig,
} from "../types/game";

export const defaultScoringConfig: ScoringConfig = {
	basePoints: 100,
	minimumTimeFactor: 0.25,
	referenceOptionCount: 32,
	difficultyWeight: 0.5,
	maximumDifficultyFactor: 2.5,
	correctAnswersPerMultiplier: 5,
	multiplierIncrement: 0.25,
	maximumMultiplier: 3,
};

export const defaultGameConfig: GameConfig = {
	roundDurationMs: 30_000,
	minimumSearchLength: 2,
	maximumSuggestions: 8,
	scoring: defaultScoringConfig,
};

type CalculateScoreInput = {
	timeRemainingMs: number;
	roundDurationMs: number;
	availableOptionCount: number;
	correctAnswersBeforeRound: number;
};

export function calculateMultiplier(
	correctAnswers: number,
	config: ScoringConfig,
): number {
	const multiplierLevel = Math.floor(
		correctAnswers / config.correctAnswersPerMultiplier,
	);

	return Math.min(
		1 + multiplierLevel * config.multiplierIncrement,
		config.maximumMultiplier,
	);
}

export function calculateScore(
	input: CalculateScoreInput,
	config: ScoringConfig,
): ScoreCalculation {
	const timeRatio = clamp(input.timeRemainingMs / input.roundDurationMs, 0, 1);

	const timeFactor =
		config.minimumTimeFactor + (1 - config.minimumTimeFactor) * timeRatio;

	const rawDifficultyFactor =
		1 +
		config.difficultyWeight *
			Math.log2(
				config.referenceOptionCount / Math.max(input.availableOptionCount, 1),
			);

	const difficultyFactor = clamp(
		rawDifficultyFactor,
		1,
		config.maximumDifficultyFactor,
	);

	const multiplier = calculateMultiplier(
		input.correctAnswersBeforeRound,
		config,
	);

	return {
		points: Math.round(
			config.basePoints * timeFactor * difficultyFactor * multiplier,
		),
		timeFactor,
		difficultyFactor,
		multiplier,
	};
}

function clamp(value: number, minimum: number, maximum: number): number {
	return Math.min(Math.max(value, minimum), maximum);
}
