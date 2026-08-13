import type {
  CompletedTypeRecallRound,
  TypeRecallChallenge,
  TypeRecallGameOverReason,
  TypeRecallGameState,
} from "./typeRecallGameTypes.ts";

export type TypeRecallGameAction =
  | {
      readonly type: "START_GAME";
      readonly sessionId: string;
      readonly challenge: TypeRecallChallenge;
      readonly startedAt: number;
      readonly roundEndsAt: number;
    }
  | {
      readonly type: "CORRECT_ANSWER";
      readonly round: CompletedTypeRecallRound;
      readonly nextChallenge: TypeRecallChallenge | null;
      readonly nextRoundEndsAt: number | null;
    }
  | {
      readonly type: "END_GAME";
      readonly reason: TypeRecallGameOverReason;
    };

export function createInitialTypeRecallGameState(): TypeRecallGameState {
  return {
    sessionId: "",
    status: "playing",
    score: 0,
    correctAnswers: 0,
    currentChallenge: null,
    startedAt: null,
    roundEndsAt: null,
    usedPokemonIds: new Set(),
    completedRounds: [],
    lastScore: null,
    highestMultiplier: 1,
    canonicalOrderAnswers: 0,
    gameOverReason: null,
  };
}

export function typeRecallGameReducer(
  state: TypeRecallGameState,
  action: TypeRecallGameAction,
): TypeRecallGameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...createInitialTypeRecallGameState(),
        sessionId: action.sessionId,
        currentChallenge: action.challenge,
        startedAt: action.startedAt,
        roundEndsAt: action.roundEndsAt,
      };

    case "CORRECT_ANSWER": {
      const usedPokemonIds = new Set(state.usedPokemonIds);
      usedPokemonIds.add(action.round.challenge.pokemon.id);

      const combinedMultiplier =
        action.round.score.speedMultiplier *
        action.round.score.difficultyMultiplier *
        action.round.score.streakMultiplier *
        action.round.score.precisionMultiplier;

      return {
        ...state,
        score: state.score + action.round.score.totalPoints,
        correctAnswers: state.correctAnswers + 1,
        currentChallenge: action.nextChallenge,
        roundEndsAt: action.nextRoundEndsAt,
        usedPokemonIds,
        completedRounds: [...state.completedRounds, action.round],
        lastScore: action.round.score,
        highestMultiplier: Math.max(
          state.highestMultiplier,
          combinedMultiplier,
        ),
        canonicalOrderAnswers:
          state.canonicalOrderAnswers +
          (action.round.challenge.pokemon.types.length > 1 &&
          action.round.canonicalOrder
            ? 1
            : 0),
      };
    }

    case "END_GAME":
      return {
        ...state,
        status: "game-over",
        roundEndsAt: null,
        gameOverReason: action.reason,
      };
  }
}
