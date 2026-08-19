import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PokemonSprite } from "~/features/game-shared";
import type { Pokemon } from "~/types";

import { TypeBadge } from "./TypeBadge.tsx";

export interface PotentialValidOptionsProps {
    title?: string;
  potentialAnswers: readonly Pokemon[];
}

export function PotentialValidOptions({
    title = "Possible answers",
  potentialAnswers,
}: PotentialValidOptionsProps) {
  return potentialAnswers.length === 0 ? null : (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
      </Typography>

      <Stack spacing={1}>
        {potentialAnswers.map((pokemon) => (
          <Stack
            key={pokemon.id}
            direction="row"
            spacing={1.5}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              alignItems: "center",
            }}
          >
            <PokemonSprite
              pokemon={pokemon}
              shiny={pokemon.shiny}
              size="small"
            />

            <Typography
              sx={{
                flex: 1,
                fontWeight: 600,
              }}
            >
              {pokemon.name}
            </Typography>

            <Stack direction="row" spacing={1}>
              {pokemon.types.map((type) => (
                <TypeBadge key={type} type={type} size="small" />
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
