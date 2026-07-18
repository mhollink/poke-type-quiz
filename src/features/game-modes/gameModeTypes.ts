import type { ReactNode } from "react";

export type GameMode = "daily" | "classic" | "single-type";

export interface GameModeOption {
	id: GameMode;
	title: string;
	description: string;
	icon: ReactNode;
	badge?: string;
	disabled?: boolean;
}
