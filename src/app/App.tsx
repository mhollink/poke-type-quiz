import {useReducer} from "react";
import {EntryScreen} from "../screens/EntryScreen.tsx";
import {appReducer} from "./appReducer.ts";
import {initialAppState} from "./appState.ts";
import {GameScreen} from "../screens/GameScreen.tsx";
import {assertNever} from "../utils/assert.ts";

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
            )
        case "playing":
            return (
                <GameScreen
                    gameMode={state.selectedMode!!}
                    onExit={() =>
                        dispatch({
                            type: "RETURN_HOME",
                        })
                    }
                />
            )
        case "settings":
            return null; // TODO: Implement settings screen

        default:
            assertNever(state.screen)
    }
}


