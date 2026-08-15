import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { type ComponentType, lazy, Suspense } from "react";
import type { GameMode } from "../types";

interface GameScreenProps {
  gameMode: GameMode;
  onExit: () => void;
  onNext: (gamemode: GameMode) => void;
  onOpenPokedex: () => void;
}

type GameComponent = ComponentType<
  Pick<GameScreenProps, "onExit" | "onNext" | "onOpenPokedex">
>;

const gameComponents: Record<GameMode, GameComponent> = {
  type_rush: lazy(() => import("../features/game-type-rush/TypeRushGame")),
  type_survival: lazy(
    () => import("../features/game-type-survival/TypeSurvivalGame"),
  ),
  type_recall: lazy(
    () => import("../features/game-type-recall/TypeRecallGame"),
  ),
  battle_tactics: lazy(
    () => import("../features/game-battle-tactics/BattleTacticsGame"),
  ),
};

export function GameScreen({
  gameMode,
  onExit,
  onNext,
  onOpenPokedex,
}: GameScreenProps) {
  const Game = gameComponents[gameMode];

  return (
    <Suspense fallback={<GameLoadingFallback />}>
      <Game onExit={onExit} onNext={onNext} onOpenPokedex={onOpenPokedex} />
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
