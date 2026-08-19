import { useMemo, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { Move, MoveClassifier, PokemonType } from "~/types";

import { MoveDexEntryCard } from "./components/MoveDexEntryCard.tsx";
import { MoveDexFilters } from "./components/MoveDexFilters.tsx";
import { MoveDexProgress } from "./components/MoveDexProgress.tsx";
import { useMoveDex } from "./hooks/useMoveDex.ts";
import { filterMoveDex, type MoveDexStatus } from "./model/filterMoveDex.ts";

type MoveDexProps = {
  readonly moves: readonly Move[];
  readonly onExit: () => void;
};

function MoveDex({ moves, onExit }: MoveDexProps) {
  const dex = useMoveDex(moves);

  const [status, setStatus] = useState<MoveDexStatus>("all");

  const [type, setType] = useState<PokemonType | "all">("all");

  const [classifier, setClassifier] = useState<MoveClassifier | "all">("all");

  const visibleDex = useMemo(
    () =>
      filterMoveDex(dex, {
        status,
        type,
        classifier,
      }),
    [dex, status, type, classifier],
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <IconButton aria-label="Return to home" onClick={onExit} edge="start">
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            Attackdex
          </Typography>

          <Typography color="textSecondary">
            Discover moves and master their tactical value.
          </Typography>
        </Box>
      </Stack>

      <MoveDexProgress entries={dex} />

      <MoveDexFilters
        status={status}
        type={type}
        classifier={classifier}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onClassifierChange={setClassifier}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {visibleDex.map((entry) => (
          <MoveDexEntryCard key={entry.move.id} entry={entry} />
        ))}
      </Box>
    </Stack>
  );
}

export default MoveDex;
