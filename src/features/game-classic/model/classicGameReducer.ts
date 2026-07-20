import type {
	ClassicGameOverReason,
	ClassicGameState,
	CompletedClassicRound,
	TypeChallenge,
} from "./classicGameTypes";

export type ClassicGameAction =
	| {
			readonly type: "START_GAME";
			readonly sessionId: string;
			readonly challenge: TypeChallenge;
			readonly startedAt: number;
			readonly roundEndsAt: number;
	  }
	| {
			readonly type: "CORRECT_ANSWER";
			readonly round: CompletedClassicRound;
			readonly nextChallenge: TypeChallenge | null;
			readonly nextRoundEndsAt: number | null;
	  }
	| {
			readonly type: "END_GAME";
			readonly reason: ClassicGameOverReason;
	  };

export const createInitialClassicGameState = (): ClassicGameState => ({
	sessionId: "",
	status: "playing",
	score: 0,
	correctAnswers: 0,
	currentChallenge: null,
	startedAt: null,
	roundEndsAt: null,
	usedPokemonIds: new Set<string>(),
	completedRounds: [],
	lastScore: null,
	highestMultiplier: 1,
	gameOverReason: null,
});

export function classicGameReducer(
	state: ClassicGameState,
	action: ClassicGameAction,
): ClassicGameState {
	switch (action.type) {
		case "START_GAME":
			return {
				...createInitialClassicGameState(),
				sessionId: action.sessionId,
				currentChallenge: action.challenge,
				roundEndsAt: action.roundEndsAt,
				startedAt: action.startedAt
			};

		case "CORRECT_ANSWER": {
			const usedPokemonIds = new Set(state.usedPokemonIds);
			usedPokemonIds.add(action.round.answer.id);

			const combinedMultiplier =
				action.round.score.speedMultiplier *
				action.round.score.difficultyMultiplier;

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
