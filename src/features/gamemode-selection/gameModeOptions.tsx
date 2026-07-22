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
	{
		id: "moves",
		title: "Daily Battle",
		description:
			"Choose the strongest move for 25 Pokémon and chase the daily maximum score.",
		icon: <MoveBattleRoundedIcon fontSize="inherit" />,
		badge: "25 battles daily",
	},
];

import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

export function MoveBattleRoundedIcon(props: SvgIconProps) {
	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			<path d="M10.75 2.1A10 10 0 0 0 2.1 10.75h6.15a4 4 0 0 1 2.5-2.5V2.1Z" />
			<path d="M13.25 2.1v6.15a4 4 0 0 1 2.5 2.5h6.15a10 10 0 0 0-8.65-8.65Z" />
			<path d="M21.9 13.25h-6.15a4 4 0 0 1-2.5 2.5v6.15a10 10 0 0 0 8.65-8.65Z" />
			<path d="M10.75 21.9v-6.15a4 4 0 0 1-2.5-2.5H2.1a10 10 0 0 0 8.65 8.65Z" />
			<circle cx="12" cy="12" r="2.25" />
		</SvgIcon>
	);
}
