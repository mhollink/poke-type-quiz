import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import GpsFixedRoundedIcon from "@mui/icons-material/GpsFixedRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Divider from "@mui/material/Divider";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TypeBadge } from "~/features/game-shared";

import type { MoveDexViewEntry } from "../hooks/useMoveDex.ts";

type MoveDexEntryCardProps = {
  readonly entry: MoveDexViewEntry;
  readonly onOpen?: (entry: MoveDexViewEntry) => void;
};

export function MoveDexEntryCard({ entry, onOpen }: MoveDexEntryCardProps) {
  const { move, progress, discovered, masteryLevel, judgementRate } = entry;

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea
        disabled={!discovered || !onOpen}
        onClick={() => onOpen?.(entry)}
        sx={{
          height: "100%",
          p: 2,
        }}
      >
        <Stack spacing={2} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {discovered ? move.name : "???"}
              </Typography>

              {discovered && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ textTransform: "capitalize", mt: -0.5 }}
                >
                  {move.classifier}
                </Typography>
              )}
            </Stack>

            <TypeBadge type={move.type} size="small" />
          </Stack>

          {discovered && progress ? (
            <>
              <Stack direction="row" spacing={3}>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <BoltRoundedIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>90</strong> Power
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                >
                  <GpsFixedRoundedIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>100%</strong> Accuracy
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              <Stack sx={{ mt: "auto" }}>
                <Statistic
                  label="Encounters"
                  value={progress.encounters.toLocaleString()}
                />

                <Statistic
                  label="Correct judgements"
                  value={progress.correctJudgements.toLocaleString()}
                />

                <Statistic
                  label="Tactical judgement"
                  value={
                    judgementRate === null
                      ? "—"
                      : `${Math.round(judgementRate * 100)}%`
                  }
                />

                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", pt: 1 }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Move mastery
                  </Typography>
                  <Rating value={masteryLevel} max={5} readOnly size="small" />
                </Stack>
              </Stack>
            </>
          ) : (
            <Stack
              spacing={1}
              sx={{
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockOutlinedIcon color="disabled" />

              <Typography variant="body2" color="textSecondary">
                Not yet discovered
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardActionArea>
    </Card>
  );
}

type StatisticProps = {
  readonly label: string;
  readonly value: string;
};

function Statistic({ label, value }: StatisticProps) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>

      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}
