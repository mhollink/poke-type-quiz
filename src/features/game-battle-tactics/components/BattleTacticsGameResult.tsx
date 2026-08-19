import { lazy, Suspense, useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  createDailyBattleShareText,
  type ShareResult,
  shareGameResult,
} from "../../../utils";
import type { DailyBattleAttemptRecord } from "../model/Score.ts";

const DailyScoreHistory = lazy(() => import("./DailyBattleScoreHistory.tsx"));

type BattleTacticsGameResultProps = {
  state: DailyBattleAttemptRecord;
  onExit: () => void;
  onOpenMovedex: () => void;
};

export function BattleTacticsGameResult({
  state,
  onExit,
  onOpenMovedex,
}: BattleTacticsGameResultProps) {
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);

  async function handleShare(): Promise<void> {
    const text = createDailyBattleShareText({
      score: state.score,
      correctAnswers: state.correctAnswers,
      percentage: state.percentage,
      rounds: state.totalRounds,
    });

    const result = await shareGameResult(text, "PokeType Quiz: Daily Battle");

    setShareResult(result);
  }

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
      <Stack spacing={2}>
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
          }}
        >
          <Stack spacing={3} sx={{ textAlign: "center" }}>
            <Stack spacing={1}>
              <Typography component="h1" variant="h4">
                Battle Tactics complete
              </Typography>

              <Typography color="textSecondary">
                You selected the strongest move in {state.correctAnswers} of{" "}
                {state.totalRounds} battles.
              </Typography>
            </Stack>

            <Stack>
              <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>
                {state.score.toLocaleString()}
              </Typography>

              <Typography color="textSecondary">
                of {state.maxScore.toLocaleString()} points
              </Typography>
            </Stack>

            <Typography variant="h6">
              {state.percentage}% of the daily maximum
            </Typography>

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

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
              sx={{
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<SendRoundedIcon />}
                onClick={handleShare}
              >
                Share score
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={onExit}
              >
                Back to menu
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Button onClick={onOpenMovedex} color="primary">
          Go to attackdex
        </Button>

        <Suspense
          fallback={
            <Skeleton variant="rounded" animation="wave" height={260} />
          }
        >
          <DailyScoreHistory />
        </Suspense>
      </Stack>
    </Container>
  );
}
