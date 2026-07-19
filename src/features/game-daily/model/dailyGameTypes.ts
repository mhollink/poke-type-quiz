import type { Pokemon } from "../../../types";
import type { GameStatus } from "../../game-shared/model/gameStatus";
import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";

export interface DailyChallenge {
	readonly index: number;
	readonly pokemon: Pokemon;
	readonly difficulty: number;
}

export interface DailyGameState {
	readonly dateKey: string;
	readonly status: GameStatus;
	readonly runEndsAt: number;
	readonly score: number;
	readonly correctAnswers: number;
	readonly mistakes: number;
	readonly streak: number;
	readonly highestStreak: number;
	readonly currentChallenge: DailyChallenge | null;
	readonly completedPokemonIds: ReadonlySet<string>;
	readonly lastScore: ScoreBreakdown | null;
}
