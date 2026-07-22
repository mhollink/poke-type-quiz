import type { Move, Pokemon } from "../../../types";
import type { MoveScoreBreakdown } from "./Score.ts";

export type DailyMoveOption = {
	move: Move;
	hitCount: number;
	score: MoveScoreBreakdown;
};

export type DailyMoveRound = {
	index: number;
	pokemon: Pokemon;
	options: readonly DailyMoveOption[];
	maxScore: number;
};

export type DailyMoveChallenge = {
	dateKey: string;
	rounds: readonly DailyMoveRound[];
	maxScore: number;
};
