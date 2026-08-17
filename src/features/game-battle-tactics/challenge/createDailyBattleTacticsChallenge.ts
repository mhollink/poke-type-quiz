import type { Move, Pokemon } from "~/types";
import { createScopedRandom, shuffle } from "~/utils";

import { dailyGameConfig } from "../battleTacticsGameConfig.ts";
import type {
  BattleTacticsChallenge,
  BattleTacticsOption,
  BattleTacticsOptionSelection,
} from "../model/Round.ts";
import type { TypeEffectivenessLookup } from "../utils/effectiveness.ts";
import { sampleWithoutReplacement } from "../utils/stablize.ts";
import { pickBestCandidate, pickRelativeCandidate } from "./candidates.ts";
import { createRankedMoveCandidates } from "./createBattleTacticsRound.ts";

export function createBattleTacticsChallenge(
  dateKey: string,
  pokemon: readonly Pokemon[],
  moves: readonly Move[],
  getEffectiveness: TypeEffectivenessLookup,
): BattleTacticsChallenge {
  const selectedPokemon = selectDailyPokemon(pokemon);

  const eligibleMoves = moves.toSorted((left, right) => left.nr - right.nr);

  const usedBestMoveIds = new Set<string>();

  const rounds = selectedPokemon.map((selectedPokemon, index) => {
    const selection = selectBattleTacticsOptions(
      index,
      selectedPokemon,
      eligibleMoves,
      getEffectiveness,
      usedBestMoveIds,
    );

    usedBestMoveIds.add(selection.bestMoveId);

    return {
      index,
      pokemon: selectedPokemon,
      options: selection.options,
      maxScore: Math.max(
        ...selection.options.map((option) => option.score.score),
      ),
    };
  });

  return {
    dateKey,
    rounds: shuffle(rounds),
    maxScore: rounds.reduce((total, round) => total + round.maxScore, 0),
  };
}

function selectDailyPokemon(pokemon: readonly Pokemon[]) {
  const eligiblePokemon = [...pokemon].sort(
    (left, right) => left.nr - right.nr,
  );

  return sampleWithoutReplacement(
    eligiblePokemon,
    dailyGameConfig.rounds,
    createScopedRandom("pokemon-selection"),
  );
}

function selectBattleTacticsOptions(
  roundIndex: number,
  pokemon: Pokemon,
  moves: readonly Move[],
  getEffectiveness: TypeEffectivenessLookup,
  usedBestMoveIds: ReadonlySet<string>,
): BattleTacticsOptionSelection {
  const candidates = createRankedMoveCandidates(
    roundIndex,
    pokemon,
    moves,
    getEffectiveness,
  );

  if (candidates.length < 4) {
    throw new Error("At least four move candidates are required");
  }

  const best = pickBestCandidate(
    candidates,
    usedBestMoveIds,
    createScopedRandom(`round:${roundIndex}:best`),
  );

  const selected: BattleTacticsOption[] = [best];
  let upperScoreExclusive = best.score.score;

  for (const tier of dailyGameConfig.tierConfig) {
    const option = pickRelativeCandidate(
      candidates,
      best.score.score,
      upperScoreExclusive,
      tier.targetRatio,
      selected,
      createScopedRandom(`round:${roundIndex}:tier:${tier.id}`),
    );

    selected.push(option);
    upperScoreExclusive = option.score.score;
  }

  return {
    bestMoveId: best.move.id,
    options: shuffle(selected),
  };
}
