import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { pokemonData } from "../../utils";
import { moveData } from "../../utils/moves.ts";
import { createDailyDateKey } from "../game-daily/challenge/createDailySeed.ts";
import { PokemonChallenge } from "../game-reversed/components/PokemonChallenge.tsx";
import { createDailyMoveChallenge } from "./challenge/createDailyChallenge.ts";
import { DailyMoveGameResult } from "./components/DailyMoveGameResult.tsx";
import { DailyMoveGameScore } from "./components/DailyMoveGameScore.tsx";
import { DailyMoveOptionCard } from "./components/DailyMoveOption.tsx";
import { DailyMoveResult } from "./components/DailyMoveResult.tsx";
import { useDailyMoveGame } from "./hooks/useDailyMoveGame.ts";
import { getTypeEffectiveness } from "./utils/effectiveness.ts";

type DailyMoveGameProps = {
	onExit: () => void;
};

function DailyMoveGame({ onExit }: DailyMoveGameProps) {
	const dateKey = useMemo(() => createDailyDateKey(new Date()), []);
	const challenge = useMemo(
		() =>
			createDailyMoveChallenge(
				dateKey,
				pokemonData,
				moveData,
				getTypeEffectiveness,
			),
		[dateKey],
	);

	const game = useDailyMoveGame(challenge);

	if (game.state.status === "completed") {
		return <DailyMoveGameResult state={game.state} onExit={onExit} />;
	}

	if (game.currentRound === null) {
		return null;
	}

	const round = game.currentRound;

	return (
		<Container
			component="main"
			maxWidth="md"
			sx={{
				py: {
					xs: 4,
					md: 8,
				},
			}}
		>
			<Stack spacing={4}>
				<Stack spacing={1} sx={{ textAlign: "center" }}>
					<Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
						Daily Battle
					</Typography>

					<Typography variant="body2" color="textSecondary">
						Choose the move that deals the most potential damage.
					</Typography>
				</Stack>

				<DailyMoveGameScore
					score={game.state.score}
					maxScore={game.state.challenge.maxScore}
					roundNumber={game.roundNumber}
					roundCount={game.roundCount}
					optimalSelections={game.state.optimalSelections}
				/>

				<Paper
					variant="outlined"
					sx={{
						p: {
							xs: 2,
							sm: 4,
						},
					}}
				>
					<Stack spacing={4}>
						<PokemonChallenge
							challenge={{
								id: `${dateKey}-${round.index}`,
								pokemon: round.pokemon,
								shiny: false,
								difficulty: 0,
							}}
						/>

						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "repeat(2, minmax(0, 1fr))",
								},
								gap: 2,
							}}
						>
							{round.options.map((option) => (
								<DailyMoveOptionCard
									key={option.move.id}
									option={option}
									resolved={game.isResolved}
									selected={game.selectedOption?.move.id === option.move.id}
									optimal={
										game.isResolved && option.score.score === round.maxScore
									}
									onSelect={game.selectMove}
								/>
							))}
						</Box>

						{game.selectedOption !== null && (
							<>
								<DailyMoveResult
									option={game.selectedOption}
									roundMaximum={round.maxScore}
								/>

								<Button
									variant="contained"
									size="large"
									endIcon={
										game.isFinalRound ? (
											<DoneRoundedIcon />
										) : (
											<ArrowForwardRoundedIcon />
										)
									}
									onClick={game.continueGame}
								>
									{game.isFinalRound ? "Finish daily" : "Next Pokémon"}
								</Button>
							</>
						)}
					</Stack>
				</Paper>
			</Stack>
		</Container>
	);
}

export default DailyMoveGame;
