import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Pokemon } from "../../../types";
import { getPokemonSpriteUrl } from "../../../utils";

export interface PotentialValidOptionsProps {
  potentialAnswers: readonly Pokemon[];
}

export function PotentialValidOptions({
  potentialAnswers,
}: PotentialValidOptionsProps) {
  return potentialAnswers.length === 0 ? null : (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }}>
        Possible answers
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
            <Avatar
              src={getPokemonSpriteUrl(pokemon.nr)}
              alt=""
              variant="square"
              sx={{
                width: 40,
                height: 40,
                bgcolor: "transparent",
                imageRendering: "pixelated",
              }}
            />

            <Typography
              sx={{
                flex: 1,
                fontWeight: 600,
              }}
            >
              {pokemon.name}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              #{String(pokemon.nr).padStart(4, "0")}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
