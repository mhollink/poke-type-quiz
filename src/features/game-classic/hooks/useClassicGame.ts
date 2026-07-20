import {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import type { Pokemon, PokemonType } from "../../../types";
import { playPokemonCry } from "../../../utils";
import { createSessionId } from "../../game-shared/utils/createSessionId";
import { createClassicChallenge } from "../challenge/createClassicChallenges.ts";
import { classicGameConfig } from "../classicGameConfig";
import {
	classicGameReducer,
	createInitialClassicGameState,
} from "../model/classicGameReducer";
import type {
	ClassicGameOverReason,
	TypeChallenge,
} from "../model/classicGameTypes";
import { calculateClassicScore } from "../scoring/calculateClassicScore";
import {analytics, trackGameCompleted, trackGameStarted} from "../../analytics";

const timerIntervalMs = 100;

export interface UseClassicGame {
	readonly state: ReturnType<typeof createInitialClassicGameState>;
	readonly timeRemainingMs: number;
	readonly timeRemainingSeconds: number;
	readonly timerProgress: number;
	readonly availableAnswerCount: number;

	readonly submitAnswer: (pokemon: Pokemon) => void;
	readonly startGame: () => void;
}

export function useClassicGame(pokemon: readonly Pokemon[]): UseClassicGame {
	const [state, dispatch] = useReducer(
		classicGameReducer,
		undefined,
		createInitialClassicGameState,
	);

	const [now, setNow] = useState(() => Date.now());

	/*
	 * Prevent two events from resolving the same round.
	 *
	 * For example:
	 * - the timer reaches zero
	 * - the player submits an answer during the same render cycle
	 */
	const roundResolvedRef = useRef(false);

	const eligibleTypes = useMemo(() => getEligibleTypes(pokemon), [pokemon]);

	const availablePokemon = useMemo(
		() =>
			pokemon.filter((candidate) => !state.usedPokemonIds.has(candidate.id)),
		[pokemon, state.usedPokemonIds],
	);

	const validAnswers = useMemo(() => {
		const challenge = state.currentChallenge;

		if (!challenge) {
			return [];
		}

		return availablePokemon.filter((candidate) =>
			pokemonMatchesChallenge(candidate, challenge),
		);
	}, [availablePokemon, state.currentChallenge]);

	const availableAnswerCount = validAnswers.length;

	const timeRemainingMs = useMemo(() => {
		if (state.status !== "playing" || state.roundEndsAt === null) {
			return 0;
		}

		return Math.max(0, state.roundEndsAt - now);
	}, [now, state.roundEndsAt, state.status]);

	const timeRemainingSeconds = Math.ceil(timeRemainingMs / 1_000);

	const timerProgress = Math.max(
		0,
		Math.min(1, timeRemainingMs / classicGameConfig.roundDurationMs),
	);

	const endGame = useCallback((reason: ClassicGameOverReason): void => {
		if (roundResolvedRef.current) {
			return;
		}

		roundResolvedRef.current = true;

		dispatch({
			type: "END_GAME",
			reason,
		});
		trackGameCompleted(analytics, {
			mode: "classic",
			startedAt: -1,
			completedAt: now,
			correctAnswers: state.correctAnswers,
			mistakes: reason === "incorrect-answer" ? 1 : 0,
			score: state.score
		})
	}, []);

	const startGame = useCallback((): void => {
		if (pokemon.length === 0 || eligibleTypes.length === 0) {
			dispatch({
				type: "END_GAME",
				reason: "no-challenges-left",
			});
			trackGameCompleted(analytics, {
				mode: "classic",
				startedAt: -1,
				completedAt: now,
				correctAnswers: state.correctAnswers,
				mistakes: 0,
				score: state.score
			})
			return;
		}

		const firstChallenge = createClassicChallenge({
			pokemon,
			usedPokemonIds: new Set(),
			previousChallenge: null,
		});

		if (!firstChallenge) {
			dispatch({
				type: "END_GAME",
				reason: "no-challenges-left",
			});
			trackGameCompleted(analytics, {
				mode: "classic",
				startedAt: -1,
				completedAt: now,
				correctAnswers: state.correctAnswers,
				mistakes: 0,
				score: state.score
			})
			return;
		}

		const startedAt = Date.now();

		roundResolvedRef.current = false;
		setNow(startedAt);

		dispatch({
			type: "START_GAME",
			sessionId: createSessionId(),
			challenge: firstChallenge.challenge,
			roundEndsAt: startedAt + classicGameConfig.roundDurationMs,
		});
		trackGameStarted(analytics, {mode: "classic", startedAt })
	}, [eligibleTypes, pokemon]);

	const submitAnswer = useCallback(
		(answer: Pokemon): void => {
			if (
				state.status !== "playing" ||
				state.currentChallenge === null ||
				state.roundEndsAt === null ||
				roundResolvedRef.current
			) {
				return;
			}

			const submittedAt = Date.now();
			const remainingMs = Math.max(0, state.roundEndsAt - submittedAt);

			if (remainingMs <= 0) {
				endGame("time-expired");
				return;
			}

			if (state.usedPokemonIds.has(answer.id)) {
				endGame("incorrect-answer");
				return;
			}

			const answerExists = pokemon.some(
				(candidate) => candidate.id === answer.id,
			);

			if (!answerExists) {
				endGame("incorrect-answer");
				return;
			}

			const correct = pokemonMatchesChallenge(answer, state.currentChallenge);

			if (!correct) {
				endGame("incorrect-answer");
				return;
			}

			roundResolvedRef.current = true;

			const score = calculateClassicScore({
				roundDurationMs: classicGameConfig.roundDurationMs,
				timeRemainingMs: remainingMs,
				availableAnswerCount: availableAnswerCount,
				roundIndex: state.correctAnswers,
			});

			const nextUsedPokemonIds = new Set(state.usedPokemonIds);
			nextUsedPokemonIds.add(answer.id);

			const nextChallenge = createClassicChallenge({
				pokemon,
				usedPokemonIds: nextUsedPokemonIds,
				previousChallenge: state.currentChallenge,
			});

			if (!nextChallenge) {
				dispatch({
					type: "CORRECT_ANSWER",
					round: {
						challenge: state.currentChallenge,
						answer,
						timeRemainingMs: remainingMs,
						score,
					},
					nextChallenge: null,
					nextRoundEndsAt: null,
				});

				void playPokemonCry(answer);

				dispatch({
					type: "END_GAME",
					reason: "no-challenges-left",
				});
				trackGameCompleted(analytics, {
					mode: "classic",
					startedAt: -1,
					completedAt: now,
					correctAnswers: state.correctAnswers,
					mistakes: 0,
					score: state.score
				})
				return;
			}

			const nextRoundEndsAt = submittedAt + classicGameConfig.roundDurationMs;

			dispatch({
				type: "CORRECT_ANSWER",
				round: {
					challenge: state.currentChallenge,
					answer,
					timeRemainingMs: remainingMs,
					score,
				},
				nextChallenge: nextChallenge.challenge,
				nextRoundEndsAt,
			});

			void playPokemonCry(answer);

			setNow(submittedAt);
			roundResolvedRef.current = false;
		},
		[availableAnswerCount, endGame, pokemon, state],
	);

	/*
	 * Automatically start when the feature mounts.
	 *
	 * The dependency is intentionally the memoized callback so the game
	 * restarts when its Pokémon dataset changes.
	 */
	useEffect(() => {
		startGame();
	}, [startGame]);

	/*
	 * Update the derived countdown while a round is active.
	 */
	useEffect(() => {
		if (state.status !== "playing" || state.roundEndsAt === null) {
			return undefined;
		}

		const intervalId = window.setInterval(() => {
			setNow(Date.now());
		}, timerIntervalMs);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [state.roundEndsAt, state.status]);

	/*
	 * Resolve expiration separately from the interval.
	 *
	 * The interval only updates `now`; this effect owns the state
	 * transition.
	 */
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
		timeRemainingMs,
		timeRemainingSeconds,
		timerProgress,
		availableAnswerCount,
		submitAnswer,
		startGame,
	};
}

function getEligibleTypes(pokemon: readonly Pokemon[]): readonly PokemonType[] {
	return Array.from(new Set(pokemon.flatMap((candidate) => candidate.types)));
}

function pokemonMatchesChallenge(
	pokemon: Pokemon,
	challenge: TypeChallenge,
): boolean {
	return pokemon.types.includes(challenge.type);
}
