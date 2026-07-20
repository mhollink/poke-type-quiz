import type { PokemonType } from "./pokemon";

export type GameMode = "daily" | "classic" | "reversed";

export type GameStatus = "idle" | "playing" | "gameOver";

export type ChallengeKey = string;

export type TypeChallenge = {
	key: ChallengeKey;
	types: PokemonType[];
	pokemonIds: string[];
};

export type UsedAnswersByChallenge = Record<ChallengeKey, string[]>;

export type GameOverReason =
	| "incorrect-answer"
	| "time-expired"
	| "no-challenges-left";

export type CompletedRound = {
	challengeKey: ChallengeKey;
	pokemonId: string;
	availableOptionCount: number;
	timeRemainingMs: number;
	awardedPoints: number;
};

export type GameState = {
	sessionId: string;
	status: GameStatus;
	score: number;
	correctAnswers: number;
	currentChallenge: TypeChallenge | null;
	roundEndsAt: number | null;
	usedAnswersByChallenge: UsedAnswersByChallenge;
	completedRounds: CompletedRound[];
	lastAwardedPoints: number;
	highestMultiplier: number;
	gameOverReason: GameOverReason | null;
};

export type ScoringConfig = {
	basePoints: number;
	minimumTimeFactor: number;
	referenceOptionCount: number;
	difficultyWeight: number;
	maximumDifficultyFactor: number;
	correctAnswersPerMultiplier: number;
	multiplierIncrement: number;
	maximumMultiplier: number;
};

export type GameConfig = {
	roundDurationMs: number;
	minimumSearchLength: number;
	maximumSuggestions: number;
	scoring: ScoringConfig;
};

export type ScoreCalculation = {
	points: number;
	timeFactor: number;
	difficultyFactor: number;
	multiplier: number;
};

export type StoredGameAttempt = {
	id: string;
	score: number;
	correctAnswers: number;
	highestMultiplier: number;
	completedAt: string;
	gameOverReason: GameOverReason;
};

export type DailyScore = {
	date: string;
	bestScore: number;
	bestCorrectAnswers: number;
	attempts: StoredGameAttempt[];
};

export type StoredScoreData = {
	version: 1;
	scoresByDate: Record<string, DailyScore>;
};
