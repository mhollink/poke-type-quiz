type RelativeTier = {
	id: "good" | "okay" | "weak";
	targetRatio: number;
};

export interface DailyGameConfig {
	readonly rounds: number;
	readonly bestShortListSize: number;
	readonly tierShortListSize: number;
	readonly minimumBestRatio: number;
	readonly minimumBestCandidates: number;
	readonly tierConfig: readonly RelativeTier[];
}

export const dailyGameConfig: DailyGameConfig = {
	rounds: 25,
	bestShortListSize: 8,
	tierShortListSize: 5,
	minimumBestRatio: 0.85,
	minimumBestCandidates: 4,
	tierConfig: [
		{ id: "good", targetRatio: 0.72 },
		{ id: "okay", targetRatio: 0.45 },
		{ id: "weak", targetRatio: 0.18 },
	],
};
