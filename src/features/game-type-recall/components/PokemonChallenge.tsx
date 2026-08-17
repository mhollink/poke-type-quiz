import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { Badge } from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { getPokemonSpriteUrl } from "~/utils";

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

      <Badge
        overlap="rectangular"
        invisible={!shiny}
        badgeContent={
          <AutoAwesomeRoundedIcon
            aria-hidden
            sx={{
              fontSize: 36,
            }}
          />
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiBadge-badge": {
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: "50%",
            color: "darkorange",
          },
        }}
      >
        <Box
          component="img"
          src={getPokemonSpriteUrl(pokemon.nr, shiny)}
          alt={pokemon.name}
          sx={{
            display: "block",
            width: {
              xs: 180,
              sm: 220,
            },
            height: {
              xs: 180,
              sm: 220,
            },
            objectFit: "contain",
            imageRendering: "auto",
          }}
        />
      </Badge>

      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        {pokemon.name}
      </Typography>
    </Stack>
  );
}
