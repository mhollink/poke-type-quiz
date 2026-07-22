import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";

import type { GameModeOption } from "./gameModeTypes.ts";

export const gameModes: GameModeOption[] = [
	{
		id: "daily",
		title: "Daily Challenge",
		description:
			"Race against a five-minute timer in one scored attempt each day.",
		icon: <CalendarMonthRoundedIcon fontSize="inherit" />,
		badge: "New every day",
	},
	{
		id: "classic",
		title: "Classic",
		description:
			"Name any Pokémon matching the displayed type before time runs out.",
		icon: <BoltIcon fontSize="inherit" />,
	},
	{
		id: "reversed",
		title: "Reversed",
		description:
			"Identify the correct type or type combination for the displayed Pokémon.",
		icon: <SwapHorizRoundedIcon fontSize="inherit" />,
	},
];
