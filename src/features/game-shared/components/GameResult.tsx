import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface GameResultAction {
	readonly label: string;
	readonly onClick: () => void;
}

export interface GameResultStatistic {
	readonly label: string;
	readonly value: string;
}

export interface GameResultProps {
	readonly title: string;
	readonly message: string;
	readonly score: number;
	readonly correctAnswers: number;
	readonly highestMultiplier: number;
	readonly statistics?: readonly GameResultStatistic[];
	readonly primaryAction: GameResultAction;
	readonly secondaryAction?: GameResultAction;
}

export function GameResult({
	title,
	message,
	score,
	correctAnswers,
	highestMultiplier,
	statistics = [],
	primaryAction,
	secondaryAction,
}: GameResultProps) {
	const displayedStatistics: readonly GameResultStatistic[] = [
		{
			label: "Final score",
			value: score.toLocaleString(),
		},
		{
			label: "Correct answers",
			value: correctAnswers.toLocaleString(),
		},
		{
			label: "Best multiplier",
			value: `${highestMultiplier.toFixed(2)}×`,
		},
		...statistics,
	];

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
			<Stack spacing={4} sx={{ alignItems: "center" }}>
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
					<EmojiEventsRoundedIcon
						sx={{
							fontSize: 40,
						}}
					/>
				</Box>

				<Stack spacing={1} sx={{ alignItems: "center" }}>
					<Typography
						component="h1"
						variant="h4"
						sx={{ fontWeight: 700, textWrap: "pretty" }}
					>
						{title}
					</Typography>

					<Typography
						color="textSecondary"
						sx={{
							maxWidth: 440,
							textWrap: "pretty",
						}}
					>
						{message}
					</Typography>
				</Stack>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "repeat(2, minmax(0, 1fr))",
							sm: `repeat(${Math.min(
								displayedStatistics.length,
								5,
							)}, minmax(0, 1fr))`,
						},
						width: "100%",
						border: 1,
						borderColor: "divider",
						borderRadius: 1,
						overflow: "hidden",
					}}
				>
					{displayedStatistics.map((statistic, index) => (
						<ResultMetric
							key={statistic.label}
							label={statistic.label}
							value={statistic.value}
							showLeftBorder={index > 0}
						/>
					))}
				</Box>

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
						startIcon={
							secondaryAction ? <ReplayRoundedIcon /> : <ArrowBackRoundedIcon />
						}
						onClick={primaryAction.onClick}
					>
						{primaryAction.label}
					</Button>

					{secondaryAction && (
						<Button
							variant="outlined"
							size="large"
							startIcon={<ArrowBackRoundedIcon />}
							onClick={secondaryAction.onClick}
						>
							{secondaryAction.label}
						</Button>
					)}
				</Stack>
			</Stack>
		</Paper>
	);
}

interface ResultMetricProps {
	readonly label: string;
	readonly value: string;
	readonly showLeftBorder: boolean;
}

function ResultMetric({ label, value, showLeftBorder }: ResultMetricProps) {
	return (
		<Stack
			spacing={0.5}
			sx={{
				minWidth: 0,
				px: 1.5,
				py: 2,
				borderLeft: {
					xs: 0,
					sm: showLeftBorder ? 1 : 0,
				},
				borderTop: {
					xs: showLeftBorder ? 1 : 0,
					sm: 0,
				},
				borderColor: "divider",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Typography
				variant="h6"
				noWrap
				sx={{
					fontWeight: 700,
				}}
			>
				{value}
			</Typography>

			<Typography
				variant="caption"
				color="textSecondary"
				sx={{
					textAlign: "center",
				}}
			>
				{label}
			</Typography>
		</Stack>
	);
}
