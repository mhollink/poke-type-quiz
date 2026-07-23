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

	if (maximum < minimum) {
		throw new Error(
			"Maximum hits must be greater than or equal to minimum hits",
		);
	}

	if (minimum === maximum) {
		return minimum;
	}

	return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

export function pickRandomItem<T>(
	items: readonly T[],
	random: RandomSource,
): T {
	if (items.length === 0) {
		throw new Error("Cannot select from an empty collection");
	}

	if (items.length === 1) {
		return items[0];
	}

	const index = randomIntegerInclusive(0, items.length - 1, random);

	return items[index];
}

export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
	const shuffled = [...items];

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = randomIntegerInclusive(0, index, random);

		[shuffled[index], shuffled[swapIndex]] = [
			shuffled[swapIndex],
			shuffled[index],
		];
	}

	return shuffled;
}
