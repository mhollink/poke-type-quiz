import type {
	CompletedRound,
	GameOverReason,
	GameState,
	TypeChallenge,
} from "../../../types/game";

export type GameAction =
	| {
			type: "START_GAME";
			sessionId: string;
			challenge: TypeChallenge;
			roundEndsAt: number;
	  }
	| {
			type: "CORRECT_ANSWER";
			round: CompletedRound;
			multiplier: number;
			nextChallenge: TypeChallenge;
			nextRoundEndsAt: number;
	  }
	| {
			type: "END_GAME";
			reason: GameOverReason;
	  };

export const initialGameState: GameState = {
	sessionId: "",
	status: "idle",
	score: 0,
	correctAnswers: 0,
	currentChallenge: null,
	roundEndsAt: null,
	usedAnswersByChallenge: {},
	completedRounds: [],
	lastAwardedPoints: 0,
	highestMultiplier: 1,
	gameOverReason: null,
};

export function classicGameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case "START_GAME":
			return {
				...initialGameState,
				sessionId: action.sessionId,
				status: "playing",
				currentChallenge: action.challenge,
				roundEndsAt: action.roundEndsAt,
			};

		case "CORRECT_ANSWER": {
			const currentUsedAnswers =
				state.usedAnswersByChallenge[action.round.challengeKey] ?? [];

			return {
				...state,
				score: state.score + action.round.awardedPoints,
				correctAnswers: state.correctAnswers + 1,
				currentChallenge: action.nextChallenge,
				roundEndsAt: action.nextRoundEndsAt,
				completedRounds: [...state.completedRounds, action.round],
				usedAnswersByChallenge: {
					...state.usedAnswersByChallenge,
					[action.round.challengeKey]: [
						...currentUsedAnswers,
						action.round.pokemonId,
					],
				},
				lastAwardedPoints: action.round.awardedPoints,
				highestMultiplier: Math.max(state.highestMultiplier, action.multiplier),
			};
		}

		case "END_GAME":
			return {
				...state,
				status: "gameOver",
				roundEndsAt: null,
				gameOverReason: action.reason,
			};

		default:
			return state;
	}
}
