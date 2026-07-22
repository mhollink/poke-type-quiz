import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type DailyMoveGameScoreProps = {
	score: number;
	maxScore: number;
	roundNumber: number;
	roundCount: number;
	optimalSelections: number;
};

export function DailyMoveGameScore({
	score,
	maxScore,
	roundNumber,
	roundCount,
	optimalSelections,
}: DailyMoveGameScoreProps) {
	const progress = roundCount === 0 ? 0 : (roundNumber / roundCount) * 100;

	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Stack spacing={2}>
				<Stack
					direction="row"
					sx={{
						justifyContent: "space-between",
						alignItems: "baseline",
					}}
				>
					<Stack>
						<Typography variant="caption" color="textSecondary">
							Score
						</Typography>

						<Typography variant="h5" sx={{ fontWeight: 700 }}>
							{score.toLocaleString()}
						</Typography>
					</Stack>

					<Stack sx={{ textAlign: "right" }}>
						<Typography variant="caption" color="textSecondary">
							Best moves
						</Typography>

						<Typography variant="h6" sx={{ fontWeight: 700 }}>
							{optimalSelections}
						</Typography>
					</Stack>
				</Stack>

				<Stack spacing={0.75}>
					<Typography variant="body2" color="textSecondary">
						Pokémon {roundNumber} of {roundCount}
					</Typography>

					<LinearProgress variant="determinate" value={progress} />
				</Stack>

				<Typography variant="caption" color="textSecondary">
					Daily maximum: {maxScore.toLocaleString()}
				</Typography>
			</Stack>
		</Paper>
	);
}
