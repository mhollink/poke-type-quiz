import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { usePokemonData } from "../../hooks/usePokemonData.ts";
import { GameHeader } from "../game-shared/components/GameHeader.tsx";
import { GameScore } from "../game-shared/components/GameScore";
import { PokemonAutocomplete } from "../game-type-survival/components/PokemonAutocomplete.tsx";
import { TypeRushAnswerFeedback } from "./components/TypeRushAnswerFeedback.tsx";
import { TypeRushChallenge } from "./components/TypeRushChallenge.tsx";
import { TypeRushGameResult } from "./components/TypeRushGameResult.tsx";
import useTypeRushGame from "./hooks/useTypeRushGame.ts";

interface TypeRushGameProps {
  readonly onExit: () => void;
  readonly onOpenPokedex: () => void;
}

function TypeRushGame({ onExit, onOpenPokedex }: TypeRushGameProps) {
  const { availablePokemon } = usePokemonData();
  const game = useTypeRushGame(availablePokemon);

  if (game.existingAttempt !== null && game.state.status !== "game-over") {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
        <TypeRushGameResult
          attempt={game.existingAttempt}
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
                icon={CalendarMonthRoundedIcon}
                title="Type Rush"
                description="One attempt. Five minutes. Build the longest streak you can."
              />

              <GameScore
                score={game.state.score}
                correctAnswers={game.state.correctAnswers}
                timeRemainingSeconds={game.timeRemainingSeconds}
                timerProgress={game.timerProgress}
                lastScore={game.state.lastScore}
              />

              <TypeRushRunStats
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
                <Stack spacing={2}>
                  <TypeRushChallenge challenge={game.state.currentChallenge} />

                  <Stack spacing={2}>
                    <TypeRushAnswerFeedback result={game.submissionResult} />
                    <PokemonAutocomplete
                      key={game.state.currentChallenge.id}
                      pokemon={availablePokemon}
                      excludedPokemonIds={game.state.usedPokemonIds}
                      minimumSearchLength={2}
                      maximumSuggestions={8}
                      onSubmit={game.submitAnswer}
                    />
                  </Stack>

                  <Button
                    color="warning"
                    variant="text"
                    onClick={game.skipRound}
                  >
                    Skip current round (-30sec)
                  </Button>
                </Stack>
              </Paper>
            </>
          )}

        {game.state.status === "game-over" &&
          game.state.gameOverReason !== null && (
            <TypeRushGameResult
              attempt={{
                score: game.state.score,
                correctAnswers: game.state.correctAnswers,
                mistakes: game.state.mistakes,
                highestStreak: game.state.highestStreak,
              }}
              reason={game.state.gameOverReason}
              onExit={onExit}
              onOpenPokedex={onOpenPokedex}
            />
          )}
      </Stack>
    </Container>
  );
}

interface TypeRushRunStatsProps {
  readonly streak: number;
  readonly highestStreak: number;
  readonly mistakes: number;
}

function TypeRushRunStats({
  streak,
  highestStreak,
  mistakes,
}: TypeRushRunStatsProps) {
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
        <TypeRushStat label="Current streak" value={streak} />
        <TypeRushStat label="Best streak" value={highestStreak} />
        <TypeRushStat label="Mistakes" value={mistakes} />
      </Stack>
    </Paper>
  );
}

interface TypeRushStatProps {
  readonly label: string;
  readonly value: number;
}

function TypeRushStat({ label, value }: TypeRushStatProps) {
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
        color="textSecondary"
        sx={{ textAlign: "center" }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

export default TypeRushGame;
