import { Chip } from "@mui/material";
import { TYPE_COLORS } from "../../../theme/typeColors";
import type { PokemonType } from "../../../types";

type TypeBadgeProps =
	| {
			type: PokemonType;
			placeholder?: never;
	  }
	| {
			type?: never;
			placeholder: string;
	  };

export function TypeBadge(props: TypeBadgeProps) {
	if ("placeholder" in props) {
		return (
			<Chip
				disabled
				label={props.placeholder}
				variant="outlined"
				sx={{
					minWidth: 96,
					fontWeight: 700,
					borderStyle: "dashed",
					"& .MuiChip-label": {
						px: 2,
					},
				}}
			/>
		);
	}

	const colors = TYPE_COLORS[props.type];

	return (
		<Chip
			label={props.type}
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
