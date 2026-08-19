import { useMemo } from "react";

import type { Move } from "~/types";

import {
  getMoveMasteryLevel,
  type MoveDexEntry,
  type MoveMasteryLevel,
} from "../model/MoveDex.ts";
import { moveDexRepository } from "../storage/moveDexRepository.ts";

export type MoveDexViewEntry = {
  readonly move: Move;
  readonly progress: MoveDexEntry | null;

  readonly discovered: boolean;
  readonly masteryLevel: MoveMasteryLevel;
  readonly mastered: boolean;

  readonly judgementRate: number | null;
  readonly optimalPickRate: number | null;
};

export function useMoveDex(
  moves: readonly Move[],
): readonly MoveDexViewEntry[] {
  const progress = useMemo(() => moveDexRepository.findAll(), []);

  return useMemo(() => {
    const progressByMoveId = new Map(
      progress.map((entry) => [entry.moveId, entry]),
    );

    return moves.map((move): MoveDexViewEntry => {
      const entry = progressByMoveId.get(move.id) ?? null;
      const masteryLevel = getMoveMasteryLevel(entry);

      return {
        move,
        progress: entry,

        discovered: entry !== null,
        masteryLevel,
        mastered: masteryLevel === 5,

        judgementRate:
          entry && entry.judgementAttempts > 0
            ? entry.correctJudgements / entry.judgementAttempts
            : null,

        optimalPickRate:
          entry && entry.optimalAppearances > 0
            ? entry.optimalSelections / entry.optimalAppearances
            : null,
      };
    });
  }, [moves, progress]);
}
