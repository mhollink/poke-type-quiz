import type { Pokemon, PokemonType } from "../../../types/pokemon";
import type { GameStatus } from "../../game-shared/model/gameStatus";
import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";

export interface DailyChallenge {
	readonly id: string;
	readonly types: readonly PokemonType[];
	readonly difficulty: number;
	readonly availableAnswerCount: number;
}

export interface CompletedDailyAnswer {
	readonly challenge: DailyChallenge;
	readonly pokemon: Pokemon;
	readonly score: ScoreBreakdown;
	readonly answeredAt: number;
}

export type DailyGameOverReason = "time-expired" | "no-challenges-left";

export interface DailyGameState {
	readonly dateKey: string;
	readonly status: GameStatus;
	readonly score: number;
	readonly correctAnswers: number;
	readonly mistakes: number;
	readonly streak: number;
	readonly highestStreak: number;
	readonly currentChallenge: DailyChallenge | null;
	readonly startedAt: number | null;
	readonly runEndsAt: number | null;
	readonly usedPokemonIds: ReadonlySet<Pokemon["id"]>;
	readonly completedAnswers: readonly CompletedDailyAnswer[];
	readonly lastScore: ScoreBreakdown | null;
	readonly gameOverReason: DailyGameOverReason | null;
}

export interface DailyAttemptRecord {
	readonly dateKey: string;
	readonly startedAt: number;
	readonly completedAt: number | null;
	readonly score: number;
	readonly correctAnswers: number;
	readonly mistakes: number;
	readonly highestStreak: number;
}
