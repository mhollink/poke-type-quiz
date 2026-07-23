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

export type MoveQualityTier = "best" | "good" | "okay" | "weak";

export type MoveTierDefinition = {
	id: MoveQualityTier;
	minRatio: number;
	maxRatio: number;
	targetRatio: number;
};

export const MOVE_TIERS: readonly MoveTierDefinition[] = [
	{
		id: "best",
		minRatio: 1,
		maxRatio: 1,
		targetRatio: 1,
	},
	{
		id: "good",
		minRatio: 0.6,
		maxRatio: 0.85,
		targetRatio: 0.72,
	},
	{
		id: "okay",
		minRatio: 0.3,
		maxRatio: 0.6,
		targetRatio: 0.45,
	},
	{
		id: "weak",
		minRatio: 0,
		maxRatio: 0.3,
		targetRatio: 0.15,
	},
];