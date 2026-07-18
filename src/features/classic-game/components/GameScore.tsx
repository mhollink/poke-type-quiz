import { LinearProgress, Paper, Stack, Typography } from "@mui/material";

type GameScoreProps = {
	correctAnswers: number;
	multiplier: number;
	timeRemainingSeconds: number;
	timerProgress: number;
	lastAwardedPoints: number;
	score?: number;
};

export function GameScore({
	score,
	correctAnswers,
	multiplier,
	timeRemainingSeconds,
	timerProgress,
	lastAwardedPoints,
}: GameScoreProps) {
	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Stack spacing={2}>
				<Stack
					direction="row"
					sx={{ justifyContent: "space-between" }}
					spacing={2}
				>
					<ScoreValue label="Score" value={score?.toLocaleString() ?? "0"} />
					<ScoreValue label="Correct" value={String(correctAnswers)} />
					<ScoreValue label="Multiplier" value={`×${multiplier.toFixed(2)}`} />
					<ScoreValue label="Time" value={`${timeRemainingSeconds}s`} />
				</Stack>

				<LinearProgress
					variant="determinate"
					value={timerProgress}
					sx={{
						height: 20,
						borderRadius: 10,
					}}
					color={
						timerProgress <= 20
							? "error"
							: timerProgress <= 50
								? "warning"
								: "success"
					}
					aria-label={`${timeRemainingSeconds} seconds remaining`}
				/>

				{lastAwardedPoints > 0 && (
					<Typography
						variant="body2"
						color="success.main"
						aria-live="polite"
						sx={{ textAlign: "center" }}
					>
						+{lastAwardedPoints} points
					</Typography>
				)}
			</Stack>
		</Paper>
	);
}

type ScoreValueProps = {
	label: string;
	value: string;
};

function ScoreValue({ label, value }: ScoreValueProps) {
	return (
		<Stack sx={{ alignItems: "center" }}>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>

			<Typography variant="h6" sx={{ fontWeight: 700 }}>
				{value}
			</Typography>
		</Stack>
	);
}
