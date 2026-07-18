import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CatchingPokemonRoundedIcon from "@mui/icons-material/CatchingPokemonRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import type { GameModeOption } from "./gameModeTypes.ts";

export const gameModes: GameModeOption[] = [
	{
		id: "daily",
		title: "Daily Journey",
		description: "Take on today's shared journey in a single scored attempt.",
		icon: <CalendarMonthRoundedIcon fontSize="inherit" />,
		badge: "New every day",
		disabled: true,
	},
	{
		id: "classic",
		title: "Classic",
		description: "Name Pokémon matching the exact displayed type combination.",
		icon: <CatchingPokemonRoundedIcon fontSize="inherit" />,
	},
	{
		id: "single-type",
		title: "Single Type",
		description: "Name any Pokémon that contains the displayed type.",
		icon: <CategoryRoundedIcon fontSize="inherit" />,
		disabled: true,
	},
];
