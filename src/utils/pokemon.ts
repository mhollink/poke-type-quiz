import type { PastType, Pokemon, PokemonType } from "../types";
import { POKEMON_TYPES } from "../types";
import { loadPokemonData } from "./loadPokemonData.ts";

const validTypes = new Set<string>(POKEMON_TYPES);

function isPokemonType(value: string): value is PokemonType {
	return validTypes.has(value);
}

function parsePokemon(value: unknown): Pokemon {
	if (!value || typeof value !== "object") {
		throw new Error("Invalid Pokémon entry");
	}

	const candidate = value as Record<string, unknown>;

	if (
		typeof candidate.nr !== "number" ||
		typeof candidate.gen !== "number" ||
		(candidate.origin !== undefined && typeof candidate.origin !== "number") ||
		typeof candidate.id !== "string" ||
		typeof candidate.name !== "string" ||
		!Array.isArray(candidate.types)
	) {
		console.warn("Invalid Pokémon entry:", candidate);
		throw new Error("Invalid Pokémon entry");
	}

	const types = candidate.types.filter(
		(type): type is PokemonType =>
			typeof type === "string" && isPokemonType(type),
	);

	if (types.length !== candidate.types.length) {
		throw new Error(`Pokémon ${candidate.name} contains an invalid type`);
	}

	if (types.length < 1 || types.length > 2) {
		throw new Error(`Pokémon ${candidate.name} must have one or two types`);
	}

	let pastTypes: PastType[] | undefined;
	if (Array.isArray(candidate.pastTypes)) {
		pastTypes = candidate.pastTypes
			.filter((pt) => typeof pt.gen === "number" && Array.isArray(pt.types))
			.filter((pt) => pt.types.length > 0)
			.map(
				(pt) =>
					({
						gen: pt.gen,
						types: pt.types.filter(
							(type: unknown): type is PokemonType =>
								typeof type === "string" && isPokemonType(type),
						),
					}) satisfies PastType,
			);
	}

	return {
		nr: candidate.nr,
		id: candidate.id,
		name: candidate.name,
		gen: candidate.gen,
		origin: candidate.origin,
		types,
		pastTypes,
	};
}

export const pokemonData: readonly Pokemon[] = (
	(await loadPokemonData()) as unknown[]
)
	.map(parsePokemon)
	.filter(
		(pokemon, index, self) =>
			index === self.findIndex((candidate) => candidate.nr === pokemon.nr),
	)
	.sort((left, right) => left.nr - right.nr);
