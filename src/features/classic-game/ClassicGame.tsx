import { Container, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../../components/GameHeader.tsx";
import { GameOver } from "../../components/GameOver.tsx";
import { GameScore } from "../../components/GameScore.tsx";
import { PokemonAutocomplete } from "../../components/PokemonAutocomplete.tsx";
import { ScoreHistory } from "../../components/ScoreHistory.tsx";
import { TypeChallenge } from "../../components/TypeChallenge.tsx";
import { useSoundPreference } from "../../hooks/useSoundPreference.ts";
import type { Pokemon } from "../../types/pokemon.ts";
import { getValidPokemonForChallenge } from "../../utils/challenge.ts";
import { getLocalDateKey } from "../../utils/date";
import { pokemonData } from "../../utils/pokemon";
import { playPokemonCry } from "../../utils/pokemonCry.ts";
import { takeRandom } from "../../utils/random.ts";
import { calculateMultiplier, defaultGameConfig } from "../../utils/scoring";
import { getScoreHistory, saveGameAttempt } from "../../utils/storage";
import { useGame } from "./useGame.ts";

interface ClassicGameProps {
	onExit: () => void;
}

export function ClassicGame({ onExit }: ClassicGameProps) {
	const game = useGame(pokemonData, defaultGameConfig);
	const { soundEnabled } = useSoundPreference();

	const [scoreHistory, setScoreHistory] = useState(getScoreHistory);

	const savedSessionId = useRef<string | null>(null);

	const currentMultiplier = useMemo(
		() =>
			calculateMultiplier(game.state.correctAnswers, defaultGameConfig.scoring),
		[game.state.correctAnswers],
	);

	const todayScore = scoreHistory.find(
		(score) => score.date === getLocalDateKey(),
	);

	const potentialAnswers =
		game.state.currentChallenge === null
			? []
			: takeRandom(
					getValidPokemonForChallenge(pokemonData, game.state.currentChallenge),
					5,
				).sort((a, b) => a.nr - b.nr);

	function handlePokemonSubmit(pokemon: Pokemon): void {
		const wasCorrect = game.submitPokemon(pokemon);
		if (wasCorrect && soundEnabled) {
			void playPokemonCry(pokemon);
		}
	}

	useEffect(() => {
		if (
			game.state.status !== "gameOver" ||
			!game.state.gameOverReason ||
			!game.state.sessionId ||
			savedSessionId.current === game.state.sessionId
		) {
			return;
		}

		savedSessionId.current = game.state.sessionId;

		saveGameAttempt({
			id: game.state.sessionId,
			score: game.state.score,
			correctAnswers: game.state.correctAnswers,
			highestMultiplier: game.state.highestMultiplier,
			completedAt: new Date().toISOString(),
			gameOverReason: game.state.gameOverReason,
		});

		setScoreHistory(getScoreHistory());
	}, [
		game.state.status,
		game.state.gameOverReason,
		game.state.sessionId,
		game.state.score,
		game.state.correctAnswers,
		game.state.highestMultiplier,
	]);

	return (
		<Container component="main" maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
			<Stack spacing={4}>
				<GameHeader
					title={"Classic"}
					description={
						"Name Pokémon matching the exact displayed type combination."
					}
					onExit={onExit}
				/>

				{game.state.status === "playing" && game.state.currentChallenge && (
					<>
						<GameScore
							score={game.state.score}
							correctAnswers={game.state.correctAnswers}
							multiplier={currentMultiplier}
							timeRemainingSeconds={game.timeRemainingSeconds}
							timerProgress={game.timerProgress}
							lastAwardedPoints={game.state.lastAwardedPoints}
						/>

						<Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
							<Stack spacing={4}>
								<Stack spacing={1} sx={{ alignItems: "center" }}>
									<TypeChallenge challenge={game.state.currentChallenge} />

									<Typography variant="caption" color="text.secondary">
										{game.availableAnswerCount} possible answers remain
									</Typography>
								</Stack>

								<PokemonAutocomplete
									pokemon={pokemonData}
									onSubmit={handlePokemonSubmit}
								/>
							</Stack>
						</Paper>
					</>
				)}

				{game.state.status === "gameOver" && game.state.gameOverReason && (
					<>
						<GameOver
							score={game.state.score}
							correctAnswers={game.state.correctAnswers}
							highestMultiplier={game.state.highestMultiplier}
							reason={game.state.gameOverReason}
							dailyBestScore={todayScore?.bestScore ?? game.state.score}
							potentialAnswers={potentialAnswers}
							onPlayAgain={game.startGame}
						/>

						<ScoreHistory scores={scoreHistory} />
					</>
				)}
			</Stack>
		</Container>
	);
}
