import type { Pokemon } from "../../../types/pokemon";
import type { ReversedChallenge } from "../model/reversedGameTypes";
import { reversedGameConfig } from "../reversedGameConfig.ts";

export interface CreateReversedChallengeInput {
	readonly pokemon: readonly Pokemon[];
	readonly usedPokemonIds: ReadonlySet<Pokemon["id"]>;
	readonly challengeIndex: number;
	readonly random?: () => number;
	readonly createId?: () => string;
}

export function createReversedChallenge({
	pokemon,
	usedPokemonIds,
	challengeIndex,
	random = Math.random,
	createId = createChallengeId,
}: CreateReversedChallengeInput): ReversedChallenge | null {
	const candidates = pokemon
		.filter((candidate) => !usedPokemonIds.has(candidate.id))
		.map((candidate) => ({
			pokemon: candidate,
			difficulty: calculatePokemonDifficulty(candidate),
		}))
		.sort((left, right) => {
			if (left.difficulty !== right.difficulty) {
				return left.difficulty - right.difficulty;
			}

			return left.pokemon.name.localeCompare(right.pokemon.name);
		});

	if (candidates.length === 0) {
		return null;
	}

	const progression = Math.min(
		1,
		challengeIndex / Math.max(1, candidates.length - 1),
	);

	const targetIndex = Math.round(progression * (candidates.length - 1));

	const selectionRadius = Math.max(1, Math.ceil(candidates.length * 0.15));

	const minimumIndex = Math.max(0, targetIndex - selectionRadius);
	const maximumIndex = Math.min(
		candidates.length - 1,
		targetIndex + selectionRadius,
	);

	const selectedIndex =
		minimumIndex + Math.floor(random() * (maximumIndex - minimumIndex + 1));

	const selected = candidates[selectedIndex];
	const shiny = random() < reversedGameConfig.shinyChance;

	return {
		id: createId(),
		pokemon: selected.pokemon,
		shiny: shiny,
		difficulty: selected.difficulty,
	};
}

function calculatePokemonDifficulty(pokemon: Pokemon): number {
	const typeDifficulty = pokemon.types.length === 2 ? 0.35 : 0;

	const generation = "gen" in pokemon ? Number(pokemon.gen) : 1;

	const generationDifficulty = Math.min(
		0.4,
		Math.max(0, generation - 1) * 0.05,
	);

	return Math.min(1, typeDifficulty + generationDifficulty);
}

function createChallengeId(): string {
	if (typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
