// src/features/pokedex/storage/pokedexRepository.ts

const STORAGE_KEY = "poketype:pokedex:v1";

interface StoredPokedex {
	version: 1;
	unlockedPokemonIds: string[];
}

export interface PokedexRepository {
	findUnlockedIds(): ReadonlySet<string>;
	unlock(pokemonIds: Iterable<string>): void;
}

export function createPokedexRepository(
	storage: Pick<Storage, "getItem" | "setItem">,
): PokedexRepository {
	function findUnlockedIds(): ReadonlySet<string> {
		const storedValue = storage.getItem(STORAGE_KEY);

		if (!storedValue) {
			return new Set();
		}

		try {
			const parsed = JSON.parse(storedValue) as Partial<StoredPokedex>;

			if (parsed.version !== 1 || !Array.isArray(parsed.unlockedPokemonIds)) {
				return new Set();
			}

			return new Set(
				parsed.unlockedPokemonIds.filter(
					(id): id is string => typeof id === "string",
				),
			);
		} catch {
			return new Set();
		}
	}

	function unlock(pokemonIds: Iterable<string>): void {
		const unlockedPokemonIds = new Set(findUnlockedIds());

		for (const pokemonId of pokemonIds) {
			unlockedPokemonIds.add(pokemonId);
		}

		const storedPokedex: StoredPokedex = {
			version: 1,
			unlockedPokemonIds: [...unlockedPokemonIds],
		};

		storage.setItem(STORAGE_KEY, JSON.stringify(storedPokedex));
	}

	return {
		findUnlockedIds,
		unlock,
	};
}

export const localPokedexRepository = createPokedexRepository(localStorage);
