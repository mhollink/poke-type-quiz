import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
	createInitialDailyMoveGameState,
	dailyMoveGameReducer,
} from "../model/dailyMoveGameReducer.ts";
import type {
	DailyMoveChallenge,
	DailyMoveOption,
	DailyMoveRound,
} from "../model/Round.ts";

export type DailyMoveGame = {
	state: ReturnType<typeof createInitialDailyMoveGameState>;
	currentRound: DailyMoveRound | null;
	selectedOption: DailyMoveOption | null;
	roundNumber: number;
	roundCount: number;
	isResolved: boolean;
	isFinalRound: boolean;
	progress: number;
	selectMove: (moveId: string) => void;
	continueGame: () => void;
};

export function useDailyMoveGame(challenge: DailyMoveChallenge): DailyMoveGame {
	const [state, dispatch] = useReducer(
		dailyMoveGameReducer,
		challenge,
		createInitialDailyMoveGameState,
	);

	useEffect(() => {
		if (state.challenge.dateKey !== challenge.dateKey) {
			dispatch({
				type: "replace-challenge",
				challenge,
			});
		}
	}, [challenge, state.challenge.dateKey]);

	const currentRound = useMemo(() => {
		if (state.status !== "playing") {
			return null;
		}

		return state.challenge.rounds[state.roundIndex] ?? null;
	}, [state.challenge.rounds, state.roundIndex, state.status]);

	const selectedOption = useMemo(() => {
		if (!currentRound || state.selectedMoveId === null) {
			return null;
		}

		return (
			currentRound.options.find(
				(option) => option.move.id === state.selectedMoveId,
			) ?? null
		);
	}, [currentRound, state.selectedMoveId]);

	const selectMove = useCallback((moveId: string) => {
		dispatch({
			type: "select-move",
			moveId,
		});
	}, []);

	const continueGame = useCallback(() => {
		dispatch({
			type: "continue",
		});
	}, []);

	const roundCount = state.challenge.rounds.length;
	const roundNumber = Math.min(state.roundIndex + 1, roundCount);

	return {
		state,
		currentRound,
		selectedOption,
		roundNumber,
		roundCount,
		isResolved: selectedOption !== null,
		isFinalRound: state.roundIndex === roundCount - 1,
		progress: roundCount === 0 ? 0 : roundNumber / roundCount,
		selectMove,
		continueGame,
	};
}
