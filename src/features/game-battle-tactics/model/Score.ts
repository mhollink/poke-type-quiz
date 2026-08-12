export type MoveScoreBreakdown = {
  power: number;
  hitCount: number;
  typeMultiplier: number;
  accuracyMultiplier: number;
  rawScore: number;
  score: number;
};

export interface DailyBattleAttemptRecord {
  readonly dateKey: string;
  readonly completedAt: number;
  readonly score: number;
  readonly correctAnswers: number;
  readonly totalRounds: number;
  readonly percentage: number;
  readonly maxScore: number;
}
