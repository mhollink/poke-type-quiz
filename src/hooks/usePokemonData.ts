import { useEffect, useMemo } from "react";

import type { Pokemon, PokemonType } from "~/types";
import { createScopedRandom, pokemonData, today } from "~/utils";
import { getShinyChance } from "~/utils/shiny.ts";

import { localGenerationSelectionRepository } from "../features/generation-selection/storage/localGenerationSelectionRepository.ts";

export function usePokemonData() {
  const random = useMemo(() => createScopedRandom("shiny-roll"), []);
  const shinyChance = useMemo(() => getShinyChance(today()), []);

  const enabledGens = useMemo(
    () => localGenerationSelectionRepository.findEnabledGenerations(),
    [],
  );

  const effectiveGeneration = useMemo(
    () => Math.max(...enabledGens, 1),
    [enabledGens],
  );

  const pokemon = useMemo(
    () =>
      pokemonData.map((pokemon) => ({
        ...pokemon,
        shiny: random() < shinyChance,
      })),
    [],
  );

  useEffect(() => {
    const shinies = pokemon.filter((p) => p.shiny).map((p) => p.name);
    const message = JSON.stringify({
      debug: {
        pokemon: shinies,
        count: shinies.length,
      },
    });
    console.debug(message);
  }, []);

  const availablePokemon: Pokemon[] = useMemo(
    () =>
      pokemon
        .filter((pokemon) => enabledGens.has(pokemon.gen))
        .map(
          (pokemon) =>
            ({
              ...pokemon,
              types: resolvePokemonTypes(pokemon, effectiveGeneration),
            }) satisfies Pokemon,
        ),
    [enabledGens, effectiveGeneration],
  );

  return {
    enabledGens,
    effectiveGeneration,
    availablePokemon,
  };
}

function resolvePokemonTypes(
  pokemon: Pokemon,
  effectiveGeneration: number,
): PokemonType[] {
  const applicablePastTypes = pokemon.pastTypes
    ?.toSorted((left, right) => left.gen - right.gen)
    .find((pastTypes) => effectiveGeneration <= pastTypes.gen);

  return applicablePastTypes?.types ?? pokemon.types;
}
