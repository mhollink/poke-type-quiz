import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import {
	Box,
	Container,
	IconButton,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";

type AppHeaderProps = {
	soundEnabled: boolean;
	onToggleSound: () => void;
};

export function AppHeader({ soundEnabled, onToggleSound }: AppHeaderProps) {
	return (
		<Box
			component="header"
			sx={{
				borderBottom: 1,
				borderColor: "divider",
				py: 2,
			}}
		>
			<Container maxWidth="sm">
				<Stack
					direction="row"
					sx={{
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography component="h1" variant="h6" sx={{ fontWeight: 800 }}>
						Pokémon: Type Quiz
					</Typography>

					<Tooltip
						title={
							soundEnabled ? "Disable sound effects" : "Enable sound effects"
						}
					>
						<IconButton
							onClick={onToggleSound}
							aria-label={
								soundEnabled ? "Disable sound effects" : "Enable sound effects"
							}
						>
							{soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
						</IconButton>
					</Tooltip>
				</Stack>
			</Container>
		</Box>
	);
}
