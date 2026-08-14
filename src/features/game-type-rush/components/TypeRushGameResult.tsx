import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { lazy, Suspense, useMemo, useState } from "react";
import { usePokemonData } from "../../../hooks/usePokemonData.ts";
import type { Pokemon } from "../../../types";
import {
  createTypeRushChallengeShareText,
  type ShareResult,
  shareGameResult,
} from "../../../utils";
import { shuffle } from "../../../utils/shuffle.ts";
import { GameResult } from "../../game-shared/components/GameResult";
import { PotentialValidOptions } from "../../game-shared/components/PotentialValidAnswers.tsx";
import { createTypeKey } from "../challenge/createTypeRushChallenge.ts";
import type {
  TypeRushAttemptRecord,
  TypeRushGameOverReason,
} from "../model/typeRushGameTypes.ts";
import { localTypeRushAttemptRepository } from "../storage/typeRushAttemptRepository.ts";
import { typeRushGameConfig } from "../typeRushGameConfig.ts";

export interface TypeRushGameResultProps {
  readonly attempt: Pick<
    TypeRushAttemptRecord,
    "score" | "correctAnswers" | "mistakes" | "highestStreak"
  >;
  readonly reason: TypeRushGameOverReason | "already-played";
  readonly onExit: () => void;
  readonly onOpenPokedex: () => void;
  readonly usedPokemonIds?: ReadonlySet<string>;
  readonly skippedTypes?: ReadonlySet<string>;
}

const TypeRushScoreHistory = lazy(
  () => import("../../game-shared/components/DailyScoreHistory"),
);

export function TypeRushGameResult({
  attempt,
  reason,
  onExit,
  onOpenPokedex,
  usedPokemonIds,
  skippedTypes,
}: TypeRushGameResultProps) {
  const dailyAttemptRecords = localTypeRushAttemptRepository.findAll();

  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const highestMultiplier = useMemo(
    () => calculateHighestMultiplier(attempt.highestStreak),
    [attempt.highestStreak],
  );

  async function handleShare(): Promise<void> {
    const text = createTypeRushChallengeShareText({
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      highestMultiplier: highestMultiplier,
    });

    const result = await shareGameResult(text);

    setShareResult(result);
  }

  return (
    <Stack spacing={2}>
      <Snackbar
        open={shareResult === "copied"}
        autoHideDuration={5_000}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="success"
          variant="standard"
          sx={{
            width: "100%",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Result copied to your clipboard.
          </Typography>
        </Alert>
      </Snackbar>

      <GameResult
        title={getTitle(reason)}
        message={getMessage(reason)}
        score={attempt.score}
        correctAnswers={attempt.correctAnswers}
        highestMultiplier={highestMultiplier}
        statistics={[
          {
            label: "Best streak",
            value: attempt.highestStreak.toLocaleString(),
          },
        ]}
        primaryAction={{
          label: "Share",
          onClick: handleShare,
        }}
        secondaryAction={{
          label: "Exit",
          onClick: onExit,
        }}
      />

      {!!skippedTypes && !!usedPokemonIds && skippedTypes.size > 0 && (
        <SkippedRoundFeedback
          skippedTypes={skippedTypes}
          usedPokemonIds={usedPokemonIds}
        />
      )}

      <Button onClick={onOpenPokedex} color="primary">
        Go to pokedex
      </Button>

      <Suspense
        fallback={<Skeleton variant="rounded" animation="wave" height={260} />}
      >
        <TypeRushScoreHistory dailyAttemptRecords={dailyAttemptRecords} />
      </Suspense>
    </Stack>
  );
}

function getTitle(reason: TypeRushGameOverReason | "already-played"): string {
  switch (reason) {
    case "time-expired":
      return "Type Rush complete";

    case "no-challenges-left":
      return "Type Rush mastered";

    case "already-played":
      return "Today's Type Rush is complete";
  }
}

function getMessage(reason: TypeRushGameOverReason | "already-played"): string {
  switch (reason) {
    case "time-expired":
      return "Time is up. Your score has been saved for today.";

    case "no-challenges-left":
      return "You completed every available challenge for today.";

    case "already-played":
      return "You have already used today's attempt. A new challenge will be available tomorrow.";
  }
}

function calculateHighestMultiplier(highestStreak: number): number {
  return Math.min(
    typeRushGameConfig.maximumStreakMultiplier,
    1 + highestStreak * typeRushGameConfig.streakMultiplierStep,
  );
}

function SkippedRoundFeedback({
  skippedTypes,
  usedPokemonIds,
}: Required<Pick<TypeRushGameResultProps, "skippedTypes" | "usedPokemonIds">>) {
  const { availablePokemon } = usePokemonData();

  const hints: Pokemon[] = useMemo(() => {
    const unusedPokemon = shuffle(
      availablePokemon.filter((candidate) => !usedPokemonIds.has(candidate.id)),
    );

    return [...skippedTypes.values()]
      .map((typeKey) =>
        unusedPokemon.find(
          (candidate) => createTypeKey(candidate.types) === typeKey,
        ),
      )
      .filter((value) => !!value);
  }, [skippedTypes, usedPokemonIds, availablePokemon]);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
      <PotentialValidOptions potentialAnswers={hints} />
    </Paper>
  );
}
