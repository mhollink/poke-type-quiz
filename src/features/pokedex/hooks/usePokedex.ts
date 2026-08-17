import { useMemo } from "react";

import { localPokedexRepository } from "~/features/pokedex/storage/pokedexRepository.ts";
import type { Pokemon } from "~/types";
import { pokemonData } from "~/utils";

export type PokedexEntry = {
  pokemon: Pokemon;
  isShiny: boolean;
  isUnlocked: boolean;
};

export function usePokedex(entries: readonly Pokemon[]): PokedexEntry[] {
  const unlockables = useMemo(
    () => entries.filter((pokemon) => !pokemon.origin),
    [entries],
  );

  const unlockedPokemonIds = useMemo(
    () =>
      new Set(
        [...localPokedexRepository.findUnlockedIds()]
          .map((pid) => pokemonData.find((p) => p.id === pid))
          .map((pokemon) => {
            if (!pokemon?.origin) return pokemon?.id;
            return pokemonData.find((p) => p.nr === pokemon.origin)?.id;
          })
          .filter((pokemon) => !!pokemon),
      ),
    [],
  );

  const unlockedShinies = useMemo(
    () =>
      new Set(
        [...localPokedexRepository.findUnlockedIds({ shiny: true })]
          .map((pid) => pokemonData.find((p) => p.id === pid))
          .map((pokemon) => {
            if (!pokemon?.origin) return pokemon?.id;
            return pokemonData.find((p) => p.nr === pokemon.origin)?.id;
          })
          .filter((pokemon) => !!pokemon),
      ),
    [],
  );

  const dex: PokedexEntry[] = useMemo(
    () =>
      unlockables.map((pokemon) => {
        const isUnlocked = unlockedPokemonIds.has(pokemon.id);
        const isShiny = unlockedShinies.has(pokemon.id);

        return {
          pokemon,
          isUnlocked,
          isShiny,
        };
      }),
    [unlockables, unlockedPokemonIds, unlockedShinies],
  );

  return dex;
}
