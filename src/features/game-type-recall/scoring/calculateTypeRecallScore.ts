import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";
import { typeRecallGameConfig } from "../typeRecallGameConfig.ts";

export interface CalculateTypeRecallScoreInput {
  readonly timeRemainingMs: number;
  readonly typeCount: number;
  readonly canonicalOrder: boolean;
  readonly correctAnswersBeforeRound: number;
  readonly challengeDifficulty: number;
}

export function calculateTypeRecallScore({
  timeRemainingMs,
  typeCount,
  canonicalOrder,
  correctAnswersBeforeRound,
  challengeDifficulty,
}: CalculateTypeRecallScoreInput): ScoreBreakdown {
  const remainingRatio = clamp(
    timeRemainingMs / typeRecallGameConfig.roundDurationMs,
    0,
    1,
  );

  const speedMultiplier = 1 + remainingRatio;

  const typeMultiplier =
    typeCount > 1 ? typeRecallGameConfig.dualTypeMultiplier : 1;

  const difficultyMultiplier = typeMultiplier * (1 + challengeDifficulty);

  const precisionMultiplier =
    typeCount > 1 && canonicalOrder
      ? typeRecallGameConfig.canonicalOrderMultiplier
      : 1;

  const streakMultiplier = Math.min(
    typeRecallGameConfig.maximumStreakMultiplier,
    1 + correctAnswersBeforeRound * typeRecallGameConfig.streakMultiplierStep,
  );

  const totalPoints = Math.round(
    typeRecallGameConfig.basePoints *
      speedMultiplier *
      difficultyMultiplier *
      precisionMultiplier *
      streakMultiplier,
  );

  return {
    basePoints: typeRecallGameConfig.basePoints,
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
