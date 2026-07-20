import type { Pokemon } from "../../../types/pokemon";
import type { GameStatus } from "../../game-shared/model/gameStatus";
import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";

export type PokemonType = Pokemon["types"][number];

export interface ReversedChallenge {
	readonly id: string;
	readonly pokemon: Pokemon;
	readonly shiny: boolean;
	readonly difficulty: number;
}

export interface ReversedAnswer {
	readonly types: readonly PokemonType[];
}

export type ReversedAnswerResult =
	| {
			readonly correct: false;
			readonly canonicalOrder: false;
	  }
	| {
			readonly correct: true;
			readonly canonicalOrder: boolean;
	  };

export interface CompletedReversedRound {
	readonly challenge: ReversedChallenge;
	readonly answer: ReversedAnswer;
	readonly canonicalOrder: boolean;
	readonly answeredAt: number;
	readonly timeRemainingMs: number;
	readonly score: ScoreBreakdown;
}

export type ReversedGameOverReason =
	| "incorrect-answer"
	| "time-expired"
	| "no-challenges-left";

export interface ReversedGameState {
	readonly sessionId: string;
	readonly status: GameStatus;
	readonly score: number;
	readonly correctAnswers: number;
	readonly currentChallenge: ReversedChallenge | null;
	readonly startedAt: number | null;
	readonly roundEndsAt: number | null;
	readonly usedPokemonIds: ReadonlySet<Pokemon["id"]>;
	readonly completedRounds: readonly CompletedReversedRound[];
	readonly lastScore: ScoreBreakdown | null;
	readonly highestMultiplier: number;
	readonly canonicalOrderAnswers: number;
	readonly gameOverReason: ReversedGameOverReason | null;
}
