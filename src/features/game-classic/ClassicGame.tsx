import { Container, Paper, Stack, Typography } from "@mui/material";
import type { Pokemon } from "../../types";
import { pokemonData } from "../../utils";
import { createDailyDateKey } from "../game-daily/challenge/createDailySeed.ts";
import { GameScore } from "../game-shared/components/GameScore";
import { classicGameConfig } from "./classicGameConfig.ts";
import { ClassicChallenge } from "./components/ClassicChallenge";
import { ClassicGameResult } from "./components/ClassicGameResult.tsx";
import { PokemonAutocomplete } from "./components/PokemonAutocomplete";
import { useClassicGame } from "./hooks/useClassicGame";
import { localDailyAttemptRepository } from "./storage/dailyAttemptRepository.ts";
import {useMemo} from "react";
import {
	localGenerationSelectionRepository
} from "../generation-selection/storage/localGenerationSelectionRepository.ts";

interface ClassicGameProps {
	readonly onExit: () => void;
	readonly onOpenPokedex: () => void;
}

function ClassicGame({ onExit, onOpenPokedex }: ClassicGameProps) {
	const enabledGens = useMemo(() => localGenerationSelectionRepository.findEnabledGenerations(), []);
	const availablePokemon = useMemo(() => pokemonData.filter(pokemon => enabledGens.has(pokemon.gen)), [enabledGens]);
	const game = useClassicGame(availablePokemon);
	const todaysResult = localDailyAttemptRepository.findByDate(
		createDailyDateKey(new Date()),
	);

	function handleSubmit(pokemon: Pokemon): void {
		game.submitAnswer(pokemon);
	}

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
				<ClassicGameResult
					result={{
						score: todaysResult.score,
						correctAnswers: todaysResult.correctAnswers,
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
										pokemon={availablePokemon}
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
						<ClassicGameResult
							result={game.state}
							reason="already-played"
							onExit={onExit}
							onOpenPokedex={onOpenPokedex}
						/>
					)}
			</Stack>
		</Container>
	);
}

export default ClassicGame;
