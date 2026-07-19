import { Chip } from "@mui/material";
import { TYPE_COLORS } from "../../../theme/typeColors";
import type { PokemonType } from "../../../types";

type TypeBadgeProps = {
	type: PokemonType;
};

export function TypeBadge({ type }: TypeBadgeProps) {
	const colors = TYPE_COLORS[type];

	return (
		<Chip
			label={type}
			sx={{
				minWidth: 96,
				backgroundColor: colors.background,
				color: colors.foreground,
				fontWeight: 700,
				textTransform: "capitalize",
				border: "1px solid",
				borderColor: "rgba(0, 0, 0, 0.12)",
				"& .MuiChip-label": {
					px: 2,
				},
			}}
		/>
	);
}
