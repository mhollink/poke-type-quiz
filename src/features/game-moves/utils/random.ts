import { createSeededRandom } from "../../game-daily/challenge/createSeededRandom.ts";

export type RandomSource = () => number;

export function createScopedRandom(
	dateKey: string,
	scope: string,
): RandomSource {
	const seed = `move-daily:v1:${dateKey}:${scope}`;
	const state = hashSeed(seed);
	return createSeededRandom(state);
}

function hashSeed(value: string): number {
	let hash = 2166136261;

	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
}

export function randomIntegerInclusive(
	minimum: number,
	maximum: number,
	random: RandomSource,
): number {
	if (!Number.isInteger(minimum) || !Number.isInteger(maximum)) {
		throw new Error("Hit boundaries must be integers");
	}

	if (minimum < 1) {
		throw new Error("Minimum hits must be at least 1");
	}

	if (maximum < minimum) {
		throw new Error(
			"Maximum hits must be greater than or equal to minimum hits",
		);
	}

	return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}
