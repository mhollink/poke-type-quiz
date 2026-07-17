import type {
	ChallengeKey,
	TypeChallenge,
	UsedAnswersByChallenge,
} from "../types/game";
import type { Pokemon, PokemonType } from "../types/pokemon";

export function createChallengeKey(
	types: readonly PokemonType[],
): ChallengeKey {
	return [...types].sort().join(":");
}

export function createChallenges(
	pokemon: readonly Pokemon[],
): readonly TypeChallenge[] {
	const groupedPokemon = new Map<ChallengeKey, Pokemon[]>();

	for (const candidate of pokemon) {
		const key = createChallengeKey(candidate.types);
		const existing = groupedPokemon.get(key) ?? [];

		existing.push(candidate);
		groupedPokemon.set(key, existing);
	}

	return [...groupedPokemon.entries()].map(([key, matchingPokemon]) => ({
		key,
		types: [...matchingPokemon[0].types],
		pokemonIds: matchingPokemon.map((pokemon) => pokemon.id),
	}));
}

export function getAvailablePokemonIds(
	challenge: TypeChallenge,
	usedAnswersByChallenge: UsedAnswersByChallenge,
): string[] {
	const usedIds = new Set(usedAnswersByChallenge[challenge.key] ?? []);

	return challenge.pokemonIds.filter((pokemonId) => !usedIds.has(pokemonId));
}

export function selectRandomChallenge(
	challenges: readonly TypeChallenge[],
	usedAnswersByChallenge: UsedAnswersByChallenge,
	random: () => number = Math.random,
): TypeChallenge | null {
	const eligibleChallenges = challenges.filter(
		(challenge) =>
			getAvailablePokemonIds(challenge, usedAnswersByChallenge).length > 0,
	);

	if (eligibleChallenges.length === 0) {
		return null;
	}

	const index = Math.floor(random() * eligibleChallenges.length);

	return eligibleChallenges[index];
}

export function pokemonMatchesChallenge(
	pokemon: Pokemon,
	challenge: TypeChallenge,
): boolean {
	return createChallengeKey(pokemon.types) === challenge.key;
}

export function getValidPokemonForChallenge(
	pokemon: readonly Pokemon[],
	challenge: TypeChallenge,
): Pokemon[] {
	const challengeTypes = [...challenge.types].sort();

	return pokemon.filter((candidate) => {
		const candidateTypes = [...candidate.types].sort();

		return (
			candidateTypes.length === challengeTypes.length &&
			candidateTypes.every((type, index) => type === challengeTypes[index])
		);
	});
}
