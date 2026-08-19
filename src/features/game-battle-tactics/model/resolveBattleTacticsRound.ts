import type {
  ResolvedBattleTacticsRound,
  ResolvedMoveOption,
} from "./MoveDex.ts";
import type { BattleTacticsRound } from "./Round.ts";

type ResolveBattleTacticsRoundArgs = {
  readonly round: BattleTacticsRound;
  readonly selectedMoveId: string;
  readonly resolvedAt: number;
};

export function resolveBattleTacticsRound({
  round,
  selectedMoveId,
  resolvedAt,
}: ResolveBattleTacticsRoundArgs): ResolvedBattleTacticsRound {
  const selectedOption = round.options.find(
    (option) => option.move.id === selectedMoveId,
  );

  if (!selectedOption) {
    throw new Error(
      `Move ${selectedMoveId} is not available in round ${round.index}`,
    );
  }

  const selectedScore = selectedOption.score.score;

  const options = round.options.map((option): ResolvedMoveOption => {
    const selected = option.move.id === selectedMoveId;
    const optimal = option.score.score === round.maxScore;

    return {
      moveId: option.move.id,
      score: option.score.score,
      typeMultiplier: option.score.typeMultiplier,

      selected,
      optimal,

      judgement: selected
        ? optimal
          ? "correct"
          : "incorrect"
        : option.score.score === selectedScore
          ? "neutral"
          : option.score.score < selectedScore
            ? "correct"
            : "incorrect",
    };
  });

  return {
    resolvedAt,
    options,
  };
}
