import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import { dailyGameConfig } from "../game-moves/dailyMoveGameConfig.ts";

import type { GameModeOption } from "./gameModeTypes.ts";

export const gameModes: GameModeOption[] = [
	{
		id: "daily",
		title: "Type Rush",
		description:
			"Name Pokémon with the exact type combination before time runs out. Correct answers add time, while mistakes cost time.",
		icon: <CalendarMonthRoundedIcon fontSize="inherit" />,
		badge: "5-minute challenge",
		pokedexRewards: true,
	},
	{
		id: "classic",
		title: "Type Survival",
		description:
			"Name a Pokémon with the displayed type within 30 seconds. One incorrect answer ends your run.",
		icon: <BoltIcon fontSize="inherit" />,
		badge: "One mistake ends the run",
		pokedexRewards: true,
	},
	{
		id: "reversed",
		title: "Type Recall",
		description:
			"Identify the displayed Pokémon's complete typing within 30 seconds. Correct type order earns bonus points.",
		icon: <SwapHorizRoundedIcon fontSize="inherit" />,
		badge: "30 seconds per round",
		pokedexRewards: true,
	},
	{
		id: "moves",
		title: "Battle Tactics",
		description:
			"Choose the strongest of four moves for each Pokémon. Better matchups earn more points, with no penalty for guessing.",
		icon: <MoveBattleRoundedIcon fontSize="inherit" />,
		badge: `${dailyGameConfig.rounds} battles`,
	},
];

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
