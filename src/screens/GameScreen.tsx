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
	daily: lazy(() => import("../features/game-daily/DailyGame")),
	classic: lazy(() => import("../features/game-classic/ClassicGame")),
	reversed: lazy(() => import("../features/game-reversed/ReversedGame")),
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
		<div className="game-loading" role="status" aria-live="polite">
			Loading game…
		</div>
	);
}
