import type { GameMode } from "~/types";

export type AppScreen = "home" | "settings" | "playing" | "pokedex" | "movedex";

export interface AppState {
  screen: AppScreen;
  selectedMode: GameMode | null;
}

export type AppAction =
  | { type: "OPEN_SETTINGS" }
  | { type: "START_GAME"; mode: GameMode }
  | { type: "OPEN_POKEDEX" }
  | { type: "OPEN_MOVEDEX" }
  | { type: "RETURN_HOME" };

export const initialAppState: AppState = {
  screen: "home",
  selectedMode: null,
};
