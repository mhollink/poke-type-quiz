import type { GameMode } from "../../../types";
import type { Analytics } from "../model/Analytics";
import type { AbandonmentStage } from "../model/AnalyticsEventMap";

export interface StartedGame {
	mode: GameMode;
	startedAt: number;
}

export interface CompletedGame extends StartedGame {
	completedAt: number;
	score: number;
	correctAnswers: number;
	mistakes: number;
}

export interface AbandonedGame extends StartedGame {
	abandonedAt: number;
	correctAnswers: number;
}

export function trackGameStarted(
	analytics: Analytics,
	game: StartedGame,
): void {
	analytics.track("game_started", {
		game_mode: game.mode,
	});
}

export function trackGameCompleted(
	analytics: Analytics,
	game: CompletedGame,
): void {
	analytics.track("game_completed", {
		game_mode: game.mode,
		score: normalizeNonNegativeInteger(game.score),
		duration_seconds: calculateDurationSeconds(
			game.startedAt,
			game.completedAt,
		),
		correct_answers: normalizeNonNegativeInteger(game.correctAnswers),
		mistakes: normalizeNonNegativeInteger(game.mistakes),
	});
}

export function trackGameAbandoned(
	analytics: Analytics,
	game: AbandonedGame,
): void {
	analytics.track("game_abandoned", {
		game_mode: game.mode,
		duration_seconds: calculateDurationSeconds(
			game.startedAt,
			game.abandonedAt,
		),
		correct_answers: normalizeNonNegativeInteger(game.correctAnswers),
		abandonment_stage: determineAbandonmentStage(game.correctAnswers),
	});
}

function calculateDurationSeconds(
	startedAt: number,
	finishedAt: number,
): number {
	const durationMilliseconds = Math.max(0, finishedAt - startedAt);

	return Math.round(durationMilliseconds / 1_000);
}

function normalizeNonNegativeInteger(value: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.round(value));
}

function determineAbandonmentStage(correctAnswers: number): AbandonmentStage {
	if (correctAnswers < 3) {
		return "early";
	}

	if (correctAnswers < 10) {
		return "mid";
	}

	return "late";
}
