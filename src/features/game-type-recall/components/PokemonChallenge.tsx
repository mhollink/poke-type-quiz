import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PokemonSprite } from "~/features/game-shared";

import type { TypeRecallChallenge } from "../model/typeRecallGameTypes.ts";

export interface PokemonChallengeProps {
  readonly challenge: TypeRecallChallenge;
}

export function PokemonChallenge({ challenge }: PokemonChallengeProps) {
  const { pokemon, shiny } = challenge;

  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography component="p" variant="overline" color="textSecondary">
        Select this Pokémon&apos;s type
      </Typography>

      <PokemonSprite pokemon={pokemon} shiny={shiny} size="large" />

      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        {pokemon.name}
      </Typography>
    </Stack>
  );
}
