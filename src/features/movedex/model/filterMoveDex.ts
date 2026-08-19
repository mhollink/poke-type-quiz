import type { MoveClassifier, PokemonType } from "~/types";

import type { MoveDexViewEntry } from "../hooks/useMoveDex.ts";

export type MoveDexStatus = "all" | "discovered" | "undiscovered" | "mastered";

export type MoveDexFilter = {
  readonly status: MoveDexStatus;
  readonly type: PokemonType | "all";
  readonly classifier: MoveClassifier | "all";
};

export function filterMoveDex(
  entries: readonly MoveDexViewEntry[],
  filter: MoveDexFilter,
): readonly MoveDexViewEntry[] {
  return entries.filter((entry) => {
    if (filter.type !== "all" && entry.move.type !== filter.type) {
      return false;
    }

    if (
      filter.classifier !== "all" &&
      entry.move.classifier !== filter.classifier
    ) {
      return false;
    }

    switch (filter.status) {
      case "discovered":
        return entry.discovered;

      case "undiscovered":
        return !entry.discovered;

      case "mastered":
        return entry.mastered;

      case "all":
        return true;
    }
  });
}
