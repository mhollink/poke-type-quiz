import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useMemo } from "react";
import { usePokemonData } from "../../hooks/usePokemonData.ts";
import { GameHeader } from "../game-shared/components/GameHeader.tsx";
import { GameScore } from "../game-shared/components/GameScore";
import { createDailyDateKey } from "../game-type-rush/challenge/createDailySeed.ts";
import { PokemonChallenge } from "./components/PokemonChallenge";
import { TypeRecallAnswerInput } from "./components/TypeRecallAnswerInput.tsx";
import { TypeRecallGameResult } from "./components/TypeRecallGameResult.tsx";
import { useTypeRecallGame } from "./hooks/useTypeRecallGame.ts";
import { typeRecallAttemptRepository } from "./storage/typeRecallAttemptRepository.ts";

interface TypeRecallGameProps {
  readonly onExit: () => void;
  readonly onOpenPokedex: () => void;
}

function TypeRecallGame({ onExit, onOpenPokedex }: TypeRecallGameProps) {
  const { availablePokemon } = usePokemonData();
  const game = useTypeRecallGame(availablePokemon);

  const todaysResult = useMemo(
    () =>
      typeRecallAttemptRepository.findByDate(createDailyDateKey(new Date())),
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
        <TypeRecallGameResult
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
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={4}>
        {game.state.status === "game-over" &&
          game.state.gameOverReason !== null && (
            <TypeRecallGameResult
              result={game.state}
              reason={game.state.gameOverReason}
              onExit={onExit}
              onOpenPokedex={onOpenPokedex}
            />
          )}

        {game.state.status === "playing" &&
          game.state.currentChallenge !== null && (
            <>
              <GameHeader
                title="Type Recall"
                description="Identify each Pokémon&apos;s type before time runs out."
                icon={SwapHorizRoundedIcon}
              />

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

                  <TypeRecallAnswerInput
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

export default TypeRecallGame;
