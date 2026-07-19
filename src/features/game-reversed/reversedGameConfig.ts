export interface ReversedGameConfig {
	readonly roundDurationMs: number;
	readonly basePoints: number;
	readonly canonicalOrderMultiplier: number;
	readonly dualTypeMultiplier: number;
	readonly maximumStreakMultiplier: number;
	readonly streakMultiplierStep: number;
	readonly dualTypeChance: number;
	readonly shinyChance: number;
}

export const reversedGameConfig: ReversedGameConfig = {
	roundDurationMs: 30_000,
	basePoints: 100,
	canonicalOrderMultiplier: 1.15,
	dualTypeMultiplier: 1.25,
	maximumStreakMultiplier: 1.5,
	streakMultiplierStep: 0.025,
	dualTypeChance: 0.7,
	shinyChance: 0.01,
};
