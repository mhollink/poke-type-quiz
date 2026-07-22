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
import { createDailyChallenge } from "../challenge/createDailyChallenge";
import {
	createDailyDateKey,
	createDailySeed,
} from "../challenge/createDailySeed";
import { createSeededRandom } from "../challenge/createSeededRandom";
import { matchesDailyChallenge } from "../challenge/matchesDailyChallenge";
import { dailyGameConfig } from "../dailyGameConfig";
import {
	createInitialDailyGameState,
	dailyGameReducer,
} from "../model/dailyGameReducer";
import type {
	DailyAttemptRecord,
	DailyGameState,
} from "../model/dailyGameTypes";
import { calculateDailyScore } from "../scoring/calculateDailyScore";
import {
	type DailyAttemptRepository,
	localDailyAttemptRepository,
} from "../storage/dailyAttemptRepository";

const timerIntervalMs = 100;

export type DailySubmissionResult =
	| "correct"
	| "unknown-pokemon"
	| "wrong-types"
	| "already-used"
	| null;

export interface UseDailyGameResult {
	readonly state: DailyGameState;
	readonly existingAttempt: DailyAttemptRecord | null;
	readonly canPlay: boolean;
	readonly timeRemainingMs: number;
	readonly timeRemainingSeconds: number;
	readonly timerProgress: number;
	readonly submissionResult: DailySubmissionResult;

	readonly submitAnswer: (answer: Pokemon) => void;
}

export interface DailyGameDependencies {
	readonly now: () => number;
	readonly createDate: () => Date;
	readonly attemptRepository: DailyAttemptRepository;
}

const defaultDependencies: DailyGameDependencies = {
	now: Date.now,
	createDate: () => new Date(),
	attemptRepository: localDailyAttemptRepository,
};

export function useDailyGame(
	pokemon: readonly Pokemon[],
	dependencies: DailyGameDependencies = defaultDependencies,
): UseDailyGameResult {
	const [state, dispatch] = useReducer(
		dailyGameReducer,
		undefined,
		createInitialDailyGameState,
	);

	const [now, setNow] = useState(dependencies.now);
	const [existingAttempt, setExistingAttempt] =
		useState<DailyAttemptRecord | null>(null);
	const [submissionResult, setSubmissionResult] =
		useState<DailySubmissionResult>(null);

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

		const firstChallenge = createDailyChallenge({
			pokemon,
			usedPokemonIds: new Set(),
			previousChallenge: null,
			challengeIndex: 0,
			random: randomRef.current!,
		});

		if (!firstChallenge) {
			return;
		}

		const initialAttempt: DailyAttemptRecord = {
			dateKey,
			startedAt,
			completedAt: null,
			score: 0,
			correctAnswers: 0,
			mistakes: 0,
			highestStreak: 0,
		};

		dependencies.attemptRepository.save(initialAttempt);

		setNow(startedAt);

		dispatch({
			type: "START_GAME",
			dateKey,
			challenge: firstChallenge,
			startedAt,
			runEndsAt: startedAt + dailyGameConfig.durationMs,
		});
		trackGameStarted(analytics, { mode: "daily", startedAt });
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
		Math.min(1, timeRemainingMs / dailyGameConfig.durationMs),
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
			mode: "classic",
			startedAt: state.startedAt ?? now,
			completedAt: now,
			correctAnswers: state.correctAnswers,
			mistakes: state.mistakes,
			score: state.score,
		});
		localPokedexRepository.unlock(state.usedPokemonIds);
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

			if (!matchesDailyChallenge(knownPokemon, state.currentChallenge)) {
				setSubmissionResult("wrong-types");

				dispatch({
					type: "INCORRECT_ANSWER",
				});

				return;
			}

			const score = calculateDailyScore({
				streakBeforeAnswer: state.streak,
				difficulty: state.currentChallenge.difficulty,
				challengeIndex: state.correctAnswers,
			});

			const nextUsedPokemonIds = new Set(state.usedPokemonIds);
			nextUsedPokemonIds.add(knownPokemon.id);

			const nextChallenge = createDailyChallenge({
				pokemon,
				usedPokemonIds: nextUsedPokemonIds,
				previousChallenge: state.currentChallenge,
				challengeIndex: state.correctAnswers + 1,
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

			void playPokemonCry(knownPokemon);

			if (!nextChallenge) {
				runResolvedRef.current = true;

				dispatch({
					type: "END_GAME",
					reason: "no-challenges-left",
				});
				trackGameCompleted(analytics, {
					mode: "classic",
					startedAt: state.startedAt ?? now,
					completedAt: now,
					correctAnswers: state.correctAnswers,
					mistakes: state.mistakes,
					score: state.score,
				});
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

		const completedAttempt: DailyAttemptRecord = {
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
	};
}
