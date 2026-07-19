import type {
	PokemonType,
	ReversedAnswer,
	ReversedAnswerResult,
} from "./reversedGameTypes";

export function validateReversedAnswer(
	answer: ReversedAnswer,
	expectedTypes: readonly PokemonType[],
): ReversedAnswerResult {
	if (answer.types.length !== expectedTypes.length) {
		return {
			correct: false,
			canonicalOrder: false,
		};
	}

	const canonicalOrder = answer.types.every(
		(type, index) => type === expectedTypes[index],
	);

	if (canonicalOrder) {
		return {
			correct: true,
			canonicalOrder: true,
		};
	}

	const submittedTypes = new Set(answer.types);
	const expectedTypeSet = new Set(expectedTypes);

	const sameTypes =
		submittedTypes.size === expectedTypeSet.size &&
		[...submittedTypes].every((type) => expectedTypeSet.has(type));

	return {
		correct: sameTypes,
		canonicalOrder: false,
	};
}
