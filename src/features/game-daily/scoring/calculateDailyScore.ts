import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";
import { dailyGameConfig } from "../dailyGameConfig";

export interface CalculateDailyScoreInput {
	readonly streakBeforeAnswer: number;
	readonly difficulty: number;
	readonly challengeIndex: number;
}

export function calculateDailyScore({
	streakBeforeAnswer,
	difficulty,
	challengeIndex,
}: CalculateDailyScoreInput): ScoreBreakdown {
	const nextStreak = streakBeforeAnswer + 1;

	const streakMultiplier = Math.min(
		dailyGameConfig.maximumStreakMultiplier,
		1 + nextStreak * dailyGameConfig.streakMultiplierStep,
	);

	const progressionMultiplier =
		1 +
		(Math.min(challengeIndex, 20) * dailyGameConfig.difficultyMultiplierStep) /
			20;

	const challengeDifficultyMultiplier = 1 + difficulty;

	const difficultyMultiplier =
		progressionMultiplier * challengeDifficultyMultiplier;

	const totalPoints = Math.round(
		dailyGameConfig.basePoints * streakMultiplier * difficultyMultiplier,
	);

	return {
		basePoints: dailyGameConfig.basePoints,
		speedMultiplier: 1,
		difficultyMultiplier,
		streakMultiplier,
		precisionMultiplier: 1,
		totalPoints,
	};
}
