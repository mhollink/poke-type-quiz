import type { Pokemon, TypeChallenge } from "../../types";
import { createChallenges } from "../../utils";

/**
 * Builds one challenge per individual Pokémon type.
 *
 * Dual-type Pokémon are projected into both of their types before the shared
 * challenge builder runs. This means a Fire challenge includes Charmander,
 * Charizard, Numel, and every other Pokémon containing Fire.
 */
export function createSingleTypeChallenges(
	pokemon: readonly Pokemon[],
): readonly TypeChallenge[] {
	const pokemonByIndividualType: Pokemon[] = pokemon.flatMap((entry) =>
		entry.types.map((type) => ({
			...entry,
			types: [type],
		})),
	);

	return createChallenges(pokemonByIndividualType);
}

export function getValidPokemonForSingleTypeChallenge(
	pokemon: readonly Pokemon[],
	challenge: TypeChallenge,
): Pokemon[] {
	const requiredType = challenge.types[0];

	if (!requiredType) {
		return [];
	}

	return pokemon.filter((entry) => entry.types.includes(requiredType));
}
