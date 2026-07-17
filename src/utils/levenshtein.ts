export function levenshteinDistance(source: string, target: string): number {
	if (source === target) {
		return 0;
	}

	if (source.length === 0) {
		return target.length;
	}

	if (target.length === 0) {
		return source.length;
	}

	let previousRow = Array.from(
		{ length: target.length + 1 },
		(_, index) => index,
	);

	for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex++) {
		const currentRow = [sourceIndex];

		for (let targetIndex = 1; targetIndex <= target.length; targetIndex++) {
			const insertionCost = currentRow[targetIndex - 1] + 1;

			const deletionCost = previousRow[targetIndex] + 1;

			const substitutionCost =
				previousRow[targetIndex - 1] +
				(source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1);

			currentRow[targetIndex] = Math.min(
				insertionCost,
				deletionCost,
				substitutionCost,
			);
		}

		previousRow = currentRow;
	}

	return previousRow[target.length];
}

export function normalizeSearchValue(value: string): string {
	return value
		.trim()
		.toLocaleLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[^a-z0-9]/g, "");
}
