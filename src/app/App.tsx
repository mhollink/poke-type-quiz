import { useReducer } from "react";
import { EntryScreen } from "../screens/EntryScreen.tsx";
import { appReducer } from "./appReducer.ts";
import { initialAppState } from "./appState.ts";

export function App() {
	const [state, dispatch] = useReducer(appReducer, initialAppState);

	switch (state.screen) {
		case "home":
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

		case "settings":
			return (
				<SettingsScreen onBack={() => dispatch({ type: "RETURN_HOME" })} />
			);

		case "playing":
			return state.game ? (
				<GameScreen
					mode={state.selectedMode!}
					game={state.game}
					onGameOver={() => dispatch({ type: "FINISH_GAME" })}
				/>
			) : null;

		case "game-over":
			return (
				<GameOverScreen
					game={state.game}
					onPlayAgain={() => dispatch({ type: "PLAY_AGAIN" })}
					onHome={() => dispatch({ type: "RETURN_HOME" })}
				/>
			);
	}
}
