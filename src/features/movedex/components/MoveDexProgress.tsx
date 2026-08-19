import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { MoveDexViewEntry } from "~/features/movedex/hooks/useMoveDex.ts";

type MoveDexProgressProps = {
  readonly entries: readonly MoveDexViewEntry[];
};

export function MoveDexProgress({ entries }: MoveDexProgressProps) {
  const total = entries.length;

  const discovered = entries.filter((entry) => entry.discovered).length;

  const mastered = entries.filter((entry) => entry.mastered).length;

  const discoveredPercentage = total === 0 ? 0 : (discovered / total) * 100;

  const masteredPercentage = total === 0 ? 0 : (mastered / total) * 100;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        <ProgressRow
          label="Discovered"
          current={discovered}
          total={total}
          value={discoveredPercentage}
        />

        <ProgressRow
          label="Mastered"
          current={mastered}
          total={total}
          value={masteredPercentage}
        />
      </Stack>
    </Paper>
  );
}

type ProgressRowProps = {
  readonly label: string;
  readonly current: number;
  readonly total: number;
  readonly value: number;
};

function ProgressRow({ label, current, total, value }: ProgressRowProps) {
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>

        <Typography color="textSecondary">
          {current} / {total}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 10,
          borderRadius: 5,
        }}
      />
    </Stack>
  );
}
