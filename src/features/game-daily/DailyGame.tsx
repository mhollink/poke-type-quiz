import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { pokemonData } from "../../utils";
import { PokemonAutocomplete } from "../game-classic/components/PokemonAutocomplete.tsx";
import { GameScore } from "../game-shared/components/GameScore";
import { DailyAnswerFeedback } from "./components/DailyAnswerFeedback.tsx";
import { DailyChallenge } from "./components/DailyChallenge";
import { DailyGameResult } from "./components/DailyGameResult.tsx";
import { useDailyGame } from "./hooks/useDailyGame";

interface DailyGameProps {
	readonly onExit: () => void;
}

function DailyGame({ onExit }: DailyGameProps) {
	const game = useDailyGame(pokemonData);

	if (game.existingAttempt !== null && game.state.status !== "game-over") {
		return (
			<Container component="main" maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
				<DailyGameResult
					attempt={game.existingAttempt}
					reason="already-played"
					onExit={onExit}
				/>
			</Container>
		);
	}

	return (
		<Container component="main" maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
			<Stack spacing={4}>
				{game.state.status === "playing" &&
					game.state.currentChallenge !== null && (
						<>
							<Stack
								spacing={1}
								sx={{
									textAlign: "center",
								}}
							>
								<Stack
									direction="row"
									spacing={1}
									sx={{
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<CalendarMonthRoundedIcon color="action" fontSize="small" />

									<Typography
										component="h1"
										variant="h5"
										sx={{ fontWeight: 700 }}
									>
										Daily Challenge
									</Typography>
								</Stack>

								<Typography variant="body2" color="text.secondary">
									One attempt. Five minutes. Build the longest streak you can.
								</Typography>
							</Stack>

							<GameScore
								score={game.state.score}
								correctAnswers={game.state.correctAnswers}
								timeRemainingSeconds={game.timeRemainingSeconds}
								timerProgress={game.timerProgress}
								lastScore={game.state.lastScore}
							/>

							<DailyRunStats
								streak={game.state.streak}
								highestStreak={game.state.highestStreak}
								mistakes={game.state.mistakes}
							/>

							<Paper
								variant="outlined"
								sx={{
									p: {
										xs: 3,
										sm: 4,
									},
								}}
							>
								<Stack spacing={4}>
									<DailyChallenge challenge={game.state.currentChallenge} />

									<Stack spacing={1}>
										<PokemonAutocomplete
											key={game.state.currentChallenge.id}
											pokemon={pokemonData}
											excludedPokemonIds={game.state.usedPokemonIds}
											minimumSearchLength={2}
											maximumSuggestions={8}
											onSubmit={game.submitAnswer}
										/>

										<DailyAnswerFeedback result={game.submissionResult} />
									</Stack>
								</Stack>
							</Paper>
						</>
					)}

				{game.state.status === "game-over" &&
					game.state.gameOverReason !== null && (
						<DailyGameResult
							attempt={{
								score: game.state.score,
								correctAnswers: game.state.correctAnswers,
								mistakes: game.state.mistakes,
								highestStreak: game.state.highestStreak,
							}}
							reason={game.state.gameOverReason}
							onExit={onExit}
						/>
					)}
			</Stack>
		</Container>
	);
}

interface DailyRunStatsProps {
	readonly streak: number;
	readonly highestStreak: number;
	readonly mistakes: number;
}

function DailyRunStats({
	streak,
	highestStreak,
	mistakes,
}: DailyRunStatsProps) {
	return (
		<Paper variant="outlined">
			<Stack
				direction="row"
				divider={
					<Stack
						sx={{
							borderLeft: 1,
							borderColor: "divider",
						}}
					/>
				}
			>
				<DailyStat label="Current streak" value={streak} />
				<DailyStat label="Best streak" value={highestStreak} />
				<DailyStat label="Mistakes" value={mistakes} />
			</Stack>
		</Paper>
	);
}

interface DailyStatProps {
	readonly label: string;
	readonly value: number;
}

function DailyStat({ label, value }: DailyStatProps) {
	return (
		<Stack
			spacing={0.5}
			sx={{
				py: 1.5,
				px: 1,
				alignItems: "center",
				flex: 1,
			}}
		>
			<Typography variant="h6" sx={{ fontWeight: 700 }}>
				{value}
			</Typography>

			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ textAlign: "center" }}
			>
				{label}
			</Typography>
		</Stack>
	);
}

export default DailyGame;