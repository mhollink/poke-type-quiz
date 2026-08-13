import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { type ComponentType, lazy, Suspense } from "react";
import type { GameMode } from "../types";

interface GameScreenProps {
  gameMode: GameMode;
  onExit: () => void;
  onOpenPokedex: () => void;
}

type GameComponent = ComponentType<
  Pick<GameScreenProps, "onExit" | "onOpenPokedex">
>;

const gameComponents: Record<GameMode, GameComponent> = {
  type_rush: lazy(() => import("../features/game-type-rush/DailyGame")),
  type_survival: lazy(
    () => import("../features/game-type-survival/./TypeSurvivalGame"),
  ),
  type_recall: lazy(() => import("../features/game-type-recall/ReversedGame")),
  battle_tactics: lazy(
    () => import("../features/game-battle-tactics/DailyMoveGame"),
  ),
};

export function GameScreen({
  gameMode,
  onExit,
  onOpenPokedex,
}: GameScreenProps) {
  const Game = gameComponents[gameMode];

  return (
    <Suspense fallback={<GameLoadingFallback />}>
      <Game onExit={onExit} onOpenPokedex={onOpenPokedex} />
    </Suspense>
  );
}

function GameLoadingFallback() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
