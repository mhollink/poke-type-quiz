import Box from "@mui/material/Box";

export interface ReversedGameProps {
	onExit: () => void;
}

export function ReversedGame({ onExit }: ReversedGameProps) {
	return <Box>Reversed game mode...</Box>;
}
