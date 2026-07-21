import { Container, Paper, Stack, Typography } from "@mui/material";
import type { Pokemon } from "../../types";
import { pokemonData } from "../../utils";
import { GameResult } from "../game-shared/components/GameResult";
import { GameScore } from "../game-shared/components/GameScore";
import { classicGameConfig } from "./classicGameConfig.ts";
import { ClassicChallenge } from "./components/ClassicChallenge";
import { PokemonAutocomplete } from "./components/PokemonAutocomplete";
import { useClassicGame } from "./hooks/useClassicGame";

interface ClassicGameProps {
	readonly onExit: () => void;
}

function ClassicGame({ onExit }: ClassicGameProps) {
	const game = useClassicGame(pokemonData);

	function handleSubmit(pokemon: Pokemon): void {
		game.submitAnswer(pokemon);
	}

	return (
		<Container component="main" maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
			<Stack spacing={4}>
				{game.state.status === "playing" &&
					game.state.currentChallenge !== null && (
						<>
							<GameScore
								score={game.state.score}
								correctAnswers={game.state.correctAnswers}
								timeRemainingSeconds={game.timeRemainingSeconds}
								timerProgress={game.timerProgress}
								lastScore={game.state.lastScore}
							/>

							<Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
								<Stack spacing={4}>
									<Stack spacing={1} sx={{ alignItems: "center" }}>
										<ClassicChallenge challenge={game.state.currentChallenge} />

										<Typography variant="caption">
											{game.availableAnswerCount} valid answers remaining
										</Typography>
									</Stack>

									<PokemonAutocomplete
										key={[
											game.state.currentChallenge.key,
											game.state.correctAnswers,
										].join("-")}
										pokemon={pokemonData}
										excludedPokemonIds={game.state.usedPokemonIds}
										minimumSearchLength={classicGameConfig.minimumSearchLength}
										maximumSuggestions={classicGameConfig.maximumSuggestions}
										onSubmit={handleSubmit}
									/>
								</Stack>
							</Paper>
						</>
					)}

				{game.state.status === "game-over" &&
					game.state.gameOverReason !== null && (
						<GameResult
							title="Classic run complete"
							score={game.state.score}
							correctAnswers={game.state.correctAnswers}
							highestMultiplier={game.state.highestMultiplier}
							message={getGameOverMessage(game.state.gameOverReason)}
							primaryAction={{
								label: "Play again",
								onClick: game.startGame,
							}}
							secondaryAction={{
								label: "Exit",
								onClick: onExit,
							}}
						/>
					)}
			</Stack>
		</Container>
	);
}

function getGameOverMessage(
	reason: "incorrect-answer" | "time-expired" | "no-challenges-left",
): string {
	switch (reason) {
		case "incorrect-answer":
			return "That Pokémon does not match the requested type.";

		case "time-expired":
			return "You ran out of time.";

		case "no-challenges-left":
			return "You completed every available challenge.";
	}
}

export default ClassicGame;
