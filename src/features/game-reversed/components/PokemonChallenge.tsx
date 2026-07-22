import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { getPokemonSpriteUrl } from "../../../utils";
import type { ReversedChallenge } from "../model/reversedGameTypes";

export interface PokemonChallengeProps {
	readonly challenge: ReversedChallenge;
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

			<Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
				{pokemon.name}
			</Typography>
		</Stack>
	);
}
