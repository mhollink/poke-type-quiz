import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { usePokemonData } from "../../hooks/usePokemonData.ts";
import { createDailyDateKey } from "../game-daily/challenge/createDailySeed.ts";
import { GameScore } from "../game-shared/components/GameScore";
import { PokemonChallenge } from "./components/PokemonChallenge";
import { ReversedGameResult } from "./components/ReversedGameResult";
import { TypeAnswerInput } from "./components/TypeAnswerInput";
import { useReversedGame } from "./hooks/useReversedGame";
import { localDailyAttemptRepository } from "./storage/dailyAttemptRepository.ts";

interface ReversedGameProps {
	readonly onExit: () => void;
	readonly onOpenPokedex: () => void;
}

function ReversedGame({ onExit, onOpenPokedex }: ReversedGameProps) {
	const { availablePokemon } = usePokemonData();
	const game = useReversedGame(availablePokemon);

	const todaysResult = useMemo(
		() =>
			localDailyAttemptRepository.findByDate(createDailyDateKey(new Date())),
		[],
	);

	if (todaysResult) {
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
				<ReversedGameResult
					result={{
						score: todaysResult.score,
						correctAnswers: todaysResult.correctAnswers,
						canonicalOrderAnswers: todaysResult.canonicalOrderAnswers,
						highestMultiplier: todaysResult.highestMultiplier,
					}}
					reason="already-played"
					onExit={onExit}
					onOpenPokedex={onOpenPokedex}
				/>
			</Container>
		);
	}

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
			<Stack spacing={4}>
				{game.state.status === "game-over" &&
					game.state.gameOverReason !== null && (
						<ReversedGameResult
							result={game.state}
							reason={game.state.gameOverReason}
							onExit={onExit}
							onOpenPokedex={onOpenPokedex}
						/>
					)}

				{game.state.status === "playing" &&
					game.state.currentChallenge !== null && (
						<>
							<Stack spacing={1} sx={{ textAlign: "center" }}>
								<Typography
									component="h1"
									variant="h5"
									sx={{ fontWeight: 700 }}
								>
									Reversed
								</Typography>

								<Typography variant="body2" color="textSecondary">
									Identify each Pokémon&apos;s type before time runs out.
								</Typography>
							</Stack>

							<GameScore
								score={game.state.score}
								correctAnswers={game.state.correctAnswers}
								timeRemainingSeconds={game.timeRemainingSeconds}
								timerProgress={game.timerProgress}
								lastScore={game.state.lastScore}
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
									<PokemonChallenge challenge={game.state.currentChallenge} />

									<TypeAnswerInput
										challengeId={game.state.currentChallenge.id}
										availableTypes={game.availableTypes}
										requiredTypeCount={
											game.state.currentChallenge.pokemon.types.length
										}
										onSubmit={game.submitAnswer}
									/>
								</Stack>
							</Paper>
						</>
					)}
			</Stack>
		</Container>
	);
}

export default ReversedGame;
