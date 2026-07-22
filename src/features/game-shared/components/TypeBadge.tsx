import { Chip } from "@mui/material";
import { TYPE_COLORS } from "../../../theme/typeColors";
import type { PokemonType } from "../../../types";

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

	const colors = TYPE_COLORS[props.type];

	return (
		<Chip
			label={props.type}
			size={size}
			sx={{
				minWidth: size === "small" ? 46 : 96,
				backgroundColor: colors.background,
				color: colors.foreground,
				fontWeight: size === "small" ? 400 : 700,
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
