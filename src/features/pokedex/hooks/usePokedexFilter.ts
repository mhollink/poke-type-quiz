import type { PokedexEntry } from "~/features/pokedex/hooks/usePokedex.ts";

export type PokedexFilter = {
  generation: number | "all";
  status: "all" | "unlocked" | "locked" | "shiny";
};

export function usePokedexFilter(dex: readonly PokedexEntry[]) {
  return function filterPokedex(filter: PokedexFilter): PokedexEntry[] {
    return dex.filter((entry) => {
      if (
        filter.generation !== "all" &&
        entry.pokemon.gen !== filter.generation
      ) {
        return false;
      }

      switch (filter.status) {
        case "unlocked":
          return entry.isUnlocked;
        case "locked":
          return !entry.isUnlocked;
        case "shiny":
          return entry.isShiny;
        default:
          return true;
      }
    });
  };
}
