import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TypeBadge } from "../../game-shared/components/TypeBadge.tsx";
import type { DailyChallenge as DailyChallengeModel } from "../model/dailyGameTypes";

export interface DailyChallengeProps {
	readonly challenge: DailyChallengeModel;
}

export function DailyChallenge({ challenge }: DailyChallengeProps) {
	return (
		<Stack
			spacing={2}
			sx={{
				alignItems: "center",
				textAlign: "center",
			}}
		>
			<Stack spacing={0.5}>
				<Typography component="p" variant="overline" color="text.secondary">
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
