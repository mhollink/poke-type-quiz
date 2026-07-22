import type { Move, Pokemon } from "../../../types";
import type { DailyMoveOption, DailyMoveRound } from "../model/Round.ts";
import { calculateMoveScore } from "../scoring/calculateMoveScore.ts";
import type { TypeEffectivenessLookup } from "../utils/effectiveness.ts";
import { createScopedRandom, randomIntegerInclusive } from "../utils/random.ts";
import { sampleWithoutReplacement } from "../utils/stablize.ts";

export function createDailyMoveRound(
	dateKey: string,
	index: number,
	pokemon: Pokemon,
	eligibleMoves: readonly Move[],
	getEffectiveness: TypeEffectivenessLookup,
): DailyMoveRound {
	const moves = sampleWithoutReplacement(
		eligibleMoves,
		4,
		createScopedRandom(dateKey, `round:${index}:moves`),
	);

	const options = moves.map((move): DailyMoveOption => {
		const hitRandom = createScopedRandom(
			dateKey,
			`round:${index}:pokemon:${pokemon.nr}:move:${move.nr}:hits`,
		);

		const hitCount = randomIntegerInclusive(
			move.minHits,
			move.maxHits,
			hitRandom,
		);

		const score = calculateMoveScore(
			move,
			pokemon.types,
			hitCount,
			getEffectiveness,
		);

		return {
			move,
			hitCount,
			score,
		};
	});

	return {
		index,
		pokemon,
		options,
		maxScore: Math.max(...options.map((option) => option.score.score)),
	};
}
