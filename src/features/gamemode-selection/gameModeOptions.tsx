import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

import { createDailyDateKey } from "~/utils";

import { battleTacticsAttemptRepository } from "../game-battle-tactics/storage/battleTacticsAttemptRepository.ts";
import { typeRecallAttemptRepository } from "../game-type-recall/storage/typeRecallAttemptRepository.ts";
import { localTypeRushAttemptRepository } from "../game-type-rush/storage/typeRushAttemptRepository.ts";
import { localDailyAttemptRepository } from "../game-type-survival/storage/typeSurvivalAttemptRepository.ts";
import type { GameModeOption } from "./gameModeTypes.ts";

const dateKey = createDailyDateKey(new Date());
export const gameModes: GameModeOption[] = [
  {
    id: "type_rush",
    title: "Type Rush",
    description:
      "Name Pokémon with the exact type combination before time runs out. Correct answers add time, while mistakes cost time.",
    icon: <CalendarMonthRoundedIcon fontSize="inherit" />,
    badge: "Exact typing",
    pokedexRewards: true,
    checkCompletion: () => !!localTypeRushAttemptRepository.findByDate(dateKey),
  },
  {
    id: "type_survival",
    title: "Type Survival",
    description:
      "Name a Pokémon with the displayed type within 30 seconds. One incorrect answer ends your run.",
    icon: <BoltIcon fontSize="inherit" />,
    badge: "Partial match",
    pokedexRewards: true,
    checkCompletion: () => !!localDailyAttemptRepository.findByDate(dateKey),
  },
  {
    id: "type_recall",
    title: "Type Recall",
    description:
      "Identify the displayed Pokémon's complete typing within 30 seconds. Correct type order earns bonus points.",
    icon: <SwapHorizRoundedIcon fontSize="inherit" />,
    badge: "Guess the type",
    pokedexRewards: true,
    checkCompletion: () => !!typeRecallAttemptRepository.findByDate(dateKey),
  },
  {
    id: "battle_tactics",
    title: "Battle Tactics",
    description:
      "Choose the strongest of four moves for each Pokémon. Better matchups earn more points, with no penalty for guessing.",
    icon: <MoveBattleRoundedIcon fontSize="inherit" />,
    badge: `Best move`,
    movedexRewards: true,
    checkCompletion: () => !!battleTacticsAttemptRepository.findByDate(dateKey),
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
