import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import type { Pokemon } from "../../../types/pokemon";
import { playPokemonCry } from "../../../utils";
import {
  analytics,
  trackGameCompleted,
  trackGameStarted,
} from "../../analytics";
import { createDailyDateKey } from "../../game-type-rush/challenge/createDailySeed.ts";
import { localPokedexRepository } from "../../pokedex/storage/pokedexRepository.ts";
import { useSoundLevel } from "../../sound/SoundPreferencesProvider.tsx";
import { createTypeRecallChallenge } from "../challenge/createTypeRecallChallenge.ts";
import {
  createInitialTypeRecallGameState,
  typeRecallGameReducer,
} from "../model/typeRecallGameReducer.ts";
import type {
  PokemonType,
  TypeRecallAnswer,
  TypeRecallGameOverReason,
  TypeRecallGameState,
} from "../model/typeRecallGameTypes.ts";
import { validateTypeRecallAnswer } from "../model/validateTypeRecallAnswer.ts";
import { calculateTypeRecallScore } from "../scoring/calculateTypeRecallScore.ts";
import { typeRecallAttemptRepository } from "../storage/typeRecallAttemptRepository.ts";
import { typeRecallGameConfig } from "../typeRecallGameConfig.ts";

const timerIntervalMs = 100;

export interface TypeRecallGameDependencies {
  readonly now: () => number;
  readonly random: () => number;
  readonly createId: () => string;
}

const defaultDependencies: TypeRecallGameDependencies = {
  now: Date.now,
  random: Math.random,
  createId: createId,
};

export interface UseTypeRecallGameResult {
  readonly state: TypeRecallGameState;
  readonly availableTypes: readonly PokemonType[];
  readonly timeRemainingMs: number;
  readonly timeRemainingSeconds: number;
  readonly timerProgress: number;

  readonly submitAnswer: (types: readonly PokemonType[]) => void;

  readonly startGame: () => void;
}

