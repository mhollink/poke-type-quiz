import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { lazy, Suspense, useState } from "react";
import {
  createClassicChallengeShareText,
  type ShareResult,
  shareGameResult,
} from "../../../utils";
import { GameResult } from "../../game-shared/components/GameResult.tsx";
import type { ClassicGameState } from "../model/classicGameTypes.ts";
import { localDailyAttemptRepository } from "../storage/dailyAttemptRepository.ts";

const DailyScoreHistory = lazy(
  () => import("../../game-shared/components/DailyScoreHistory"),
);

export interface ClassicGameResultProps {
  readonly result: Pick<
    ClassicGameState,
    "score" | "correctAnswers" | "highestMultiplier"
  >;
  readonly reason:
    | "incorrect-answer"
    | "time-expired"
    | "no-challenges-left"
    | "already-played";
  readonly onExit: () => void;
  readonly onOpenPokedex: () => void;
}

export function ClassicGameResult({
  result,
  reason,
  onExit,
  onOpenPokedex,
}: ClassicGameResultProps) {
  const dailyAttemptRecords = localDailyAttemptRepository.findAll();

  const [shareResult, setShareResult] = useState<ShareResult | null>(null);

  async function handleShare(): Promise<void> {
    const text = createClassicChallengeShareText({
      score: result.score,
      correctAnswers: result.correctAnswers,
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
        title="Classic run complete"
        score={result.score}
        correctAnswers={result.correctAnswers}
        highestMultiplier={result.highestMultiplier}
        message={getGameOverMessage(reason)}
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

function getGameOverMessage(
  reason:
    | "incorrect-answer"
    | "time-expired"
    | "no-challenges-left"
    | "already-played",
): string {
  switch (reason) {
    case "incorrect-answer":
      return "That Pokémon does not match the requested type.";

    case "time-expired":
      return "You ran out of time.";

    case "no-challenges-left":
      return "You completed every available challenge.";

    case "already-played":
      return "You have already used today's attempt. A new challenge will be available tomorrow.";
  }
}
