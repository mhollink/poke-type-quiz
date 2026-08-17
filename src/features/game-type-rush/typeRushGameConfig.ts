export interface TypeRushGameConfig {
  readonly durationMs: number;
  readonly basePoints: number;
  readonly maximumStreakMultiplier: number;
  readonly streakMultiplierStep: number;
  readonly difficultyMultiplierStep: number;
  readonly skipPenaltySec: number;
  readonly correctAnswerTimeBonus: number;
  readonly incorrectAnswerTimePenalty: number;
}

export const typeRushGameConfig: TypeRushGameConfig = {
  durationMs: 3 * 60 * 1_000,
  basePoints: 100,
  maximumStreakMultiplier: 2,
  streakMultiplierStep: 0.05,
  difficultyMultiplierStep: 0.15,
  skipPenaltySec: 30,
  correctAnswerTimeBonus: 10,
  incorrectAnswerTimePenalty: 10,
};
