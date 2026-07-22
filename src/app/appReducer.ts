import type { AppAction, AppState } from "./appState.ts";

export function appReducer(state: AppState, action: AppAction): AppState {
	switch (action.type) {
		case "OPEN_SETTINGS":
			return {
				...state,
				screen: "settings",
			};

		case "OPEN_POKEDEX":
			return {
				...state,
				screen: "pokedex",
				selectedMode: null,
			};

		case "START_GAME":
			return {
				...state,
				screen: "playing",
				selectedMode: action.mode,
			};

		case "RETURN_HOME":
			return {
				...state,
				screen: "home",
				selectedMode: null,
			};

		default:
			return state;
	}
}
