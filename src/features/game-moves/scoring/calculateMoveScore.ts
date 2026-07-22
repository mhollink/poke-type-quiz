import type { Move, PokemonType } from "../../../types";
import type { MoveScoreBreakdown } from "../model/Score.ts";
import {
	calculateTypeMultiplier,
	type TypeEffectivenessLookup,
} from "../utils/effectiveness.ts";

export function calculateMoveScore(
	move: Move,
	targetTypes: readonly PokemonType[],
	hitCount: number,
	getEffectiveness: TypeEffectivenessLookup,
): MoveScoreBreakdown {
	if (hitCount < move.minHits || hitCount > move.maxHits) {
		throw new Error(
			`Hit count ${hitCount} is outside ${move.minHits}-${move.maxHits}`,
		);
	}

	const typeMultiplier = calculateTypeMultiplier(
		move.type,
		targetTypes,
		getEffectiveness,
	);

	const accuracyMultiplier = move.accuracy / 100;

	const rawScore = move.power * hitCount * typeMultiplier * accuracyMultiplier;

	return {
		power: move.power,
		hitCount,
		typeMultiplier,
		accuracyMultiplier,
		rawScore,
		score: Math.round(rawScore),
	};
}
