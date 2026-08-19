import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";

import type { Pokemon } from "~/types";

export interface PokemonSpriteProps {
  readonly pokemon: Pokemon;
  readonly shiny?: boolean;
  readonly size?: "small" | "medium" | "large";
}

const SPRITE_SIZE = 96;
const SPRITE_COLUMNS = 32;

const REGULAR_POKEMON_COUNT = 1025;
const FIRST_ALTERNATE_FORM = 10001;

const SPRITE_SHEETS = {
  normal: `${import.meta.env.BASE_URL}sprites/pokemon.webp`,
  shiny: `${import.meta.env.BASE_URL}sprites/pokemon-shiny.webp`,
} as const;

const DISPLAY_SIZES = {
  small: 60,
  medium: 80,
  large: 220,
} as const;

export function PokemonSprite({
  pokemon,
  shiny = false,
  size = "small",
}: PokemonSpriteProps) {
  const displaySize = DISPLAY_SIZES[size];

  const spriteIndex = getSpriteIndex(pokemon.nr);
  const column = spriteIndex % SPRITE_COLUMNS;
  const row = Math.floor(spriteIndex / SPRITE_COLUMNS);

  const scale = displaySize / SPRITE_SIZE;

  return (
    <Badge
      overlap="rectangular"
      invisible={!shiny}
      badgeContent={
        <AutoAwesomeRoundedIcon
          aria-hidden
          sx={{
            fontSize: displaySize / 4,
          }}
        />
      }
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      sx={{
        "& .MuiBadge-badge": {
          top: size === "medium" ? undefined : size === "small" ? 10 : 20,
          right: size === "medium" ? undefined : size === "small" ? 10 : 20,
          width: size === "small" ? 20 : 40,
          height: size === "small" ? 20 : 40,
          minWidth: size === "small" ? 20 : 40,
          borderRadius: "50%",
          color: "darkorange",
        },
      }}
    >
      <Box
        role="img"
        aria-label={pokemon.name}
        sx={{
          position: "relative",
          display: "block",
          width: displaySize,
          height: displaySize,
          flexShrink: 0,

          "&::before": {
            content: '""',
            position: "absolute",
            inset: "5%",
            borderRadius: "50%",
            background: shiny
              ? "radial-gradient(circle, rgba(255, 193, 7, 0.5) 0%, rgba(255, 193, 7, 0.15) 20%,  rgba(255, 193, 7, 0.01) 65%, transparent 80%)"
              : "radial-gradient(circle, rgba(128, 128, 128, 0.2) 0%, rgba(128, 128, 128, 0.05) 50%, transparent 70%)",
          },

          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,

            backgroundImage: `url("${
              shiny ? SPRITE_SHEETS.shiny : SPRITE_SHEETS.normal
            }")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${SPRITE_COLUMNS * SPRITE_SIZE * scale}px auto`,
            backgroundPosition: `${
              -column * displaySize
            }px ${-row * displaySize}px`,

            imageRendering: "auto",
          },
        }}
      />
    </Badge>
  );
}

function getSpriteIndex(dexNumber: number): number {
  if (dexNumber >= FIRST_ALTERNATE_FORM) {
    return REGULAR_POKEMON_COUNT + dexNumber - FIRST_ALTERNATE_FORM;
  }

  return dexNumber - 1;
}
