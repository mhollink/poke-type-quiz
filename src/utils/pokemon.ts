import pokemonJson from "../assets/pokemon.json";
import {
	POKEMON_TYPES,
	type Pokemon,
	type PokemonType,
} from "../types/pokemon";

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
		typeof candidate.id !== "string" ||
		typeof candidate.name !== "string" ||
		!Array.isArray(candidate.types)
	) {
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

	return {
		nr: candidate.nr,
		id: candidate.id,
		name: candidate.name,
		types,
	};
}

export const pokemonData: readonly Pokemon[] = (pokemonJson as unknown[])
	.map(parsePokemon)
	.filter(
		(pokemon, index, self) =>
			index === self.findIndex((candidate) => candidate.nr === pokemon.nr),
	)
	.sort((left, right) => left.nr - right.nr);

export const pokemonById = new Map(
	pokemonData.map((pokemon) => [pokemon.id, pokemon]),
);
