import type { Pokemon } from "../../../types";
import type { DailyChallenge } from "../model/dailyGameTypes";

export type DailyChallengeMatch = "match" | "wrong-types" | "incorrect-order";

export function matchesDailyChallenge(
	pokemon: Pokemon,
	challenge: DailyChallenge,
): DailyChallengeMatch {
	if (pokemon.types.length !== challenge.types.length) {
		return "wrong-types";
	}

	const exactMatch = challenge.types.every(
		(type, index) => pokemon.types[index] === type,
	);

	if (exactMatch) {
		return "match";
	}

	const hasSameTypes = challenge.types.every((type) =>
		pokemon.types.includes(type),
	);

	if (hasSameTypes) {
		return "incorrect-order";
	}

	return "wrong-types";
}
