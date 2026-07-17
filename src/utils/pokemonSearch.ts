import type { Pokemon } from "../types/pokemon";
import { levenshteinDistance, normalizeSearchValue } from "./levenshtein";

type ScoredPokemon = {
	pokemon: Pokemon;
	score: number;
};

export function filterPokemonByName(
	pokemon: readonly Pokemon[],
	input: string,
	maximumResults = 8,
): Pokemon[] {
	const query = normalizeSearchValue(input);

	if (query.length === 0) {
		return [];
	}

	return pokemon
		.map((candidate) => scorePokemon(candidate, query))
		.filter((candidate): candidate is ScoredPokemon => candidate !== null)
		.sort((left, right) => {
			if (left.score !== right.score) {
				return left.score - right.score;
			}

			return left.pokemon.nr - right.pokemon.nr;
		})
		.slice(0, maximumResults)
		.map((candidate) => candidate.pokemon);
}

function scorePokemon(pokemon: Pokemon, query: string): ScoredPokemon | null {
	const name = normalizeSearchValue(pokemon.name);

	if (name === query) {
		return {
			pokemon,
			score: 0,
		};
	}

	if (name.startsWith(query)) {
		return {
			pokemon,
			score: 1,
		};
	}

	if (name.includes(query)) {
		return {
			pokemon,
			score: 2,
		};
	}

	const distance = levenshteinDistance(query, name);
	const maximumDistance = getMaximumDistance(query.length);

	if (distance > maximumDistance) {
		return null;
	}

	return {
		pokemon,
		score: 10 + distance,
	};
}

function getMaximumDistance(queryLength: number): number {
	if (queryLength < 4) {
		return 0;
	}

	if (queryLength < 7) {
		return 1;
	}

	return 2;
}
