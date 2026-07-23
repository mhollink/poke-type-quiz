import type { Move, Pokemon } from "../../../types";
import type { DailyMoveOption } from "../model/Round.ts";
import { calculateMoveScore } from "../scoring/calculateMoveScore.ts";
import type { TypeEffectivenessLookup } from "../utils/effectiveness.ts";
import { createScopedRandom, randomIntegerInclusive } from "../utils/random.ts";

function createMoveCandidate(
	dateKey: string,
	roundIndex: number,
	pokemon: Pokemon,
	move: Move,
	getEffectiveness: TypeEffectivenessLookup,
): DailyMoveOption {
	const hitRandom = createScopedRandom(
		dateKey,
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
	dateKey: string,
	roundIndex: number,
	pokemon: Pokemon,
	moves: readonly Move[],
	getEffectiveness: TypeEffectivenessLookup,
): DailyMoveOption[] {
	return moves
		.map((move) =>
			createMoveCandidate(dateKey, roundIndex, pokemon, move, getEffectiveness),
		)
		.toSorted(
			(left, right) =>
				right.score.score - left.score.score || left.move.nr - right.move.nr,
		);
}
