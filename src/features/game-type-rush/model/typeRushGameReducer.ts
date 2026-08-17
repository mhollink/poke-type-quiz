import { createTypeKey } from "../challenge/createTypeRushChallenge.ts";
import { typeRushGameConfig } from "../typeRushGameConfig.ts";
import type {
  CompletedTypeRushAnswer,
  TypeRushChallenge,
  TypeRushGameOverReason,
  TypeRushGameState,
} from "./typeRushGameTypes.ts";

export type TypeRushGameAction =
  | {
      readonly type: "START_GAME";
      readonly dateKey: string;
      readonly challenge: TypeRushChallenge;
      readonly startedAt: number;
      readonly runEndsAt: number;
    }
  | {
      readonly type: "CORRECT_ANSWER";
      readonly answer: CompletedTypeRushAnswer;
      readonly nextChallenge: TypeRushChallenge | null;
    }
  | {
      readonly type: "RESET_SKIPS";
      readonly nextChallenge: TypeRushChallenge | null;
    }
  | {
      readonly type: "INCORRECT_ANSWER";
    }
  | {
      readonly type: "SKIP_ROUND";
      readonly skippedRound: TypeRushChallenge | null;
      readonly nextChallenge: TypeRushChallenge | null;
    }
  | {
      readonly type: "END_GAME";
      readonly reason: TypeRushGameOverReason;
    };

export function createInitialTypeRushGameState(): TypeRushGameState {
  return {
    dateKey: "",
    status: "playing",
    score: 0,
    correctAnswers: 0,
    skippedRounds: 0,
    mistakes: 0,
    streak: 0,
    highestStreak: 0,
    currentChallenge: null,
    startedAt: null,
    runEndsAt: null,
    skippedTypes: new Set(),
    usedPokemonIds: new Set(),
    shinies: new Set(),
    completedAnswers: [],
    lastScore: null,
    gameOverReason: null,
  };
}

export function typeRushGameReducer(
  state: TypeRushGameState,
  action: TypeRushGameAction,
): TypeRushGameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...createInitialTypeRushGameState(),
        dateKey: action.dateKey,
        currentChallenge: action.challenge,
        startedAt: action.startedAt,
        runEndsAt: action.runEndsAt,
      };

    case "CORRECT_ANSWER": {
      const usedPokemonIds = new Set(state.usedPokemonIds);
      usedPokemonIds.add(action.answer.pokemon.id);

      const shinies = new Set(state.shinies);
      if (action.answer.pokemon.shiny) {
        shinies.add(action.answer.pokemon.id);
      }

      const nextStreak = state.streak + 1;
      const nextEndTime = Math.min(
        (state.runEndsAt ?? Date.now()) +
          typeRushGameConfig.correctAnswerTimeBonus * 1000,
        Date.now() + typeRushGameConfig.durationMs - 1000,
      );

      return {
        ...state,
        score: state.score + action.answer.score.totalPoints,
        correctAnswers: state.correctAnswers + 1,
        streak: nextStreak,
        highestStreak: Math.max(state.highestStreak, nextStreak),
        currentChallenge: action.nextChallenge,
        usedPokemonIds,
        shinies,
        completedAnswers: [...state.completedAnswers, action.answer],
        lastScore: action.answer.score,
        runEndsAt: nextEndTime,
      };
    }
    case "SKIP_ROUND": {
      const skippedTypes = new Set(state.skippedTypes);
      if (action.skippedRound) {
        skippedTypes.add(createTypeKey(action.skippedRound.types));
      }

      const nextEndTime =
        (state.runEndsAt ?? Date.now()) -
        typeRushGameConfig.skipPenaltySec * 1000;
      return {
        ...state,
        streak: 0,
        skippedRounds: state.skippedRounds + 1,
        skippedTypes: skippedTypes,
        currentChallenge: action.nextChallenge,
        runEndsAt: nextEndTime,
      };
    }
    case "RESET_SKIPS": {
      return {
        ...state,
        currentChallenge: action.nextChallenge,
        skippedTypes: new Set(),
      };
    }

    case "INCORRECT_ANSWER": {
      const nextEndTime =
        (state.runEndsAt ?? Date.now()) -
        typeRushGameConfig.incorrectAnswerTimePenalty * 1000;
      return {
        ...state,
        mistakes: state.mistakes + 1,
        streak: 0,
        lastScore: null,
        runEndsAt: nextEndTime,
      };
    }

    case "END_GAME":
      return {
        ...state,
        status: "game-over",
        runEndsAt: null,
        gameOverReason: action.reason,
      };
  }
}
