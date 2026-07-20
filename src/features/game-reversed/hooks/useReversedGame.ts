import {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";

import type { Pokemon } from "../../../types/pokemon";
import { createReversedChallenge } from "../challenge/createReversedChallenge";
import {
	createInitialReversedGameState,
	reversedGameReducer,
} from "../model/reversedGameReducer";
import type {
	PokemonType,
	ReversedAnswer,
	ReversedGameOverReason,
	ReversedGameState,
} from "../model/reversedGameTypes";
import { validateReversedAnswer } from "../model/validateReversedAnswer";
import { reversedGameConfig } from "../reversedGameConfig";
import { calculateReversedScore } from "../scoring/calculateReversedScore";
import {analytics, trackGameCompleted, trackGameStarted} from "../../analytics";

const timerIntervalMs = 100;

export interface ReversedGameDependencies {
	readonly now: () => number;
	readonly random: () => number;
	readonly createId: () => string;
}

const defaultDependencies: ReversedGameDependencies = {
	now: Date.now,
	random: Math.random,
	createId: createId,
};

export interface UseReversedGameResult {
	readonly state: ReversedGameState;
	readonly availableTypes: readonly PokemonType[];
	readonly timeRemainingMs: number;
	readonly timeRemainingSeconds: number;
	readonly timerProgress: number;

	readonly submitAnswer: (types: readonly PokemonType[]) => void;

	readonly startGame: () => void;
}

export function useReversedGame(
	pokemon: readonly Pokemon[],
	dependencies: ReversedGameDependencies = defaultDependencies,
): UseReversedGameResult {
	const [state, dispatch] = useReducer(
		reversedGameReducer,
		undefined,
		createInitialReversedGameState,
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
		timeRemainingMs / reversedGameConfig.roundDurationMs,
		0,
		1,
	);

	const endGame = useCallback((reason: ReversedGameOverReason): void => {
		if (roundResolvedRef.current) {
			return;
		}

		roundResolvedRef.current = true;

		dispatch({
			type: "END_GAME",
			reason,
		});
		trackGameCompleted(analytics, {
			mode: "reversed",
			startedAt: -1,
			completedAt: now,
			correctAnswers: state.correctAnswers,
			mistakes: reason === "incorrect-answer" ? 1 : 0,
			score: state.score
		})
	}, [state.correctAnswers, state.score]);

	const startGame = useCallback((): void => {
		const firstChallenge = createReversedChallenge({
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
			trackGameCompleted(analytics, {
				mode: "reversed",
				startedAt: -1,
				completedAt: now,
				correctAnswers: state.correctAnswers,
				mistakes: 0,
				score: state.score
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
			roundEndsAt: startedAt + reversedGameConfig.roundDurationMs,
		});
		trackGameStarted(analytics, {mode: "reversed", startedAt })
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

			const answer: ReversedAnswer = {
				types,
			};

			const validation = validateReversedAnswer(
				answer,
				state.currentChallenge.pokemon.types,
			);

			if (!validation.correct) {
				endGame("incorrect-answer");
				return;
			}

			roundResolvedRef.current = true;

			const score = calculateReversedScore({
				timeRemainingMs: remainingMs,
				typeCount: state.currentChallenge.pokemon.types.length,
				canonicalOrder: validation.canonicalOrder,
				correctAnswersBeforeRound: state.correctAnswers,
				challengeDifficulty: state.currentChallenge.difficulty,
			});

			const nextUsedPokemonIds = new Set(state.usedPokemonIds);

			nextUsedPokemonIds.add(state.currentChallenge.pokemon.id);

			const nextChallenge = createReversedChallenge({
				pokemon,
				usedPokemonIds: nextUsedPokemonIds,
				challengeIndex: state.correctAnswers + 1,
				random: dependencies.random,
				createId: dependencies.createId,
			});

			const nextRoundEndsAt = nextChallenge
				? submittedAt + reversedGameConfig.roundDurationMs
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
				trackGameCompleted(analytics, {
					mode: "reversed",
					startedAt: -1,
					completedAt: now,
					correctAnswers: state.correctAnswers,
					mistakes: 0,
					score: state.score
				});
				return;
			}

			setNow(submittedAt);
			roundResolvedRef.current = false;
		},
		[
			dependencies,
			endGame,
			pokemon,
			state.correctAnswers,
			state.currentChallenge,
			state.roundEndsAt,
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
