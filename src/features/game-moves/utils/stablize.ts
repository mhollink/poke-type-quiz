import type { RandomSource } from "./random.ts";

export function sampleWithoutReplacement<T>(
	items: readonly T[],
	amount: number,
	random: RandomSource,
): T[] {
	if (amount > items.length) {
		throw new Error(
			`Cannot select ${amount} items from ${items.length} available items`,
		);
	}

	const available = [...items];
	const selected: T[] = [];

	for (let index = 0; index < amount; index += 1) {
		const selectedIndex = Math.floor(random() * available.length);

		const [item] = available.splice(selectedIndex, 1);
		selected.push(item);
	}

	return selected;
}
