import { ClassicGame } from "../features/classic-game/ClassicGame.tsx";
import type { GameMode } from "../features/game-modes/gameModeTypes.ts";

interface GameScreenProps {
	gameMode: GameMode;
	onExit: () => void;
}

export function GameScreen({ gameMode, onExit }: GameScreenProps) {
	switch (gameMode) {
		case "classic":
			return <ClassicGame onExit={onExit} />;

		case "daily":
		case "single-type":
			throw new Error(`Game mode "${gameMode}" is not implemented.`);

		default:
			return assertNever(gameMode);
	}
}

function assertNever(value: never): never {
	throw new Error(`Unsupported game mode: ${String(value)}`);
}
