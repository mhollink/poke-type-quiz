import { Stack, Typography } from "@mui/material";
import { TypeBadge } from "../../components/TypeBadge";
import type { TypeChallenge as Challenge } from "../../types/game";

type TypeChallengeProps = {
	challenge: Challenge;
};

export function TypeChallenge({ challenge }: TypeChallengeProps) {
	return (
		<Stack spacing={2} sx={{ alignItems: "center" }}>
			<Typography
				id="type-challenge-heading"
				component="h2"
				variant="h5"
				sx={{ fontWeight: 700 }}
			>
				Name a Pokémon with:
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
	);
}
