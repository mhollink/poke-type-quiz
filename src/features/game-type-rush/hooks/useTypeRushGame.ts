import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import type { Pokemon } from "../../../types";
import { playPokemonCry } from "../../../utils";
import {
  analytics,
  trackGameCompleted,
  trackGameStarted,
} from "../../analytics";
import { localPokedexRepository } from "../../pokedex/storage/pokedexRepository.ts";
import { useSoundLevel } from "../../sound/SoundPreferencesProvider.tsx";
import {
  createTypeRushChallenge,
  createTypeKey,
} from "../challenge/createTypeRushChallenge.ts";
import {
  createDailyDateKey,
  createDailySeed,
} from "../challenge/createDailySeed";
import { createSeededRandom } from "../challenge/createSeededRandom";
import { matchesTypeRushChallenge } from "../challenge/matchesTypeRushChallenge.ts";
import { typeRushGameConfig } from "../typeRushGameConfig.ts";
import {
  createInitialTypeRushGameState,
  typeRushGameReducer,
} from "../model/typeRushGameReducer.ts";
import type {
  TypeRushAttemptRecord,
  TypeRushGameState,
} from "../model/typeRushGameTypes.ts";
import { calculateTypeRushScore } from "../scoring/calculateTypeRushScore.ts";
import {
  type TypeRushAttemptRepository,
  localTypeRushAttemptRepository,
} from "../storage/typeRushAttemptRepository.ts";

const timerIntervalMs = 100;

export type TypeRushSubmissionResult =
  | "correct"
  | "incorrect-order"
  | "unknown-pokemon"
  | "wrong-types"
  | "already-used"
  | null;

export interface UseTypeRushGameResult {
  readonly state: TypeRushGameState;
  readonly existingAttempt: TypeRushAttemptRecord | null;
  readonly canPlay: boolean;
  readonly timeRemainingMs: number;
  readonly timeRemainingSeconds: number;
  readonly timerProgress: number;
  readonly submissionResult: TypeRushSubmissionResult;

  readonly submitAnswer: (answer: Pokemon) => void;
  readonly skipRound: () => void;
}

export interface TypeRushGameDependencies {
  readonly now: () => number;
  readonly createDate: () => Date;
  readonly attemptRepository: TypeRushAttemptRepository;
}

const defaultDependencies: TypeRushGameDependencies = {
  now: Date.now,
  createDate: () => new Date(),
  attemptRepository: localTypeRushAttemptRepository,
};

