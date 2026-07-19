import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import ReplayRounded from "@mui/icons-material/ReplayRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface GameResultAction {
	readonly label: string;
	readonly onClick: () => void;
}

export interface GameResultProps {
	readonly title: string;
	readonly message: string;
	readonly score: number;
	readonly correctAnswers: number;
	readonly highestMultiplier: number;
	readonly primaryAction: GameResultAction;
	readonly secondaryAction: GameResultAction;
}

export function GameResult({
	title,
	message,
	score,
	correctAnswers,
	highestMultiplier,
	primaryAction,
	secondaryAction,
}: GameResultProps) {
	return (
		<Paper
			variant="outlined"
			sx={{
				p: {
					xs: 3,
					sm: 5,
				},
				textAlign: "center",
			}}
		>
			<Stack
				spacing={4}
				sx={{
					alignItems: "center",
				}}
			>
				<Box
					sx={{
						display: "grid",
						placeItems: "center",
						width: 72,
						height: 72,
						borderRadius: "50%",
						bgcolor: "action.hover",
					}}
				>
					<EmojiEventsRounded
						sx={{
							fontSize: 40,
						}}
					/>
				</Box>

				<Stack spacing={1}>
					<Typography
						component="h1"
						variant="h4"
						sx={{
							fontWeight: 700,
						}}
					>
						{title}
					</Typography>

					<Typography
						color="text.secondary"
						sx={{
							maxWidth: 420,
						}}
					>
						{message}
					</Typography>
				</Stack>

				<Stack
					direction={{
						xs: "column",
						sm: "row",
					}}
					sx={{
						width: "100%",
					}}
					divider={
						<Box
							sx={{
								borderColor: "divider",
								borderStyle: "solid",
								borderWidth: {
									xs: "1px 0 0",
									sm: "0 0 0 1px",
								},
							}}
						/>
					}
				>
					<ResultMetric label="Final score" value={score.toLocaleString()} />

					<ResultMetric
						label="Correct answers"
						value={correctAnswers.toLocaleString()}
					/>

					<ResultMetric
						label="Best multiplier"
						value={`${highestMultiplier.toFixed(2)}×`}
					/>
				</Stack>

				<Stack
					direction={{
						xs: "column",
						sm: "row",
					}}
					spacing={1.5}
					sx={{
						justifyContent: "center",
						width: "100%",
					}}
				>
					<Button
						variant="contained"
						size="large"
						startIcon={<ReplayRounded />}
						onClick={primaryAction.onClick}
					>
						{primaryAction.label}
					</Button>

					<Button
						variant="outlined"
						size="large"
						startIcon={<ArrowBackRounded />}
						onClick={secondaryAction.onClick}
					>
						{secondaryAction.label}
					</Button>
				</Stack>
			</Stack>
		</Paper>
	);
}

interface ResultMetricProps {
	readonly label: string;
	readonly value: string;
}

function ResultMetric({ label, value }: ResultMetricProps) {
	return (
		<Stack
			spacing={0.5}
			sx={{
				px: 2,
				py: {
					xs: 2,
					sm: 0,
				},
				flex: 1,
			}}
		>
			<Typography variant="h5" sx={{ fontWeight: 700 }}>
				{value}
			</Typography>

			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
		</Stack>
	);
}
