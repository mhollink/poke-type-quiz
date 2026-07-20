import type { ReactNode } from "react";
import type { GameMode } from "../../types";

export interface GameModeOption {
	id: GameMode;
	title: string;
	description: string;
	icon: ReactNode;
	badge?: string;
	disabled?: boolean;
}