export function useTypeRecallGame(
  pokemon: readonly Pokemon[],
  dependencies: TypeRecallGameDependencies = defaultDependencies,
): UseTypeRecallGameResult {
  const sound = useSoundLevel();
  const [state, dispatch] = useReducer(
    typeRecallGameReducer,
    undefined,
    createInitialTypeRecallGameState,
  );

  const [now, setNow] = useState(dependencies.now);

  const roundResolvedRef = useRef(false);

  const availableTypes = useMemo(
    () =>
      Array.from(new Set(pokemon.flatMap((candidate) => candidate.types))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [pokemon],
  );

  const timeRemainingMs = useMemo(() => {
    if (
      state.status !== "playing" ||
      state.roundEndsAt === null ||
      state.currentChallenge === null
    ) {
      return 0;
    }

    return Math.max(0, state.roundEndsAt - now);
  }, [now, state.currentChallenge, state.roundEndsAt, state.status]);

  const timeRemainingSeconds = Math.ceil(timeRemainingMs / 1_000);

  const timerProgress = clamp(
    timeRemainingMs / typeRecallGameConfig.roundDurationMs,
    0,
    1,
  );

  const saveGameResult = useCallback(() => {
    typeRecallAttemptRepository.save({
      dateKey: createDailyDateKey(
        state.startedAt ? new Date(state.startedAt) : new Date(),
      ),
      completedAt: state.roundEndsAt ?? Date.now(),
      score: state.score,
      correctAnswers: state.correctAnswers,
      canonicalOrderAnswers: state.canonicalOrderAnswers,
      highestMultiplier: state.highestMultiplier,
    });

    const pokemon = state.completedRounds.map(
      (round) => round.challenge.pokemon,
    );
    localPokedexRepository.unlock(pokemon.map((p) => p.id));
    localPokedexRepository.unlock(
      pokemon.filter((p) => p.shiny).map((p) => p.id),
      true,
    );
  }, [state]);

  const endGame = useCallback(
    (reason: TypeRecallGameOverReason): void => {
      if (roundResolvedRef.current) {
        return;
      }

      roundResolvedRef.current = true;

      dispatch({
        type: "END_GAME",
        reason,
      });
      saveGameResult();
      trackGameCompleted(analytics, {
        mode: "type_recall",
        startedAt: state.startedAt ?? now,
        completedAt: now,
        correctAnswers: state.correctAnswers,
        mistakes: reason === "incorrect-answer" ? 1 : 0,
        score: state.score,
      });
    },
    [now, state.startedAt, state.correctAnswers, state.score],
  );

  const startGame = useCallback((): void => {
    const firstChallenge = createTypeRecallChallenge({
      pokemon,
      usedPokemonIds: new Set(),
      challengeIndex: 0,
      random: dependencies.random,
      createId: dependencies.createId,
    });

    if (!firstChallenge) {
      dispatch({
        type: "END_GAME",
        reason: "no-challenges-left",
      });
      saveGameResult();
      trackGameCompleted(analytics, {
        mode: "type_recall",
        startedAt: 0,
        completedAt: 0,
        correctAnswers: 0,
        mistakes: 0,
        score: 0,
      });
      return;
    }

    const startedAt = dependencies.now();

    roundResolvedRef.current = false;
    setNow(startedAt);

    dispatch({
      type: "START_GAME",
      sessionId: dependencies.createId(),
      challenge: firstChallenge,
      startedAt,
      roundEndsAt: startedAt + typeRecallGameConfig.roundDurationMs,
    });
    trackGameStarted(analytics, { mode: "type_recall", startedAt });
  }, [dependencies, pokemon]);

  const submitAnswer = useCallback(
    (types: readonly PokemonType[]): void => {
      if (
        state.status !== "playing" ||
        state.currentChallenge === null ||
        state.roundEndsAt === null ||
        roundResolvedRef.current
      ) {
        return;
      }

      const submittedAt = dependencies.now();
      const remainingMs = Math.max(0, state.roundEndsAt - submittedAt);

      if (remainingMs <= 0) {
        endGame("time-expired");
        return;
      }

      const answer: TypeRecallAnswer = {
        types,
      };

      const validation = validateTypeRecallAnswer(
        answer,
        state.currentChallenge.pokemon.types,
      );

      if (!validation.correct) {
        endGame("incorrect-answer");
        return;
      }

      roundResolvedRef.current = true;

      const score = calculateTypeRecallScore({
        timeRemainingMs: remainingMs,
        typeCount: state.currentChallenge.pokemon.types.length,
        canonicalOrder: validation.canonicalOrder,
        correctAnswersBeforeRound: state.correctAnswers,
        challengeDifficulty: state.currentChallenge.difficulty,
      });

      const nextUsedPokemonIds = new Set(state.usedPokemonIds);

      nextUsedPokemonIds.add(state.currentChallenge.pokemon.id);

      const nextChallenge = createTypeRecallChallenge({
        pokemon,
        usedPokemonIds: nextUsedPokemonIds,
        challengeIndex: state.correctAnswers + 1,
        random: dependencies.random,
        createId: dependencies.createId,
      });

      const nextRoundEndsAt = nextChallenge
        ? submittedAt + typeRecallGameConfig.roundDurationMs
        : null;

      dispatch({
        type: "CORRECT_ANSWER",
        round: {
          challenge: state.currentChallenge,
          answer,
          canonicalOrder: validation.canonicalOrder,
          answeredAt: submittedAt,
          timeRemainingMs: remainingMs,
          score,
        },
        nextChallenge,
        nextRoundEndsAt,
      });

      if (!nextChallenge) {
        dispatch({
          type: "END_GAME",
          reason: "no-challenges-left",
        });
        saveGameResult();
        trackGameCompleted(analytics, {
          mode: "type_recall",
          startedAt: state.startedAt ?? now,
          completedAt: now,
          correctAnswers: state.correctAnswers,
          mistakes: 0,
          score: state.score,
        });
        return;
      }

      setNow(submittedAt);
      if (sound === "on") {
        void playPokemonCry(nextChallenge.pokemon);
      }
      roundResolvedRef.current = false;
    },
    [
      dependencies,
      endGame,
      pokemon,
      state.correctAnswers,
      state.currentChallenge,
      state.roundEndsAt,
      state.startedAt,
      state.score,
      state.status,
      state.usedPokemonIds,
    ],
  );

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (state.status !== "playing" || state.roundEndsAt === null) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(dependencies.now());
    }, timerIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dependencies, state.roundEndsAt, state.status]);

  useEffect(() => {
    if (
      state.status === "playing" &&
      state.roundEndsAt !== null &&
      timeRemainingMs <= 0
    ) {
      endGame("time-expired");
    }
  }, [endGame, state.roundEndsAt, state.status, timeRemainingMs]);

  return {
    state,
    availableTypes,
    timeRemainingMs,
    timeRemainingSeconds,
    timerProgress,
    submitAnswer,
    startGame,
  };
}

function createId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
