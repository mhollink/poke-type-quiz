import type { Pokemon } from "../../../types";
import type { DailyChallenge } from "../model/dailyGameTypes";

export function matchesDailyChallenge(
	pokemon: Pokemon,
	challenge: DailyChallenge,
): boolean {
	if (pokemon.types.length !== challenge.types.length) {
		return false;
	}

	return challenge.types.every((type, index) => pokemon.types[index] === type);
}
