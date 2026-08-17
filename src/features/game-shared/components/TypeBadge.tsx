import { Chip } from "@mui/material";
import { darken } from "@mui/material/styles";

import { TYPE_COLORS } from "~/theme/typeColors.ts";
import type { PokemonType } from "~/types";

type TypeBadgeProps =
  | {
      type: PokemonType;
      placeholder?: never;
      size?: "small" | "medium";
    }
  | {
      type?: never;
      placeholder: string;
      size?: "small" | "medium";
    };

export function TypeBadge(props: TypeBadgeProps) {
  const size = props.size ?? "medium";
  if ("placeholder" in props) {
    return (
      <Chip
        disabled
        label={props.placeholder}
        variant="outlined"
        size={size}
        sx={{
          minWidth: size === "small" ? 46 : 96,
          fontWeight: size === "small" ? 400 : 700,
          borderStyle: "dashed",
          "& .MuiChip-label": {
            px: 2,
          },
        }}
      />
    );
  }

  const typeColor = TYPE_COLORS[props.type].background;

  return (
    <Chip
      label={props.type.toUpperCase()}
      size={size}
      sx={{
        background: `linear-gradient(
          180deg,
          ${typeColor} 0%,
          ${darken(typeColor, 0.18)} 50%,
          ${typeColor} 100%
        )`,

        border: "1px solid white",
        boxShadow: "0 0 0 1px black",

        color: "white",
        fontWeight: 700,

        "& .MuiChip-label": {
          textShadow: `
            -1px -1px 0 #000,
             0   -1px 0 #000,
             1px -1px 0 #000,
            -1px  0   0 #000,
             1px  0   0 #000,
            -1px  1px 0 #000,
             0    1px 0 #000,
             1px  1px 0 #000
          `,
        },
      }}
    />
  );
}
