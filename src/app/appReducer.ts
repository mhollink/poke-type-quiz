import type { AppAction, AppState } from "./appState.ts";

export function appReducer(state: AppState, action: AppAction): AppState {
	switch (action.type) {
		case "OPEN_MODE_SELECTION":
			return {
				...state,
				screen: "mode-selection",
			};

		case "OPEN_SETTINGS":
			return {
				...state,
				screen: "settings",
			};

		case "RETURN_HOME":
			return {
				...state,
				screen: "home",
				game: null,
			};

		case "START_GAME":
			return {
				...state,
				screen: "playing",
				selectedMode: action.mode,
				game: createGame(action.mode),
			};

		case "FINISH_GAME":
			return {
				...state,
				screen: "game-over",
			};

		case "PLAY_AGAIN":
			if (!state.selectedMode) {
				return state;
			}

			return {
				...state,
				screen: "playing",
				game: createGame(state.selectedMode),
			};

		default:
			return state;
	}
}
