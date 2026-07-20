import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import logo from "../assets/poketype-logo.webp";
import { GameModeGrid } from "../features/gamemode-selection/components/GameModeGrid.tsx";
import type { GameMode } from "../types";

interface EntryPageProps {
	version: string;
	onSelectGameMode: (gameMode: GameMode) => void;
}

export function EntryScreen({ version, onSelectGameMode }: EntryPageProps) {
	return (
		<Box
			component="main"
			sx={{
				minHeight: "100dvh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: {
					xs: "flex-start",
					md: "center",
				},
				px: {
					xs: 2,
					sm: 3,
				},
				py: {
					xs: 4,
					md: 6,
				},
				background: (theme) =>
					theme.palette.mode === "dark"
						? `radial-gradient(
                              circle at top,
                              ${theme.palette.primary.dark}33,
                              transparent 40%
                          )`
						: `radial-gradient(
                              circle at top,
                              ${theme.palette.primary.light}33,
                              transparent 40%
                          )`,
			}}
		>
			<Stack
				spacing={{
					xs: 4,
					md: 5,
				}}
				sx={{
					width: "100%",
					maxWidth: 1040,
				}}
			>
				<Box
					component="header"
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
					}}
				>
					<Box
						component="img"
						src={logo}
						alt="Poketype"
						sx={{
							display: "block",
							width: {
								xs: "min(100%, 360px)",
								sm: "min(100%, 480px)",
							},
							height: "auto",
							objectFit: "contain",
						}}
					/>

					<Typography
						component="p"
						variant="body1"
						color="text.secondary"
						sx={{
							mt: 1.5,
							fontWeight: 500,
							letterSpacing: "0.02em",
						}}
					>
						A Pokémon type quiz
						<Box component="span" aria-hidden="true" sx={{ mx: 1 }}>
							|
						</Box>
						<Box component="span" sx={{ whiteSpace: "nowrap" }}>
							v{version}
						</Box>
					</Typography>
				</Box>

				<Box component="section" aria-labelledby="game-mode-heading">
					<Typography
						id="game-mode-heading"
						component="h1"
						variant="h4"
						sx={{
							mb: 3,
							textAlign: "center",
							fontWeight: 800,
						}}
					>
						Choose your game mode
					</Typography>

					<GameModeGrid onSelect={onSelectGameMode} />
				</Box>
			</Stack>
		</Box>
	);
}
