import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";
import { typeRushGameConfig } from "../typeRushGameConfig.ts";

export interface CalculateTypeRushScoreInput {
  readonly streakBeforeAnswer: number;
  readonly difficulty: number;
  readonly challengeIndex: number;
}

export function calculateTypeRushScore({
  streakBeforeAnswer,
  difficulty,
  challengeIndex,
}: CalculateTypeRushScoreInput): ScoreBreakdown {
  const nextStreak = streakBeforeAnswer + 1;

  const streakMultiplier = Math.min(
    typeRushGameConfig.maximumStreakMultiplier,
    1 + nextStreak * typeRushGameConfig.streakMultiplierStep,
  );

  const progressionMultiplier =
    1 +
    (Math.min(challengeIndex, 20) *
      typeRushGameConfig.difficultyMultiplierStep) /
      20;

  const challengeDifficultyMultiplier = 1 + difficulty;

  const difficultyMultiplier =
    progressionMultiplier * challengeDifficultyMultiplier;

  const totalPoints = Math.round(
    typeRushGameConfig.basePoints * streakMultiplier * difficultyMultiplier,
  );

  return {
    basePoints: typeRushGameConfig.basePoints,
    speedMultiplier: 1,
    difficultyMultiplier,
    streakMultiplier,
    precisionMultiplier: 1,
    totalPoints,
  };
}
