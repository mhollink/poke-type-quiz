import type { GameMode } from "../types";

export type AppScreen = "home" | "settings" | "playing" | "pokedex";

export interface AppState {
	screen: AppScreen;
	selectedMode: GameMode | null;
}

export type AppAction =
	| { type: "OPEN_SETTINGS" }
	| { type: "START_GAME"; mode: GameMode }
	| { type: "OPEN_POKEDEX" }
	| { type: "RETURN_HOME" };

export const initialAppState: AppState = {
	screen: "home",
	selectedMode: null,
};
