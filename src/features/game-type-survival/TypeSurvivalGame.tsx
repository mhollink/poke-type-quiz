import BoltIcon from "@mui/icons-material/Bolt";
import { Container, Paper, Stack, Typography } from "@mui/material";
import { usePokemonData } from "../../hooks/usePokemonData.ts";
import type { Pokemon } from "../../types";
import { GameHeader } from "../game-shared/components/GameHeader.tsx";
import { GameScore } from "../game-shared/components/GameScore";
import { createDailyDateKey } from "../game-type-rush/challenge/createDailySeed.ts";
import { PokemonAutocomplete } from "./components/PokemonAutocomplete";
import { TypeSurvivalChallenge } from "./components/TypeSurvivalChallenge.tsx";
import { TypeSurvivalGameResult } from "./components/TypeSurvivalGameResult.tsx";
import { useTypeSurvivalGame } from "./hooks/useTypeSurvivalGame.ts";
import { localDailyAttemptRepository } from "./storage/typeSurvivalAttemptRepository.ts";
import { typeSurvivalGameConfig } from "./typeSurvivalConfig.ts";
import {useMemo} from "react";

interface TypeSurvivalGameProps {
  readonly onExit: () => void;
  readonly onOpenPokedex: () => void;
}

function TypeSurvivalGame({ onExit, onOpenPokedex }: TypeSurvivalGameProps) {
  const { availablePokemon } = usePokemonData();
  const game = useTypeSurvivalGame(availablePokemon);
  const todaysResult = useMemo(() => localDailyAttemptRepository.findByDate(
    createDailyDateKey(new Date()),
  ), []);

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
        <TypeSurvivalGameResult
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
              <GameHeader
                title="Type Survival"
                description="Name a pokemon which has atleast the displayed type"
                icon={BoltIcon}
              />

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
                    <TypeSurvivalChallenge
                      challenge={game.state.currentChallenge}
                    />

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
                    minimumSearchLength={
                      typeSurvivalGameConfig.minimumSearchLength
                    }
                    maximumSuggestions={
                      typeSurvivalGameConfig.maximumSuggestions
                    }
                    onSubmit={handleSubmit}
                  />
                </Stack>
              </Paper>
            </>
          )}

        {game.state.status === "game-over" &&
          game.state.gameOverReason !== null && (
            <TypeSurvivalGameResult
              result={game.state}
              reason={game.state.gameOverReason}
              onExit={onExit}
              onOpenPokedex={onOpenPokedex}
              incorrectType={game.state.currentChallenge!.type}
              usedPokemonIds={game.state.usedPokemonIds}
            />
          )}
      </Stack>
    </Container>
  );
}

export default TypeSurvivalGame;
