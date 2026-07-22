import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { DailyMoveGameState } from "../model/dailyMoveGameReducer.ts";

type DailyMoveGameResultProps = {
	state: DailyMoveGameState;
	onExit: () => void;
};

export function DailyMoveGameResult({
	state,
	onExit,
}: DailyMoveGameResultProps) {
	const percentage =
		state.challenge.maxScore === 0
			? 0
			: Math.round((state.score / state.challenge.maxScore) * 100);

	return (
		<Container
			component="main"
			maxWidth="sm"
			sx={{
				py: {
					xs: 4,
					md: 8,
				},
			}}
		>
			<Paper
				variant="outlined"
				sx={{
					p: {
						xs: 3,
						sm: 5,
					},
				}}
			>
				<Stack spacing={3} sx={{ textAlign: "center" }}>
					<Stack spacing={1}>
						<Typography component="h1" variant="h4">
							Daily complete
						</Typography>

						<Typography color="textSecondary">
							You selected the strongest move in {state.optimalSelections} of{" "}
							{state.challenge.rounds.length} battles.
						</Typography>
					</Stack>

					<Stack>
						<Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>
							{state.score.toLocaleString()}
						</Typography>

						<Typography color="textSecondary">
							of {state.challenge.maxScore.toLocaleString()} points
						</Typography>
					</Stack>

					<Typography variant="h6">
						{percentage}% of the daily maximum
					</Typography>

					<Button variant="contained" size="large" onClick={onExit}>
						Back to menu
					</Button>
				</Stack>
			</Paper>
		</Container>
	);
}
