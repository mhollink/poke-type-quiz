import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { usePokemonData } from "../../hooks/usePokemonData.ts";
import { moveData } from "../../utils/moves.ts";
import { PokemonChallenge } from "../game-type-recall/components/PokemonChallenge.tsx";
import { createDailyDateKey } from "../game-type-rush/challenge/createDailySeed.ts";
import { createBattleTacticsChallenge } from "./challenge/createDailyBattleTacticsChallenge.ts";
import { BattleTacticsGameResult } from "./components/BattleTacticsGameResult.tsx";
import { BattleTacticsGameScore } from "./components/BattleTacticsGameScore.tsx";
import { BattleTacticsOptionCard } from "./components/BattleTacticsOption.tsx";
import { BattleTacticsResult } from "./components/BattleTacticsResult.tsx";
import { useBattleTacticsGame } from "./hooks/useBattleTacticsGame.ts";
import { localDailyBattleRepository } from "./storage/dailyAttemptRepository.ts";
import { getTypeEffectiveness } from "./utils/effectiveness.ts";
import {GameHeader} from "../game-shared/components/GameHeader.tsx";
import {MoveBattleRoundedIcon} from "../gamemode-selection/gameModeOptions.tsx";

type BattleTacticsGameProps = {
  onExit: () => void;
};

function BattleTacticsGame({ onExit }: BattleTacticsGameProps) {
  const dateKey = useMemo(() => createDailyDateKey(new Date()), []);
  const exitingResult = localDailyBattleRepository.findByDate(dateKey);

  const { enabledGens, availablePokemon } = usePokemonData();
  const availableMoves = useMemo(
    () => moveData.filter((move) => move.gen <= Math.max(...enabledGens)),
    [enabledGens],
  );

  const challenge = useMemo(
    () =>
      createBattleTacticsChallenge(
        dateKey,
        availablePokemon,
        availableMoves,
        getTypeEffectiveness,
      ),
    [dateKey, availablePokemon, availableMoves],
  );

  const game = useBattleTacticsGame(challenge);

  if (exitingResult) {
    return <BattleTacticsGameResult state={exitingResult} onExit={onExit} />;
  }

  if (game.state.status === "completed") {
    const state = game.state;
    return (
      <BattleTacticsGameResult
        state={{
          dateKey: state.challenge.dateKey,
          completedAt: Date.now(),
          correctAnswers: state.optimalSelections,
          totalRounds: state.challenge.rounds.length,
          score: state.score,
          percentage:
            state.challenge.maxScore === 0
              ? 0
              : Math.round((state.score / state.challenge.maxScore) * 100),
          maxScore: state.challenge.maxScore,
        }}
        onExit={onExit}
      />
    );
  }

  if (game.currentRound === null) {
    return null;
  }

  const round = game.currentRound;

  return (
    <Container
      component="main"
      maxWidth="md"
    >
      <Stack spacing={4}>
        <Stack spacing={1} sx={{ textAlign: "center" }}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
          </Typography>

          <Typography variant="body2" color="textSecondary">
          </Typography>
        </Stack>

          <GameHeader title="Battle Tactics"
                      description="Choose the move that deals the most potential damage."
                      icon={MoveBattleRoundedIcon as any} />


        <BattleTacticsGameScore
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
                <BattleTacticsOptionCard
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
                <BattleTacticsResult
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

export default BattleTacticsGame;
