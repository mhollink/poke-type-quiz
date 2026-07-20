import type { Pokemon, PokemonType } from "../../../types";
import type { GameStatus } from "../../game-shared/model/gameStatus";
import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";

export interface TypeChallenge {
	readonly key: string;
	readonly type: PokemonType;
}

export type ClassicGameOverReason =
	| "incorrect-answer"
	| "time-expired"
	| "no-challenges-left";

export interface CompletedClassicRound {
	readonly challenge: TypeChallenge;
	readonly answer: Pokemon;
	readonly timeRemainingMs: number;
	readonly score: ScoreBreakdown;
}

export interface ClassicGameState {
	readonly sessionId: string;
	readonly status: GameStatus;
	readonly score: number;
	readonly correctAnswers: number;
	readonly currentChallenge: TypeChallenge | null;
	readonly startedAt: number | null;
	readonly roundEndsAt: number | null;
	readonly usedPokemonIds: ReadonlySet<string>;
	readonly completedRounds: readonly CompletedClassicRound[];
	readonly lastScore: ScoreBreakdown | null;
	readonly highestMultiplier: number;
	readonly gameOverReason: ClassicGameOverReason | null;
}
