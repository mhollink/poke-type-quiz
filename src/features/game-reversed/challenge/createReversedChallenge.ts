import type { Pokemon } from "../../../types";
import type { ReversedChallenge } from "../model/reversedGameTypes";
import { reversedGameConfig } from "../reversedGameConfig.ts";

export interface CreateReversedChallengeInput {
	readonly pokemon: readonly Pokemon[];
	readonly usedPokemonIds: ReadonlySet<Pokemon["id"]>;
	readonly challengeIndex: number;
	readonly random?: () => number;
	readonly createId?: () => string;
}

interface ChallengeCandidate {
	readonly pokemon: Pokemon;
	readonly difficulty: number;
}

export function createReversedChallenge({
	pokemon,
	usedPokemonIds,
	challengeIndex,
	random = Math.random,
	createId = () => crypto.randomUUID(),
}: CreateReversedChallengeInput): ReversedChallenge | null {
	const candidates = pokemon
		.filter((candidate) => !usedPokemonIds.has(candidate.id))
		.map((candidate) => ({
			pokemon: candidate,
			difficulty: candidate.types.length > 1 ? 0.35 : 0,
		}));

	if (candidates.length === 0) {
		return null;
	}

	const singleTypeCandidates = candidates.filter(
		(candidate) => candidate.pokemon.types.length === 1,
	);

	const dualTypeCandidates = candidates.filter(
		(candidate) => candidate.pokemon.types.length === 2,
	);

	const selectedTypePool = selectTypePool({
		singleTypeCandidates,
		dualTypeCandidates,
		random,
	});

	const selected = selectCandidateByProgression({
		candidates: selectedTypePool,
		challengeIndex,
		random,
	});

	return {
		id: createId(),
		pokemon: selected.pokemon,
		shiny: random() < reversedGameConfig.shinyChance,
		difficulty: selected.difficulty,
	};
}

interface SelectTypePoolInput {
	readonly singleTypeCandidates: readonly ChallengeCandidate[];
	readonly dualTypeCandidates: readonly ChallengeCandidate[];
	readonly random: () => number;
}

function selectTypePool({
	singleTypeCandidates,
	dualTypeCandidates,
	random,
}: SelectTypePoolInput): readonly ChallengeCandidate[] {
	if (singleTypeCandidates.length === 0) {
		return dualTypeCandidates;
	}

	if (dualTypeCandidates.length === 0) {
		return singleTypeCandidates;
	}

	return random() < reversedGameConfig.dualTypeChance
		? dualTypeCandidates
		: singleTypeCandidates;
}

interface SelectCandidateByProgressionInput {
	readonly candidates: readonly ChallengeCandidate[];
	readonly challengeIndex: number;
	readonly random: () => number;
}

function selectCandidateByProgression({
	candidates,
	challengeIndex,
	random,
}: SelectCandidateByProgressionInput): ChallengeCandidate {
	const sortedCandidates = [...candidates].sort((left, right) => {
		if (left.difficulty !== right.difficulty) {
			return left.difficulty - right.difficulty;
		}

		return left.pokemon.name.localeCompare(right.pokemon.name);
	});

	const progression = Math.min(
		1,
		challengeIndex / Math.max(1, sortedCandidates.length - 1),
	);

	const targetIndex = Math.round(progression * (sortedCandidates.length - 1));

	const selectionRadius = Math.max(
		1,
		Math.ceil(sortedCandidates.length * 0.15),
	);

	const minimumIndex = Math.max(0, targetIndex - selectionRadius);
	const maximumIndex = Math.min(
		sortedCandidates.length - 1,
		targetIndex + selectionRadius,
	);

	const selectedIndex =
		minimumIndex + Math.floor(random() * (maximumIndex - minimumIndex + 1));

	return sortedCandidates[selectedIndex];
}
