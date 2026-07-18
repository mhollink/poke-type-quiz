import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { GameModeOption } from "../gameModeTypes.ts";

export interface GameModeCardProps {
	gameMode: GameModeOption;
	onSelect: () => void;
}

export function GameModeCard({ gameMode, onSelect }: GameModeCardProps) {
	return (
		<Card
			variant="outlined"
			sx={{
				height: "100%",
				aspectRatio: {
					xs: "auto",
					sm: "1 / 1",
				},
				minHeight: {
					xs: 220,
					sm: "auto",
				},
				position: "relative",
				overflow: "visible",
				borderRadius: 4,
				opacity: gameMode.disabled ? 0.65 : 1,
				transition: (theme) =>
					theme.transitions.create(
						["transform", "box-shadow", "border-color", "opacity"],
						{
							duration: theme.transitions.duration.shorter,
						},
					),
				"&:hover": gameMode.disabled
					? {}
					: {
							transform: "translateY(-6px)",
							borderColor: "primary.main",
							boxShadow: 8,
						},
				"&:focus-within": {
					borderColor: gameMode.disabled ? "divider" : "primary.main",
				},
			}}
		>
			<CardActionArea
				onClick={onSelect}
				disabled={gameMode.disabled}
				aria-label={
					gameMode.disabled
						? `${gameMode.title} (Coming Soon)`
						: `Play ${gameMode.title}`
				}
				sx={{
					height: "100%",
					borderRadius: "inherit",
					px: {
						xs: 3,
						md: 2.5,
					},
					py: 3,
					"&:focus-visible": {
						outline: (theme) => `3px solid ${theme.palette.primary.main}`,
						outlineOffset: 3,
					},
				}}
			>
				{(gameMode.badge || gameMode.disabled) && (
					<Chip
						label={gameMode.disabled ? "Coming Soon" : gameMode.badge}
						color={gameMode.disabled ? "default" : "primary"}
						size="small"
						sx={{
							position: "absolute",
							top: 16,
							right: 16,
							fontWeight: 700,
						}}
					/>
				)}

				<Stack
					spacing={2}
					sx={{
						height: "100%",
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
					}}
				>
					<Box
						aria-hidden="true"
						sx={{
							width: 72,
							height: 72,
							display: "grid",
							placeItems: "center",
							borderRadius: "50%",
							bgcolor: gameMode.disabled
								? "action.disabledBackground"
								: "primary.main",
							color: gameMode.disabled
								? "text.disabled"
								: "primary.contrastText",
							fontSize: 38,
							boxShadow: gameMode.disabled
								? "none"
								: (theme) => `0 8px 24px ${theme.palette.primary.main}55`,
						}}
					>
						{gameMode.icon}
					</Box>

					<Typography
						component="h2"
						variant="h5"
						sx={{
							fontWeight: 800,
						}}
					>
						{gameMode.title}
					</Typography>

					<Typography
						variant="body2"
						color="text.secondary"
						sx={{
							maxWidth: 260,
							lineHeight: 1.6,
						}}
					>
						{gameMode.description}
					</Typography>
				</Stack>
			</CardActionArea>
		</Card>
	);
}
