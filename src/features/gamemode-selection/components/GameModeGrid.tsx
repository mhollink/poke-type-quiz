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
					sm: "repeat(4, minmax(0, 1fr))",
					lg: "repeat(3, minmax(0, 1fr))",
				},
				gap: 3,
				m: 0,
				p: 0,
				listStyle: "none",
			}}
		>
			{gameModes.map((gameMode, index) => (
				<Box
					component="li"
					key={gameMode.id}
					sx={{
						minWidth: 0,
						gridColumn: {
							xs: "auto",
							sm: index === 2 ? "2 / span 2" : "span 2",
							lg: "auto",
						},
					}}
				>
					<GameModeCard
						gameMode={gameMode}
						onSelect={() => onSelect(gameMode.id)}
					/>
				</Box>
			))}
		</Box>
	);
}
