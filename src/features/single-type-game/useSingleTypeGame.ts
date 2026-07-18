import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useNow } from "../../hooks";
import type {
	GameConfig,
	GameState,
	Pokemon,
	TypeChallenge,
	UsedAnswersByChallenge,
} from "../../types";
import {
	calculateScore,
	defaultGameConfig,
	getAvailablePokemonIds,
	pokemonData,
	selectRandomChallenge,
} from "../../utils";
import {
	classicGameReducer,
	createInitialGameState,
} from "../classic-game/classicGameReducer.ts";
import { createSingleTypeChallenges } from "./singleTypeGameUtils";

type UseSingleTypeGameResult = {
	state: GameState;
	timeRemainingMs: number;
	timeRemainingSeconds: number;
	timerProgress: number;
	availableAnswerCount: number;
	availablePokemon: readonly Pokemon[];
	usedPokemonIdsForCurrentChallenge: ReadonlySet<string>;
	startGame: () => void;
	submitPokemon: (pokemon: Pokemon) => boolean;
};

type GameInitializer = {
	challenges: readonly TypeChallenge[];
	roundDurationMs: number;
};

function initializeGame({
	challenges,
	roundDurationMs,
}: GameInitializer): GameState {
	const challenge = selectRandomChallenge(challenges, {});

	if (!challenge) {
		throw new Error("Cannot start a game without any valid challenges.");
	}

	return createInitialGameState(challenge, performance.now() + roundDurationMs);
}

export function useSingleTypeGame(
	pokemon: readonly Pokemon[],
	config: GameConfig = defaultGameConfig,
): UseSingleTypeGameResult {
	const challenges = useMemo(
		() => createSingleTypeChallenges(pokemon),
		[pokemon],
	);

	const [state, dispatch] = useReducer(
		classicGameReducer,
		{
			challenges,
			roundDurationMs: config.roundDurationMs,
		},
		initializeGame,
	);

	const availablePokemon = useMemo(() => {
		const usedIds = new Set(
			state.completedRounds.map((round) => round.pokemonId),
		);
		return pokemonData.filter((candidate) => !usedIds.has(candidate.id));
	}, [state.completedRounds]);

	const now = useNow(state.status === "playing");

	const timeRemainingMs =
		state.status === "playing" && state.roundEndsAt !== null
			? Math.max(0, state.roundEndsAt - now)
			: 0;

	const timeRemainingSeconds = Math.ceil(timeRemainingMs / 1000);

	const timerProgress =
		state.status === "playing"
			? (timeRemainingMs / config.roundDurationMs) * 100
			: 0;

	const usedPokemonIdsForCurrentChallenge = useMemo(() => {
		if (!state.currentChallenge) {
			return new Set<string>();
		}

		return new Set(
			state.usedAnswersByChallenge[state.currentChallenge.key] ?? [],
		);
	}, [state.currentChallenge, state.usedAnswersByChallenge]);

	const availableAnswerCount = useMemo(() => {
		if (!state.currentChallenge) {
			return 0;
		}

		return getAvailablePokemonIds(
			state.currentChallenge,
			state.usedAnswersByChallenge,
		).length;
	}, [state.currentChallenge, state.usedAnswersByChallenge]);

	const startGame = useCallback(() => {
		const challenge = selectRandomChallenge(challenges, {});

		if (!challenge) {
			return;
		}

		dispatch({
			type: "START_GAME",
			sessionId: crypto.randomUUID(),
			challenge,
			roundEndsAt: performance.now() + config.roundDurationMs,
		});
	}, [challenges, config.roundDurationMs]);

	const submitPokemon = useCallback(
		(selectedPokemon: Pokemon): boolean => {
			if (
				state.status !== "playing" ||
				!state.currentChallenge ||
				state.roundEndsAt === null
			) {
				return false;
			}

			const remainingMs = Math.max(0, state.roundEndsAt - performance.now());

			if (remainingMs <= 0) {
				dispatch({
					type: "END_GAME",
					reason: "time-expired",
				});

				return false;
			}

			const availableIds = getAvailablePokemonIds(
				state.currentChallenge,
				state.usedAnswersByChallenge,
			);

			if (!availableIds.includes(selectedPokemon.id)) {
				dispatch({
					type: "END_GAME",
					reason: "incorrect-answer",
				});

				return false;
			}

			const score = calculateScore(
				{
					timeRemainingMs: remainingMs,
					roundDurationMs: config.roundDurationMs,
					availableOptionCount: availableIds.length,
					correctAnswersBeforeRound: state.correctAnswers,
				},
				config.scoring,
			);

			const updatedUsedAnswers: UsedAnswersByChallenge = {
				...state.usedAnswersByChallenge,
				[state.currentChallenge.key]: [
					...(state.usedAnswersByChallenge[state.currentChallenge.key] ?? []),
					selectedPokemon.id,
				],
			};

			const nextChallenge = selectRandomChallenge(
				challenges,
				updatedUsedAnswers,
			);

			if (!nextChallenge) {
				dispatch({
					type: "END_GAME",
					reason: "no-challenges-left",
				});

				return true;
			}

			dispatch({
				type: "CORRECT_ANSWER",
				round: {
					challengeKey: state.currentChallenge.key,
					pokemonId: selectedPokemon.id,
					availableOptionCount: availableIds.length,
					timeRemainingMs: remainingMs,
					awardedPoints: score.points,
				},
				multiplier: score.multiplier,
				nextChallenge,
				nextRoundEndsAt: performance.now() + config.roundDurationMs,
			});

			return true;
		},
		[challenges, config.roundDurationMs, config.scoring, state],
	);

	useEffect(() => {
		if (
			state.status === "playing" &&
			state.roundEndsAt !== null &&
			timeRemainingMs <= 0
		) {
			dispatch({
				type: "END_GAME",
				reason: "time-expired",
			});
		}
	}, [state.status, state.roundEndsAt, timeRemainingMs]);

	return {
		state,
		timeRemainingMs,
		timeRemainingSeconds,
		timerProgress,
		availableAnswerCount,
		availablePokemon,
		usedPokemonIdsForCurrentChallenge,
		startGame,
		submitPokemon,
	};
}
