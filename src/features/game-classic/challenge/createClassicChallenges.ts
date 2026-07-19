import type { Pokemon, PokemonType } from "../../../types";
import type { TypeChallenge } from "../model/classicGameTypes";

export interface CreateClassicChallengeInput {
	readonly pokemon: readonly Pokemon[];
	readonly usedPokemonIds: ReadonlySet<string>;
	readonly previousChallenge: TypeChallenge | null;
	readonly random?: () => number;
	readonly createId?: () => string;
}

export interface ClassicChallengeResult {
	readonly challenge: TypeChallenge;
	readonly availableAnswerCount: number;
}

export function createClassicChallenge({
	pokemon,
	usedPokemonIds,
	previousChallenge,
	random = Math.random,
	createId = () => crypto.randomUUID(),
}: CreateClassicChallengeInput): ClassicChallengeResult | null {
	const availablePokemon = pokemon.filter(
		(candidate) => !usedPokemonIds.has(candidate.id),
	);

	const candidates = getChallengeCandidates(
		availablePokemon,
		previousChallenge,
	);

	if (candidates.length === 0) {
		return null;
	}

	const sortedCandidates = [...candidates].sort(
		(left, right) => left.availableAnswerCount - right.availableAnswerCount,
	);

	const difficultCandidatePool = sortedCandidates.slice(
		0,
		Math.max(1, Math.ceil(sortedCandidates.length / 2)),
	);

	const selectedIndex = Math.floor(random() * difficultCandidatePool.length);

	const selected = difficultCandidatePool[selectedIndex];

	return {
		challenge: {
			key: `${selected.type}-${createId()}`,
			type: selected.type,
		},
		availableAnswerCount: selected.availableAnswerCount,
	};
}

interface ChallengeCandidate {
	readonly type: PokemonType;
	readonly availableAnswerCount: number;
}

function getChallengeCandidates(
	pokemon: readonly Pokemon[],
	previousChallenge: TypeChallenge | null,
): readonly ChallengeCandidate[] {
	const types = Array.from(
		new Set(pokemon.flatMap((candidate) => candidate.types)),
	);

	return types
		.filter((type) => type !== previousChallenge?.type)
		.map((type) => ({
			type,
			availableAnswerCount: pokemon.filter((candidate) =>
				candidate.types.includes(type),
			).length,
		}))
		.filter((candidate) => candidate.availableAnswerCount > 0);
}
