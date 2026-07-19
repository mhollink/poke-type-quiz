import { Stack, Typography } from "@mui/material";
import { TypeBadge } from "../../game-shared/components/TypeBadge.tsx";
import type { TypeChallenge } from "../model/classicGameTypes.ts";

type ClassicChallengeProps = {
	readonly challenge: TypeChallenge;
};

export function ClassicChallenge({ challenge }: ClassicChallengeProps) {
	return (
		<Stack spacing={2} sx={{ alignItems: "center" }}>
			<Typography
				component="p"
				color="text.secondary"
				sx={{ fontWeight: 900, fontSize: "1.25rem" }}
			>
				Enter a Pokémon matching
			</Typography>

			<TypeBadge type={challenge.type} />

			<Typography component="p" variant="body2" color="textSecondary">
				Single-type and dual-type Pokémon are both valid.
			</Typography>
		</Stack>
	);
}
