import type { GameMode } from "../../../types";

export type AbandonmentStage = "early" | "mid" | "late";

export interface AnalyticsEventMap {
	mode_selected: {
		game_mode: GameMode;
	};

	game_started: {
		game_mode: GameMode;
	};

	game_completed: {
		game_mode: GameMode;
		score: number;
		duration_seconds: number;
		correct_answers: number;
		mistakes: number;
	};

	game_abandoned: {
		game_mode: GameMode;
		duration_seconds: number;
		correct_answers: number;
		abandonment_stage: AbandonmentStage;
	};

	game_restarted: {
		game_mode: GameMode;
	};
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
