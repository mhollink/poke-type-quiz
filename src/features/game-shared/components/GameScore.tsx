import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import StarsRounded from "@mui/icons-material/StarsRounded";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ScoreBreakdown } from "../model/scoreBreakdown";

export interface GameScoreProps {
	readonly score: number;
	readonly correctAnswers: number;
	readonly timeRemainingSeconds: number;
	readonly timerProgress: number;
	readonly lastScore: ScoreBreakdown | null;
}

export function GameScore({
	score,
	correctAnswers,
	timeRemainingSeconds,
	timerProgress,
	lastScore,
}: GameScoreProps) {
	const timerPercentage = Math.max(0, Math.min(100, timerProgress * 100));

	return (
		<Paper
			variant="outlined"
			sx={{
				overflow: "hidden",
			}}
		>
			<Stack
				direction={{
					xs: "column",
					sm: "row",
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
				<ScoreMetric
					icon={<StarsRounded fontSize="small" />}
					label="Score"
					value={score.toLocaleString()}
				/>

				<ScoreMetric
					icon={<CheckCircleOutlineRounded fontSize="small" />}
					label="Correct"
					value={correctAnswers.toLocaleString()}
				/>

				<ScoreMetric
					icon={<AccessTimeRounded fontSize="small" />}
					label="Time"
					value={`${timeRemainingSeconds}s`}
				/>
			</Stack>

			<LinearProgress
				variant="determinate"
				value={timerPercentage}
				aria-label={`${timeRemainingSeconds} seconds remaining`}
				sx={{
					height: 6,
				}}
			/>

			{lastScore !== null && <LastScoreBreakdown score={lastScore} />}
		</Paper>
	);
}

interface ScoreMetricProps {
	readonly icon: React.ReactNode;
	readonly label: string;
	readonly value: string;
}

function ScoreMetric({ icon, label, value }: ScoreMetricProps) {
	return (
		<Stack
			direction="row"
			spacing={1.5}
			sx={{
				alignItems: "center",
				flex: 1,
				minWidth: 0,
				px: 2.5,
				py: 2,
			}}
		>
			<Box
				color="text.secondary"
				sx={{
					display: "flex",
					flexShrink: 0,
				}}
			>
				{icon}
			</Box>

			<Box sx={{ minWidth: 0 }}>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{
						display: "block",
					}}
				>
					{label}
				</Typography>

				<Typography
					variant="h6"
					noWrap
					sx={{
						fontWeight: 700,
					}}
				>
					{value}
				</Typography>
			</Box>
		</Stack>
	);
}

interface LastScoreBreakdownProps {
	readonly score: ScoreBreakdown;
}

function LastScoreBreakdown({ score }: LastScoreBreakdownProps) {
	const combinedMultiplier =
		score.speedMultiplier *
		score.difficultyMultiplier *
		score.streakMultiplier *
		score.precisionMultiplier;

	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			spacing={{ xs: 0.5, sm: 2 }}
			sx={{
				borderTop: 1,
				borderColor: "divider",
				px: 2.5,
				py: 1.5,
				bgcolor: "action.hover",
				alignItems: {
					xs: "flex-start",
					sm: "center",
				},
				justifyContent: "space-between",
			}}
		>
			<Stack
				direction="row"
				spacing={1}
				sx={{
					alignItems: "center",
				}}
			>
				<LocalFireDepartmentRounded fontSize="small" color="action" />

				<Typography variant="body2" color="text.secondary">
					Last answer
				</Typography>
			</Stack>

			<Typography
				variant="body2"
				sx={{
					fontWeight: 600,
				}}
			>
				+{score.totalPoints.toLocaleString()} points
				{" · "}
				{formatMultiplier(combinedMultiplier)}
			</Typography>
		</Stack>
	);
}

function formatMultiplier(value: number): string {
	return `${value.toFixed(2)}×`;
}
