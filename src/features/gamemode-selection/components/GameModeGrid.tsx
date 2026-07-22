import Box from "@mui/material/Box";
import type { GameMode } from "../../../types";
import { gameModes } from "../gameModeOptions";
import { GameModeCard } from "./GameModeCard";

interface GameModeGridProps {
	onSelect: (gameMode: GameMode) => void;
}

export function GameModeGrid({ onSelect }: GameModeGridProps) {
	return (
		<Box
			component="ul"
			sx={{
				display: "grid",
				gridTemplateColumns: {
					xs: "1fr",
					sm: "repeat(2, minmax(0, 1fr))",
					lg: "repeat(4, minmax(0, 1fr))",
				},
				gap: 2,
				m: 0,
				p: 0,
				listStyle: "none",
			}}
		>
			{gameModes.map((gameMode) => (
				<Box component="li" key={gameMode.id}>
					<GameModeCard
						gameMode={gameMode}
						onSelect={() => onSelect(gameMode.id)}
					/>
				</Box>
			))}
		</Box>
	);
}
