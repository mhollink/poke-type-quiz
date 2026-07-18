import type { GameState } from "../types/game.ts";

export type AppScreen =
	| "home"
	| "mode-selection"
	| "settings"
	| "playing"
	| "game-over";

export type GameMode = "classic" | "single-type" | "daily-journey";

export interface AppState {
	screen: AppScreen;
	selectedMode: GameMode | null;
	game: GameState | null;
}

export type AppAction =
	| { type: "OPEN_MODE_SELECTION" }
	| { type: "OPEN_SETTINGS" }
	| { type: "RETURN_HOME" }
	| { type: "START_GAME"; mode: GameMode }
	| { type: "FINISH_GAME" }
	| { type: "PLAY_AGAIN" };

export const initialAppState: AppState = {
	screen: "home",
	selectedMode: null,
	game: null,
};
