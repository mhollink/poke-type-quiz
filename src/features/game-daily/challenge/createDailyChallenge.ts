import type { Pokemon, PokemonType } from "../../../types";
import type { DailyChallenge } from "../model/dailyGameTypes";
import type { RandomSource } from "./createSeededRandom";

export interface CreateDailyChallengeInput {
	readonly pokemon: readonly Pokemon[];
	readonly usedPokemonIds: ReadonlySet<Pokemon["id"]>;
	readonly previousChallenge: DailyChallenge | null;
	readonly challengeIndex: number;
	readonly random: RandomSource;
}

interface ChallengeCandidate {
	readonly types: readonly PokemonType[];
	readonly key: string;
	readonly availableAnswerCount: number;
	readonly scarcityDifficulty: number;
}

export function createDailyChallenge({
	pokemon,
	usedPokemonIds,
	previousChallenge,
	challengeIndex,
	random,
}: CreateDailyChallengeInput): DailyChallenge | null {
	const candidates = createCandidates(pokemon, usedPokemonIds).filter(
		(candidate) => candidate.key !== createTypeKey(previousChallenge?.types),
	);

	if (candidates.length === 0) {
		return null;
	}

	const sortedCandidates = [...candidates].sort((left, right) => {
		if (left.scarcityDifficulty !== right.scarcityDifficulty) {
			return left.scarcityDifficulty - right.scarcityDifficulty;
		}

		return left.key.localeCompare(right.key);
	});

	const progression = Math.min(
		1,
		challengeIndex / Math.max(1, sortedCandidates.length - 1),
	);

	const targetIndex = Math.round(progression * (sortedCandidates.length - 1));

	const range = Math.max(1, Math.ceil(sortedCandidates.length * 0.2));
	const minimumIndex = Math.max(0, targetIndex - range);
	const maximumIndex = Math.min(
		sortedCandidates.length - 1,
		targetIndex + range,
	);

	const selectedIndex =
		minimumIndex + Math.floor(random() * (maximumIndex - minimumIndex + 1));

	const selected = sortedCandidates[selectedIndex];

	return {
		id: `${challengeIndex}:${selected.key}`,
		types: selected.types,
		difficulty: selected.scarcityDifficulty,
		availableAnswerCount: selected.availableAnswerCount,
	};
}

function createCandidates(
	pokemon: readonly Pokemon[],
	usedPokemonIds: ReadonlySet<Pokemon["id"]>,
): readonly ChallengeCandidate[] {
	const groupedPokemon = new Map<string, Pokemon[]>();

	for (const candidate of pokemon) {
		if (usedPokemonIds.has(candidate.id)) {
			continue;
		}

		const key = createTypeKey(candidate.types);
		const existingGroup = groupedPokemon.get(key) ?? [];

		groupedPokemon.set(key, [...existingGroup, candidate]);
	}

	const maximumAnswerCount = Math.max(
		1,
		...Array.from(groupedPokemon.values(), (group) => group.length),
	);

	return Array.from(groupedPokemon.entries(), ([key, matchingPokemon]) => {
		const types = key.split("|") as PokemonType[];

		return {
			key,
			types,
			availableAnswerCount: matchingPokemon.length,
			scarcityDifficulty: 1 - matchingPokemon.length / maximumAnswerCount,
		};
	});
}

function createTypeKey(types: readonly string[] | undefined): string {
	return types?.join("|") ?? "";
}
