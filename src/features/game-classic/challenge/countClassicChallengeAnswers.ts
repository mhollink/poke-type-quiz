import type { Pokemon } from "../../../types";
import type { TypeChallenge } from "../model/classicGameTypes.ts";

export function countClassicChallengeAnswers(
	pokemon: readonly Pokemon[],
	usedPokemonIds: ReadonlySet<string>,
	challenge: TypeChallenge,
): number {
	return pokemon.filter(
		(candidate) =>
			!usedPokemonIds.has(candidate.id) &&
			candidate.types.includes(challenge.type),
	).length;
}
