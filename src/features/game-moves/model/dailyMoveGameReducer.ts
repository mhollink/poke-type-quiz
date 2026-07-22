import type { DailyMoveChallenge } from "./Round";

export type DailyMoveSelection = {
	roundIndex: number;
	pokemonId: string;
	moveId: string;
	score: number;
	maxScore: number;
	isOptimal: boolean;
};

export type DailyMoveGameState = {
	status: "playing" | "completed";
	challenge: DailyMoveChallenge;
	roundIndex: number;
	score: number;
	optimalSelections: number;
	selectedMoveId: string | null;
	selections: readonly DailyMoveSelection[];
};

export type DailyMoveGameAction =
	| {
			type: "select-move";
			moveId: string;
	  }
	| {
			type: "continue";
	  }
	| {
			type: "replace-challenge";
			challenge: DailyMoveChallenge;
	  };

export function createInitialDailyMoveGameState(
	challenge: DailyMoveChallenge,
): DailyMoveGameState {
	return {
		status: "playing",
		challenge,
		roundIndex: 0,
		score: 0,
		optimalSelections: 0,
		selectedMoveId: null,
		selections: [],
	};
}

export function dailyMoveGameReducer(
	state: DailyMoveGameState,
	action: DailyMoveGameAction,
): DailyMoveGameState {
	switch (action.type) {
		case "select-move": {
			if (state.status !== "playing" || state.selectedMoveId !== null) {
				return state;
			}

			const round = state.challenge.rounds[state.roundIndex];

			if (!round) {
				return state;
			}

			const selectedOption = round.options.find(
				(option) => option.move.id === action.moveId,
			);

			if (!selectedOption) {
				throw new Error(
					`Move ${action.moveId} is not available in round ${state.roundIndex}`,
				);
			}

			const awardedScore = selectedOption.score.score;
			const isOptimal = awardedScore === round.maxScore;

			const selection: DailyMoveSelection = {
				roundIndex: state.roundIndex,
				pokemonId: round.pokemon.id,
				moveId: selectedOption.move.id,
				score: awardedScore,
				maxScore: round.maxScore,
				isOptimal,
			};

			return {
				...state,
				score: state.score + awardedScore,
				optimalSelections: state.optimalSelections + (isOptimal ? 1 : 0),
				selectedMoveId: selectedOption.move.id,
				selections: [...state.selections, selection],
			};
		}

		case "continue": {
			if (state.status !== "playing" || state.selectedMoveId === null) {
				return state;
			}

			const isLastRound =
				state.roundIndex === state.challenge.rounds.length - 1;

			if (isLastRound) {
				return {
					...state,
					status: "completed",
				};
			}

			return {
				...state,
				roundIndex: state.roundIndex + 1,
				selectedMoveId: null,
			};
		}

		case "replace-challenge":
			return createInitialDailyMoveGameState(action.challenge);
	}
}
