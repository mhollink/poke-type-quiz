export interface ClassicGameConfig {
	readonly roundDurationMs: number;
	readonly minimumSearchLength: number;
	readonly maximumSuggestions: number;
}

export const classicGameConfig: ClassicGameConfig = {
	roundDurationMs: 30_000,
	minimumSearchLength: 3,
	maximumSuggestions: 8,
};
