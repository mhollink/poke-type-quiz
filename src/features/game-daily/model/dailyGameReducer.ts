import type {
	CompletedDailyAnswer,
	DailyChallenge,
	DailyGameOverReason,
	DailyGameState,
} from "./dailyGameTypes";

export type DailyGameAction =
	| {
			readonly type: "START_GAME";
			readonly dateKey: string;
			readonly challenge: DailyChallenge;
			readonly startedAt: number;
			readonly runEndsAt: number;
	  }
	| {
			readonly type: "CORRECT_ANSWER";
			readonly answer: CompletedDailyAnswer;
			readonly nextChallenge: DailyChallenge | null;
	  }
	| {
			readonly type: "INCORRECT_ANSWER";
	  }
	| {
			readonly type: "END_GAME";
			readonly reason: DailyGameOverReason;
	  };

export function createInitialDailyGameState(): DailyGameState {
	return {
		dateKey: "",
		status: "playing",
		score: 0,
		correctAnswers: 0,
		mistakes: 0,
		streak: 0,
		highestStreak: 0,
		currentChallenge: null,
		startedAt: null,
		runEndsAt: null,
		usedPokemonIds: new Set(),
		completedAnswers: [],
		lastScore: null,
		gameOverReason: null,
	};
}

export function dailyGameReducer(
	state: DailyGameState,
	action: DailyGameAction,
): DailyGameState {
	switch (action.type) {
		case "START_GAME":
			return {
				...createInitialDailyGameState(),
				dateKey: action.dateKey,
				currentChallenge: action.challenge,
				startedAt: action.startedAt,
				runEndsAt: action.runEndsAt,
			};

		case "CORRECT_ANSWER": {
			const usedPokemonIds = new Set(state.usedPokemonIds);
			usedPokemonIds.add(action.answer.pokemon.id);

			const nextStreak = state.streak + 1;

			return {
				...state,
				score: state.score + action.answer.score.totalPoints,
				correctAnswers: state.correctAnswers + 1,
				streak: nextStreak,
				highestStreak: Math.max(state.highestStreak, nextStreak),
				currentChallenge: action.nextChallenge,
				usedPokemonIds,
				completedAnswers: [...state.completedAnswers, action.answer],
				lastScore: action.answer.score,
			};
		}

		case "INCORRECT_ANSWER":
			return {
				...state,
				mistakes: state.mistakes + 1,
				streak: 0,
				lastScore: null,
			};

		case "END_GAME":
			return {
				...state,
				status: "game-over",
				runEndsAt: null,
				gameOverReason: action.reason,
			};
	}
}
