export interface TypeSurvivalConfig {
  readonly roundDurationMs: number;
  readonly minimumSearchLength: number;
  readonly maximumSuggestions: number;
}

export const typeSurvivalGameConfig: TypeSurvivalConfig = {
  roundDurationMs: 30_000,
  minimumSearchLength: 3,
  maximumSuggestions: 8,
};
