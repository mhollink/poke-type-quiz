import type { RandomSource } from "~/utils";

export function randomIntegerInclusive(
  minimum: number,
  maximum: number,
  random: RandomSource,
): number {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum)) {
    throw new Error("Hit boundaries must be integers");
  }

  if (maximum < minimum) {
    throw new Error(
      "Maximum hits must be greater than or equal to minimum hits",
    );
  }

  if (minimum === maximum) {
    return minimum;
  }

  return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

export function pickRandomItem<T>(
  items: readonly T[],
  random: RandomSource,
): T {
  if (items.length === 0) {
    throw new Error("Cannot select from an empty collection");
  }

  if (items.length === 1) {
    return items[0];
  }

  const index = randomIntegerInclusive(0, items.length - 1, random);

  return items[index];
}
