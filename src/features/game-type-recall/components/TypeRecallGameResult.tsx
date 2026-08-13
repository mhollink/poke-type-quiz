import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { lazy, Suspense, useState } from "react";
import {
  createTypeRecallChallengeShareText,
  type ShareResult,
  shareGameResult,
} from "../../../utils";
import { GameResult } from "../../game-shared/components/GameResult";
import type {
  TypeRecallGameOverReason,
  TypeRecallGameState,
} from "../model/typeRecallGameTypes.ts";
import { typeRecallAttemptRepository } from "../storage/typeRecallAttemptRepository.ts";

const DailyScoreHistory = lazy(
  () => import("../../game-shared/components/DailyScoreHistory"),
);

export interface TypeRecallGameResultProps {
  readonly result: Pick<
    TypeRecallGameState,
    "score" | "correctAnswers" | "highestMultiplier" | "canonicalOrderAnswers"
  >;
  readonly reason: TypeRecallGameOverReason | "already-played";
  readonly onExit: () => void;
  readonly onOpenPokedex: () => void;
}

export function TypeRecallGameResult({
  result,
  reason,
  onExit,
  onOpenPokedex,
}: TypeRecallGameResultProps) {
  const dailyAttemptRecords = typeRecallAttemptRepository.findAll();

  const [shareResult, setShareResult] = useState<ShareResult | null>(null);

  async function handleShare(): Promise<void> {
    const text = createTypeRecallChallengeShareText({
      score: result.score,
      correctAnswers: result.correctAnswers,
      canonicalOrderAnswers: result.canonicalOrderAnswers,
      highestMultiplier: result.highestMultiplier,
    });

    const shareResult = await shareGameResult(text);
    setShareResult(shareResult);
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
        score={result.score}
        correctAnswers={result.correctAnswers}
        highestMultiplier={result.highestMultiplier}
        statistics={[
          {
            label: "Order bonuses",
            value: result.canonicalOrderAnswers.toLocaleString(),
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

      <Button onClick={onOpenPokedex} color="primary">
        Go to pokedex
      </Button>

      <Suspense
        fallback={<Skeleton variant="rounded" animation="wave" height={260} />}
      >
        <DailyScoreHistory dailyAttemptRecords={dailyAttemptRecords} />
      </Suspense>
    </Stack>
  );
}

function getTitle(reason: TypeRecallGameOverReason | "already-played"): string {
  switch (reason) {
    case "incorrect-answer":
      return "Incorrect type";

    case "time-expired":
      return "Time expired";

    case "no-challenges-left":
      return "Type Recall mastered";

    case "already-played":
      return "Today's challenge is complete";
  }
}

function getMessage(
  reason: TypeRecallGameOverReason | "already-played",
): string {
  switch (reason) {
    case "incorrect-answer":
      return "The selected types did not match the displayed Pokémon.";

    case "time-expired":
      return "You did not submit the Pokémon's types before the timer expired.";

    case "no-challenges-left":
      return "You identified every available Pokémon correctly.";

    case "already-played":
      return "You have already used today's attempt. A new challenge will be available tomorrow.";
  }
}
