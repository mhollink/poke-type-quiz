import type { Move, Pokemon } from "../../../types";
import type { DailyMoveChallenge } from "../model/Round.ts";
import type { TypeEffectivenessLookup } from "../utils/effectiveness";
import { createScopedRandom } from "../utils/random.ts";
import { sampleWithoutReplacement } from "../utils/stablize.ts";
import { createDailyMoveRound } from "./createDailyMoveRound.ts";

const DAILY_MOVE_ROUND_COUNT = 25;

export function createDailyMoveChallenge(
	dateKey: string,
	pokemon: readonly Pokemon[],
	moves: readonly Move[],
	getEffectiveness: TypeEffectivenessLookup,
): DailyMoveChallenge {
	const eligiblePokemon = [...pokemon].sort(
		(left, right) => left.nr - right.nr,
	);

	const eligibleMoves = moves
		.filter(isEligibleDailyMove)
		.toSorted((left, right) => left.nr - right.nr);

	if (eligiblePokemon.length < DAILY_MOVE_ROUND_COUNT) {
		throw new Error(`At least ${DAILY_MOVE_ROUND_COUNT} Pokémon are required`);
	}

	if (eligibleMoves.length < 4) {
		throw new Error("At least four eligible moves are required");
	}

	const selectedPokemon = sampleWithoutReplacement(
		eligiblePokemon,
		DAILY_MOVE_ROUND_COUNT,
		createScopedRandom(dateKey, "pokemon-selection"),
	);

	const rounds = selectedPokemon.map((selectedPokemon, index) =>
		createDailyMoveRound(
			dateKey,
			index,
			selectedPokemon,
			eligibleMoves,
			getEffectiveness,
		),
	);

	return {
		dateKey,
		rounds,
		maxScore: rounds.reduce((total, round) => total + round.maxScore, 0),
	};
}

function isEligibleDailyMove(move: Move): boolean {
	return (
		move.power > 0 &&
		move.accuracy > 0 &&
		move.minHits >= 1 &&
		move.maxHits >= move.minHits
	);
}
