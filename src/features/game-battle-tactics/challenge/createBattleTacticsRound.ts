import type { Move, Pokemon } from "~/types";
import { createScopedRandom } from "~/utils";

import type { BattleTacticsOption } from "../model/Round.ts";
import { calculateMoveScore } from "../scoring/calculateMoveScore.ts";
import type { TypeEffectivenessLookup } from "../utils/effectiveness.ts";
import { randomIntegerInclusive } from "../utils/random.ts";

function createMoveCandidate(
  roundIndex: number,
  pokemon: Pokemon,
  move: Move,
  getEffectiveness: TypeEffectivenessLookup,
): BattleTacticsOption {
  const hitRandom = createScopedRandom(
    ["round", roundIndex, "pokemon", pokemon.nr, "move", move.nr, "hits"].join(
      ":",
    ),
  );

  const hitCount = randomIntegerInclusive(
    move.minHits,
    move.maxHits,
    hitRandom,
  );

  return {
    move,
    hitCount,
    score: calculateMoveScore(move, pokemon.types, hitCount, getEffectiveness),
  };
}

export function createRankedMoveCandidates(
  roundIndex: number,
  pokemon: Pokemon,
  moves: readonly Move[],
  getEffectiveness: TypeEffectivenessLookup,
): BattleTacticsOption[] {
  return moves
    .map((move) =>
      createMoveCandidate(roundIndex, pokemon, move, getEffectiveness),
    )
    .toSorted(
      (left, right) =>
        right.score.score - left.score.score || left.move.nr - right.move.nr,
    );
}
