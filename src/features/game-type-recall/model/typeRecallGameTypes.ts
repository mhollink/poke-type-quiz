import type { GameStatus, ScoreBreakdown } from "~/features/game-shared";
import type { Pokemon } from "~/types";

export type PokemonType = Pokemon["types"][number];

export interface TypeRecallChallenge {
  readonly id: string;
  readonly pokemon: Pokemon;
  readonly shiny: boolean;
  readonly difficulty: number;
}

export interface TypeRecallAnswer {
  readonly types: readonly PokemonType[];
}

export type TypeRecallAnswerResult =
  | {
      readonly correct: false;
      readonly canonicalOrder: false;
    }
  | {
      readonly correct: true;
      readonly canonicalOrder: boolean;
    };

export interface CompletedTypeRecallRound {
  readonly challenge: TypeRecallChallenge;
  readonly answer: TypeRecallAnswer;
  readonly canonicalOrder: boolean;
  readonly answeredAt: number;
  readonly timeRemainingMs: number;
  readonly score: ScoreBreakdown;
}

export type TypeRecallGameOverReason =
  | "incorrect-answer"
  | "time-expired"
  | "no-challenges-left";

export interface TypeRecallGameState {
  readonly sessionId: string;
  readonly status: GameStatus;
  readonly score: number;
  readonly correctAnswers: number;
  readonly currentChallenge: TypeRecallChallenge | null;
  readonly startedAt: number | null;
  readonly roundEndsAt: number | null;
  readonly usedPokemonIds: ReadonlySet<Pokemon["id"]>;
  readonly completedRounds: readonly CompletedTypeRecallRound[];
  readonly lastScore: ScoreBreakdown | null;
  readonly highestMultiplier: number;
  readonly canonicalOrderAnswers: number;
  readonly gameOverReason: TypeRecallGameOverReason | null;
}

export interface TypeRecallAttemptRecord {
  readonly dateKey: string;
  readonly completedAt: number;
  readonly score: number;
  readonly correctAnswers: number;
  readonly canonicalOrderAnswers: number;
  readonly highestMultiplier: number;
}
