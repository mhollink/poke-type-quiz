import type {GameMode} from "../features/game-modes/gameModeTypes.ts";

export type AppScreen =
    | "home"
    | "settings"
    | "playing";

export interface AppState {
    screen: AppScreen;
    selectedMode: GameMode | null;
}

export type AppAction =
    | { type: "OPEN_SETTINGS" }
    | { type: "START_GAME"; mode: GameMode }
    | { type: "RETURN_HOME" };

export const initialAppState: AppState = {
    screen: "home",
    selectedMode: null,
};
