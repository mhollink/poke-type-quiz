import type { Move, Pokemon } from "../../../types";
import { dailyGameConfig } from "../dailyMoveGameConfig.ts";
import type {
	DailyMoveChallenge,
	DailyMoveOption,
	DailyMoveOptionSelection,
} from "../model/Round.ts";
import type { TypeEffectivenessLookup } from "../utils/effectiveness.ts";
import { createScopedRandom, shuffle } from "../utils/random.ts";
import { sampleWithoutReplacement } from "../utils/stablize.ts";
import { pickBestCandidate, pickRelativeCandidate } from "./candidates.ts";
import { createRankedMoveCandidates } from "./createDailyMoveRound.ts";

export function createDailyMoveChallenge(
	dateKey: string,
	pokemon: readonly Pokemon[],
	moves: readonly Move[],
	getEffectiveness: TypeEffectivenessLookup,
): DailyMoveChallenge {
	const selectedPokemon = selectDailyPokemon(dateKey, pokemon);

	const eligibleMoves = moves.toSorted((left, right) => left.nr - right.nr);

	const usedBestMoveIds = new Set<string>();

	const rounds = selectedPokemon.map((selectedPokemon, index) => {
		const selection = selectDailyMoveOptions(
			dateKey,
			index,
			selectedPokemon,
			eligibleMoves,
			getEffectiveness,
			usedBestMoveIds,
		);

		usedBestMoveIds.add(selection.bestMoveId);

		return {
			index,
			pokemon: selectedPokemon,
			options: selection.options,
			maxScore: Math.max(
				...selection.options.map((option) => option.score.score),
			),
		};
	});

	return {
		dateKey,
		rounds,
		maxScore: rounds.reduce((total, round) => total + round.maxScore, 0),
	};
}

function selectDailyPokemon(dateKey: string, pokemon: readonly Pokemon[]) {
	const eligiblePokemon = [...pokemon].sort(
		(left, right) => left.nr - right.nr,
	);

	return sampleWithoutReplacement(
		eligiblePokemon,
		dailyGameConfig.rounds,
		createScopedRandom(dateKey, "pokemon-selection"),
	);
}

function selectDailyMoveOptions(
	dateKey: string,
	roundIndex: number,
	pokemon: Pokemon,
	moves: readonly Move[],
	getEffectiveness: TypeEffectivenessLookup,
	usedBestMoveIds: ReadonlySet<string>,
): DailyMoveOptionSelection {
	const candidates = createRankedMoveCandidates(
		dateKey,
		roundIndex,
		pokemon,
		moves,
		getEffectiveness,
	);

	if (candidates.length < 4) {
		throw new Error("At least four move candidates are required");
	}

	const best = pickBestCandidate(
		candidates,
		usedBestMoveIds,
		createScopedRandom(dateKey, `round:${roundIndex}:best`),
	);

	const selected: DailyMoveOption[] = [best];
	let upperScoreExclusive = best.score.score;

	for (const tier of dailyGameConfig.tierConfig) {
		const option = pickRelativeCandidate(
			candidates,
			best.score.score,
			upperScoreExclusive,
			tier.targetRatio,
			selected,
			createScopedRandom(dateKey, `round:${roundIndex}:tier:${tier.id}`),
		);

		selected.push(option);
		upperScoreExclusive = option.score.score;
	}

	return {
		bestMoveId: best.move.id,
		options: shuffle(
			selected,
			createScopedRandom(dateKey, `round:${roundIndex}:option-order`),
		),
	};
}
