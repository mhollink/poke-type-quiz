import type { PokemonType } from "../../../types";

export type ReversedAnswerResult =
	| {
			readonly correct: false;
			readonly canonicalOrder: false;
	  }
	| {
			readonly correct: true;
			readonly canonicalOrder: boolean;
	  };

export interface ReversedAnswer {
	readonly types: readonly PokemonType[];
}
