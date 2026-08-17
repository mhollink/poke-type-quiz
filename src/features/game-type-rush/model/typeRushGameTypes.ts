import type { GameStatus, ScoreBreakdown } from "~/features/game-shared";
import type { Pokemon, PokemonType } from "~/types";

export interface TypeRushChallenge {
  readonly id: string;
  readonly types: readonly PokemonType[];
  readonly difficulty: number;
  readonly availableAnswerCount: number;
}

export interface CompletedTypeRushAnswer {
  readonly challenge: TypeRushChallenge;
  readonly pokemon: Pokemon;
  readonly score: ScoreBreakdown;
  readonly answeredAt: number;
}

export type TypeRushGameOverReason = "time-expired" | "no-challenges-left";

export interface TypeRushGameState {
  readonly dateKey: string;
  readonly status: GameStatus;
  readonly score: number;
  readonly correctAnswers: number;
  readonly skippedRounds: number;
  readonly mistakes: number;
  readonly streak: number;
  readonly highestStreak: number;
  readonly currentChallenge: TypeRushChallenge | null;
  readonly startedAt: number | null;
  readonly runEndsAt: number | null;
  readonly skippedTypes: ReadonlySet<string>;
  readonly usedPokemonIds: ReadonlySet<Pokemon["id"]>;
  readonly shinies: ReadonlySet<Pokemon["id"]>;
  readonly completedAnswers: readonly CompletedTypeRushAnswer[];
  readonly lastScore: ScoreBreakdown | null;
  readonly gameOverReason: TypeRushGameOverReason | null;
}

export interface TypeRushAttemptRecord {
  readonly dateKey: string;
  readonly startedAt: number;
  readonly completedAt: number | null;
  readonly score: number;
  readonly correctAnswers: number;
  readonly mistakes: number;
  readonly highestStreak: number;
}
