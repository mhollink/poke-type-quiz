import { ClassicGame } from "../features/classic-game/ClassicGame.tsx";
import type { GameMode } from "../features/game-modes/gameModeTypes.ts";
import { SingleTypeGame } from "../features/single-type-game/SingleTypeGame.tsx";

interface GameScreenProps {
	gameMode: GameMode;
	onExit: () => void;
}

export function GameScreen({ gameMode, onExit }: GameScreenProps) {
	switch (gameMode) {
		case "classic":
			return <ClassicGame onExit={onExit} />;

		case "single-type":
			return <SingleTypeGame onExit={onExit} />;

		case "daily":
			throw new Error(`Game mode "${gameMode}" is not implemented.`);

		default:
			return assertNever(gameMode);
	}
}

function assertNever(value: never): never {
	throw new Error(`Unsupported game mode: ${String(value)}`);
}
