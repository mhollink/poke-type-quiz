import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TypeBadge } from "~/features/game-shared";

import type { TypeRushChallenge as TypeRushChallengeModel } from "../model/typeRushGameTypes.ts";

export interface TypeRushChallengeProps {
  readonly challenge: TypeRushChallengeModel;
}

export function TypeRushChallenge({ challenge }: TypeRushChallengeProps) {
  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Stack spacing={0.5}>
        <Typography component="p" variant="overline" color="textSecondary">
          Name a Pokémon with exactly
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {challenge.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </Stack>
      </Stack>

      <Typography variant="caption" color="textSecondary">
        {challenge.availableAnswerCount} valid answers remaining
      </Typography>
    </Stack>
  );
}
