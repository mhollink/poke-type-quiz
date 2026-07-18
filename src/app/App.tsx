import { useReducer } from "react";
import { EntryScreen } from "../screens/EntryScreen.tsx";
import { GameScreen } from "../screens/GameScreen.tsx";
import { assertNever } from "../utils/assert.ts";
import { appReducer } from "./appReducer.ts";
import { initialAppState } from "./appState.ts";

export function App() {
	const [state, dispatch] = useReducer(appReducer, initialAppState);

	if (state.screen === "home") {
		return (
			<EntryScreen
				version={__APP_VERSION__}
				onSelectGameMode={(gameMode) => {
					dispatch({
						type: "START_GAME",
						mode: gameMode,
					});
				}}
			/>
		);
	}

	if (state.screen === "playing") {
		if (!state.selectedMode) throw new Error("No gamemode selected!");
		return (
			<GameScreen
				gameMode={state.selectedMode}
				onExit={() =>
					dispatch({
						type: "RETURN_HOME",
					})
				}
			/>
		);
	}

	if (state.screen === "settings") {
		return null;
	}

	assertNever(state.screen);
}
