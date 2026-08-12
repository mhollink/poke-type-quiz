const STORAGE_KEY = "poketype:generations:v1";

interface StoredGenerations {
  version: 1;
  enabledGenerations: number[];
}

export interface GenerationRepository {
  findEnabledGenerations(): ReadonlySet<number>;
  store(generations: Iterable<number>): void;
}

export function createGenerationRepository(
  storage: Pick<Storage, "getItem" | "setItem">,
): GenerationRepository {
  function findEnabledGenerations(): ReadonlySet<number> {
    const storedValue = storage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }

    try {
      const parsed = JSON.parse(storedValue) as Partial<StoredGenerations>;
      if (parsed.version !== 1 || !Array.isArray(parsed.enabledGenerations)) {
        return new Set();
      }

      return new Set(
        parsed.enabledGenerations.filter(
          (gen): gen is number => typeof gen === "number",
        ),
      );
    } catch {
      return new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }
  }

  function store(generations: Iterable<number>): void {
    const storedPokedex: StoredGenerations = {
      version: 1,
      enabledGenerations: [...generations],
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(storedPokedex));
  }

  return {
    findEnabledGenerations,
    store,
  };
}

export const localGenerationSelectionRepository =
  createGenerationRepository(localStorage);
