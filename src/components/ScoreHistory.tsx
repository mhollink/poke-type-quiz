import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import type { DailyScore } from "../types/game.ts";
import { formatDate } from "../utils/date.ts";

type ScoreHistoryProps = {
	scores: readonly DailyScore[];
};

export function ScoreHistory({ scores }: ScoreHistoryProps) {
	if (scores.length === 0) {
		return null;
	}

	return (
		<section aria-labelledby="score-history-heading">
			<Typography
				id="score-history-heading"
				component="h2"
				variant="h5"
				sx={{ mb: 2, fontWeight: 700 }}
			>
				Score history
			</Typography>

			<TableContainer component={Paper} variant="outlined">
				<Table aria-label="Daily score history">
					<TableHead>
						<TableRow>
							<TableCell>Date</TableCell>
							<TableCell align="right">Best score</TableCell>
							<TableCell align="right">Correct</TableCell>
							<TableCell align="right">Attempts</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{scores.map((score) => (
							<TableRow key={score.date}>
								<TableCell component="th" scope="row">
									{formatDate(score.date)}
								</TableCell>

								<TableCell align="right">
									{score.bestScore.toLocaleString()}
								</TableCell>

								<TableCell align="right">{score.bestCorrectAnswers}</TableCell>

								<TableCell align="right">{score.attempts.length}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</section>
	);
}