function useTypeRushGame(
  pokemon: readonly Pokemon[],
  dependencies: TypeRushGameDependencies = defaultDependencies,
): UseTypeRushGameResult {
  const sound = useSoundLevel();
  const [state, dispatch] = useReducer(
    typeRushGameReducer,
    undefined,
    createInitialTypeRushGameState,
  );

  const [now, setNow] = useState(dependencies.now);
  const [existingAttempt, setExistingAttempt] =
    useState<TypeRushAttemptRecord | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<TypeRushSubmissionResult>(null);

  const initializedRef = useRef(false);
  const runResolvedRef = useRef(false);
  const persistedCompletionRef = useRef(false);

  const dateKey = useMemo(
    () => createDailyDateKey(dependencies.createDate()),
    [dependencies],
  );

  const randomRef = useRef<ReturnType<typeof createSeededRandom> | null>(null);

  if (randomRef.current === null) {
    randomRef.current = createSeededRandom(createDailySeed(dateKey));
  }

  const startGame = useCallback((): void => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const storedAttempt = dependencies.attemptRepository.findByDate(dateKey);

    if (storedAttempt) {
      setExistingAttempt(storedAttempt);
      return;
    }

    const startedAt = dependencies.now();

    const firstChallenge = createTypeRushChallenge({
      pokemon,
      usedPokemonIds: new Set(),
      skippedTypes: new Set(),
      previousChallenge: null,
      challengeIndex: 0,
      random: randomRef.current!,
    });

    if (!firstChallenge) {
      return;
    }

    setNow(startedAt);

    dispatch({
      type: "START_GAME",
      dateKey,
      challenge: firstChallenge,
      startedAt,
      runEndsAt: startedAt + typeRushGameConfig.durationMs,
    });
    trackGameStarted(analytics, { mode: "type_rush", startedAt });
  }, [dateKey, dependencies, pokemon]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const timeRemainingMs = useMemo(() => {
    if (
      state.status !== "playing" ||
      state.runEndsAt === null ||
      state.currentChallenge === null
    ) {
      return 0;
    }

    return Math.max(0, state.runEndsAt - now);
  }, [now, state.currentChallenge, state.runEndsAt, state.status]);

  const timeRemainingSeconds = Math.ceil(timeRemainingMs / 1_000);

  const timerProgress = Math.max(
    0,
    Math.min(1, timeRemainingMs / typeRushGameConfig.durationMs),
  );

  const endGame = useCallback((): void => {
    if (runResolvedRef.current) {
      return;
    }

    runResolvedRef.current = true;

    dispatch({
      type: "END_GAME",
      reason: "time-expired",
    });
    trackGameCompleted(analytics, {
      mode: "type_rush",
      startedAt: state.startedAt ?? now,
      completedAt: now,
      correctAnswers: state.correctAnswers,
      mistakes: state.mistakes,
      score: state.score,
    });
    localPokedexRepository.unlock(state.usedPokemonIds);
    localPokedexRepository.unlock(state.shinies, true);
  }, [now, state]);

  const submitAnswer = useCallback(
    (answer: Pokemon): void => {
      if (
        state.status !== "playing" ||
        state.currentChallenge === null ||
        state.runEndsAt === null ||
        runResolvedRef.current
      ) {
        return;
      }

      const submittedAt = dependencies.now();

      if (submittedAt >= state.runEndsAt) {
        endGame();
        return;
      }

      const knownPokemon = pokemon.find(
        (candidate) => candidate.id === answer.id,
      );

      if (!knownPokemon) {
        setSubmissionResult("unknown-pokemon");

        dispatch({
          type: "INCORRECT_ANSWER",
        });

        return;
      }

      if (state.usedPokemonIds.has(knownPokemon.id)) {
        setSubmissionResult("already-used");

        dispatch({
          type: "INCORRECT_ANSWER",
        });

        return;
      }

      const result = matchesTypeRushChallenge(
        knownPokemon,
        state.currentChallenge,
      );
      if (result !== "match") {
        setSubmissionResult(result);

        dispatch({
          type: "INCORRECT_ANSWER",
        });

        return;
      }

      const score = calculateTypeRushScore({
        streakBeforeAnswer: state.streak,
        difficulty: state.currentChallenge.difficulty,
        challengeIndex: state.correctAnswers,
      });

      const nextUsedPokemonIds = new Set(state.usedPokemonIds);
      nextUsedPokemonIds.add(knownPokemon.id);

      const nextChallenge = createTypeRushChallenge({
        pokemon,
        usedPokemonIds: nextUsedPokemonIds,
        skippedTypes: state.skippedTypes,
        previousChallenge: state.currentChallenge,
        challengeIndex: state.correctAnswers + state.skippedRounds + 1,
        random: randomRef.current!,
      });

      setSubmissionResult("correct");

      dispatch({
        type: "CORRECT_ANSWER",
        answer: {
          challenge: state.currentChallenge,
          pokemon: knownPokemon,
          score,
          answeredAt: submittedAt,
        },
        nextChallenge,
      });

      if (sound === "on") {
        void playPokemonCry(knownPokemon);
      }

      if (!nextChallenge) {
        if (state.skippedTypes.size > 0) {
          // attempt to create new round with already skipped entries
          const newSkippedRound = createTypeRushChallenge({
            pokemon,
            usedPokemonIds: nextUsedPokemonIds,
            skippedTypes: new Set(),
            previousChallenge: state.currentChallenge,
            challengeIndex: state.correctAnswers + state.skippedRounds + 1,
            random: randomRef.current!,
          });
          if (newSkippedRound) {
            dispatch({
              type: "RESET_SKIPS",
              nextChallenge: newSkippedRound,
            });
            return;
          }
        }

        runResolvedRef.current = true;

        dispatch({
          type: "END_GAME",
          reason:
            state.skippedRounds === 0 ? "no-challenges-left" : "time-expired",
        });
        trackGameCompleted(analytics, {
          mode: "type_rush",
          startedAt: state.startedAt ?? now,
          completedAt: now,
          correctAnswers: state.correctAnswers,
          mistakes: state.mistakes,
          score: state.score,
        });
        localPokedexRepository.unlock(state.usedPokemonIds);
        localPokedexRepository.unlock(state.shinies, true);
      }
    },
    [
      dependencies,
      endGame,
      pokemon,
      state.correctAnswers,
      state.currentChallenge,
      state.runEndsAt,
      state.status,
      state.startedAt,
      state.mistakes,
      state.score,
      state.streak,
      state.usedPokemonIds,
    ],
  );

  const skipRound = useCallback(() => {
    const currentChallengeKey = state.currentChallenge
      ? createTypeKey(state.currentChallenge.types)
      : null;
    const nextSkippedTypes = new Set(state.skippedTypes);

    if (currentChallengeKey) {
      nextSkippedTypes.add(currentChallengeKey);
    }

    let nextChallenge = createTypeRushChallenge({
      pokemon,
      usedPokemonIds: state.usedPokemonIds,
      skippedTypes: nextSkippedTypes,
      previousChallenge: state.currentChallenge,
      challengeIndex: state.correctAnswers + state.skippedRounds + 1,
      random: randomRef.current!,
    });

    if (nextChallenge) {
      dispatch({
        type: "SKIP_ROUND",
        skippedRound: state.currentChallenge,
        nextChallenge: nextChallenge,
      });
    }

    if (currentChallengeKey) {
      nextChallenge = createTypeRushChallenge({
        pokemon,
        usedPokemonIds: state.usedPokemonIds,
        skippedTypes: new Set(currentChallengeKey),
        previousChallenge: state.currentChallenge,
        challengeIndex: state.correctAnswers + state.skippedRounds + 1,
        random: randomRef.current!,
      });

      if (nextChallenge) {
        dispatch({
          type: "SKIP_ROUND",
          skippedRound: state.currentChallenge,
          nextChallenge: nextChallenge,
        });
        return;
      }
    }

    runResolvedRef.current = true;

    dispatch({
      type: "END_GAME",
      reason: "time-expired",
    });
    trackGameCompleted(analytics, {
      mode: "type_rush",
      startedAt: state.startedAt ?? now,
      completedAt: now,
      correctAnswers: state.correctAnswers,
      mistakes: state.mistakes,
      score: state.score,
    });
    localPokedexRepository.unlock(state.usedPokemonIds);
    localPokedexRepository.unlock(state.shinies, true);
  }, [
    pokemon,
    state.usedPokemonIds,
    state.currentChallenge,
    state.completedAnswers,
    state.skippedRounds,
  ]);

  useEffect(() => {
    if (state.status !== "playing" || state.runEndsAt === null) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(dependencies.now());
    }, timerIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dependencies, state.runEndsAt, state.status]);

  useEffect(() => {
    if (
      state.status === "playing" &&
      state.runEndsAt !== null &&
      timeRemainingMs <= 0
    ) {
      endGame();
    }
  }, [endGame, state.runEndsAt, state.status, timeRemainingMs]);

  useEffect(() => {
    if (
      state.status !== "game-over" ||
      !state.dateKey ||
      persistedCompletionRef.current
    ) {
      return;
    }

    persistedCompletionRef.current = true;

    const existingRecord = dependencies.attemptRepository.findByDate(
      state.dateKey,
    );

    const completedAttempt: TypeRushAttemptRecord = {
      dateKey: state.dateKey,
      startedAt: existingRecord?.startedAt ?? dependencies.now(),
      completedAt: dependencies.now(),
      score: state.score,
      correctAnswers: state.correctAnswers,
      mistakes: state.mistakes,
      highestStreak: state.highestStreak,
    };

    dependencies.attemptRepository.save(completedAttempt);
    setExistingAttempt(completedAttempt);
  }, [dependencies, state]);

  return {
    state,
    existingAttempt,
    canPlay: existingAttempt === null && state.currentChallenge !== null,
    timeRemainingMs,
    timeRemainingSeconds,
    timerProgress,
    submissionResult,
    submitAnswer,
    skipRound,
  };
}

export default useTypeRushGame;
