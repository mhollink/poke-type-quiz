import Box from "@mui/material/Box";

export interface DailyGameProps {
	onExit: () => void;
}

export function DailyGame({ onExit }: DailyGameProps) {
	return <Box>Daily game challenge</Box>;
}
