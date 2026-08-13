import type { Pokemon, PokemonType } from "../../../types";
import type { GameStatus } from "../../game-shared/model/gameStatus";
import type { ScoreBreakdown } from "../../game-shared/model/scoreBreakdown";

export interface TypeChallenge {
  readonly key: string;
  readonly type: PokemonType;
}

export type SurvivalGameOverReason =
  | "incorrect-answer"
  | "time-expired"
  | "no-challenges-left";

export interface CompletedSurvivalRound {
  readonly challenge: TypeChallenge;
  readonly answer: Pokemon;
  readonly timeRemainingMs: number;
  readonly score: ScoreBreakdown;
}

export interface TypeSurvivalGameState {
  readonly sessionId: string;
  readonly status: GameStatus;
  readonly score: number;
  readonly correctAnswers: number;
  readonly currentChallenge: TypeChallenge | null;
  readonly startedAt: number | null;
  readonly roundEndsAt: number | null;
  readonly usedPokemonIds: ReadonlySet<string>;
  readonly completedRounds: readonly CompletedSurvivalRound[];
  readonly lastScore: ScoreBreakdown | null;
  readonly highestMultiplier: number;
  readonly gameOverReason: SurvivalGameOverReason | null;
}

export interface DailyAttemptRecord {
  readonly dateKey: string;
  readonly completedAt: number;
  readonly score: number;
  readonly correctAnswers: number;
  readonly highestMultiplier: number;
}
