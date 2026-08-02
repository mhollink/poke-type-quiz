import { useMemo } from "react";
import { localGenerationSelectionRepository } from "../features/generation-selection/storage/localGenerationSelectionRepository.ts";
import type { Pokemon, PokemonType } from "../types";
import { pokemonData } from "../utils";

export function usePokemonData() {
	const enabledGens = useMemo(
		() => localGenerationSelectionRepository.findEnabledGenerations(),
		[],
	);

	const effectiveGeneration = useMemo(
		() => Math.max(...enabledGens, 1),
		[enabledGens],
	);

	const availablePokemon = useMemo(
		() =>
			pokemonData
				.filter((pokemon) => enabledGens.has(pokemon.gen))
				.map(
					(pokemon) =>
						({
							...pokemon,
							types: resolvePokemonTypes(pokemon, effectiveGeneration),
						}) satisfies Pokemon,
				),
		[enabledGens, effectiveGeneration],
	);

	return {
		enabledGens,
		effectiveGeneration,
		availablePokemon,
	};
}

function resolvePokemonTypes(
	pokemon: Pokemon,
	effectiveGeneration: number,
): PokemonType[] {
	const applicablePastTypes = pokemon.pastTypes
		?.toSorted((left, right) => left.gen - right.gen)
		.find((pastTypes) => effectiveGeneration <= pastTypes.gen);

	return applicablePastTypes?.types ?? pokemon.types;
}
