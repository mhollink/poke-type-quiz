import type { Pokemon } from "~/types";

import type { TypeRushChallenge } from "../model/typeRushGameTypes.ts";

export type TypeRushChallengeMatch =
  | "match"
  | "wrong-types"
  | "incorrect-order";

export function matchesTypeRushChallenge(
  pokemon: Pokemon,
  challenge: TypeRushChallenge,
): TypeRushChallengeMatch {
  if (pokemon.types.length !== challenge.types.length) {
    return "wrong-types";
  }

  const exactMatch = challenge.types.every(
    (type, index) => pokemon.types[index] === type,
  );

  if (exactMatch) {
    return "match";
  }

  const hasSameTypes = challenge.types.every((type) =>
    pokemon.types.includes(type),
  );

  if (hasSameTypes) {
    return "incorrect-order";
  }

  return "wrong-types";
}
