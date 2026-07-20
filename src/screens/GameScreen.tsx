import { ClassicGame } from "../features/game-classic";
import { DailyGame } from "../features/game-daily";
import { ReversedGame } from "../features/game-reversed";
import type { GameMode } from "../types";
import { assertNever } from "../utils";

interface GameScreenProps {
	gameMode: GameMode;
	onExit: () => void;
}

export function GameScreen({ gameMode, onExit }: GameScreenProps) {
	switch (gameMode) {
		case "daily":
			return <DailyGame onExit={onExit} />;

		case "classic":
			return <ClassicGame onExit={onExit} />;

		case "reversed":
			return <ReversedGame onExit={onExit} />;

		default:
			return assertNever(gameMode);
	}
}
