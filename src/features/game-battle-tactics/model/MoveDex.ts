export type MoveJudgement = "correct" | "incorrect" | "neutral";

export type ResolvedMoveOption = {
  readonly moveId: string;

  readonly score: number;
  readonly typeMultiplier: number;

  readonly selected: boolean;
  readonly optimal: boolean;

  readonly judgement: MoveJudgement;
};

export type ResolvedBattleTacticsRound = {
  readonly resolvedAt: number;
  readonly options: readonly ResolvedMoveOption[];
};

export type MoveDexEntry = {
  readonly moveId: string;

  readonly discoveredAt: number;

  readonly encounters: number;
  readonly selections: number;

  readonly optimalAppearances: number;
  readonly optimalSelections: number;

  /**
   * Correct + incorrect judgements.
   *
   * Neutral judgements are intentionally excluded.
   */
  readonly judgementAttempts: number;

  readonly correctJudgements: number;

  readonly bestScore: number;
  readonly bestEffectiveness: number;
};

export const MOVE_MASTERY_THRESHOLDS = [0, 3, 10, 25, 50] as const;

export type MoveMasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export function getMoveMasteryLevel(
  entry: MoveDexEntry | null,
): MoveMasteryLevel {
  if (!entry) {
    return 0;
  }

  let level = 1;

  for (const threshold of MOVE_MASTERY_THRESHOLDS.slice(1)) {
    if (entry.correctJudgements >= threshold) {
      level += 1;
    }
  }

  return level as MoveMasteryLevel;
}
