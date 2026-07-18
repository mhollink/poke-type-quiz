import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface GameHeaderProps {
	title: string;
	description: string;
	onExit: () => void;
}

export function GameHeader({ title, description, onExit }: GameHeaderProps) {
	return (
		<Stack
			component="header"
			direction="row"
			spacing={2}
			sx={{
				alignItems: "flex-start",
				justifyContent: "space-between",
			}}
		>
			<Stack
				direction="row"
				spacing={1.5}
				sx={{
					alignItems: "flex-start",
				}}
			>
				<IconButton aria-label="Return to game modes" onClick={onExit}>
					<ArrowBackRoundedIcon />
				</IconButton>

				<Box>
					<Typography
						component="h1"
						variant="h4"
						sx={{
							fontWeight: 800,
						}}
					>
						{title}
					</Typography>

					<Typography
						color="text.secondary"
						sx={{
							mt: 0.5,
						}}
					>
						{description}
					</Typography>
				</Box>
			</Stack>
		</Stack>
	);
}
