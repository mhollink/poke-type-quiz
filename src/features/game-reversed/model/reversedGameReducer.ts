import type {
	CompletedReversedRound,
	ReversedChallenge,
	ReversedGameOverReason,
	ReversedGameState,
} from "./reversedGameTypes";

export type ReversedGameAction =
	| {
			readonly type: "START_GAME";
			readonly sessionId: string;
			readonly challenge: ReversedChallenge;
			readonly roundEndsAt: number;
	  }
	| {
			readonly type: "CORRECT_ANSWER";
			readonly round: CompletedReversedRound;
			readonly nextChallenge: ReversedChallenge | null;
			readonly nextRoundEndsAt: number | null;
	  }
	| {
			readonly type: "END_GAME";
			readonly reason: ReversedGameOverReason;
	  };

export function createInitialReversedGameState(): ReversedGameState {
	return {
		sessionId: "",
		status: "playing",
		score: 0,
		correctAnswers: 0,
		currentChallenge: null,
		roundEndsAt: null,
		usedPokemonIds: new Set(),
		completedRounds: [],
		lastScore: null,
		highestMultiplier: 1,
		canonicalOrderAnswers: 0,
		gameOverReason: null,
	};
}

export function reversedGameReducer(
	state: ReversedGameState,
	action: ReversedGameAction,
): ReversedGameState {
	switch (action.type) {
		case "START_GAME":
			return {
				...createInitialReversedGameState(),
				sessionId: action.sessionId,
				currentChallenge: action.challenge,
				roundEndsAt: action.roundEndsAt,
			};

		case "CORRECT_ANSWER": {
			const usedPokemonIds = new Set(state.usedPokemonIds);
			usedPokemonIds.add(action.round.challenge.pokemon.id);

			const combinedMultiplier =
				action.round.score.speedMultiplier *
				action.round.score.difficultyMultiplier *
				action.round.score.streakMultiplier *
				action.round.score.precisionMultiplier;

			return {
				...state,
				score: state.score + action.round.score.totalPoints,
				correctAnswers: state.correctAnswers + 1,
				currentChallenge: action.nextChallenge,
				roundEndsAt: action.nextRoundEndsAt,
				usedPokemonIds,
				completedRounds: [...state.completedRounds, action.round],
				lastScore: action.round.score,
				highestMultiplier: Math.max(
					state.highestMultiplier,
					combinedMultiplier,
				),
				canonicalOrderAnswers:
					state.canonicalOrderAnswers +
					(action.round.challenge.pokemon.types.length > 1 &&
					action.round.canonicalOrder
						? 1
						: 0),
			};
		}

		case "END_GAME":
			return {
				...state,
				status: "game-over",
				roundEndsAt: null,
				gameOverReason: action.reason,
			};
	}
}
