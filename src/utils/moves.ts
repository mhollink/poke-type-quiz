import type { Move, MoveClassifier, PokemonType } from "../types";
import { CLASSIFIERS, POKEMON_TYPES } from "../types";
import { loadMoveData } from "./loadMoveData.ts";

const validTypes = new Set<string>(POKEMON_TYPES);
const validClassifiers = new Set<string>(CLASSIFIERS);

function isPokemonType(value: string): value is PokemonType {
	return validTypes.has(value);
}

function isMoveClassifier(value: string): value is MoveClassifier {
	return validClassifiers.has(value);
}

function parseMove(value: unknown): Move {
	if (!value || typeof value !== "object") {
		throw new Error("Invalid Move entry");
	}

	const candidate = value as Record<string, unknown>;

	if (
		typeof candidate.nr !== "number" ||
		typeof candidate.gen !== "number" ||
		typeof candidate.id !== "string" ||
		typeof candidate.name !== "string" ||
		typeof candidate.classifier !== "string" ||
		typeof candidate.type !== "string" ||
		typeof candidate.accuracy !== "number" ||
		typeof candidate.power !== "number" ||
		typeof candidate.crit !== "number" ||
		typeof candidate.minHits !== "number" ||
		typeof candidate.maxHits !== "number"
	) {
		console.warn("Invalid Move entry:", candidate);
		throw new Error("Invalid Move entry");
	}

	if (!isMoveClassifier(candidate.classifier)) {
		throw new Error(`Move ${candidate.name} contains an invalid classifier`);
	}

	if (!isPokemonType(candidate.type)) {
		throw new Error(`Move ${candidate.name} contains an invalid type`);
	}

	return {
		nr: candidate.nr,
		id: candidate.id,
		name: candidate.name,
		gen: candidate.gen,
		classifier: candidate.classifier,
		type: candidate.type,
		power: candidate.power,
		accuracy: candidate.accuracy,
		crit: candidate.crit,
		maxHits: candidate.maxHits,
		minHits: candidate.minHits,
	};
}

export const moveData: readonly Move[] = ((await loadMoveData()) as unknown[])
	.map(parseMove)
	.filter(
		(pokemon, index, self) =>
			index === self.findIndex((candidate) => candidate.nr === pokemon.nr),
	)
	.sort((left, right) => left.nr - right.nr);
