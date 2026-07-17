import type { Pokemon } from "../types/pokemon";

const CRY_BASE_URL =
	"https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest";

let activeCry: HTMLAudioElement | null = null;

export function getPokemonCryUrl(pokemon: Pick<Pokemon, "nr">): string {
	return `${CRY_BASE_URL}/${pokemon.nr}.ogg`;
}

export async function playPokemonCry(
	pokemon: Pick<Pokemon, "nr">,
): Promise<void> {
	stopPokemonCry();

	const audio = new Audio(getPokemonCryUrl(pokemon));

	activeCry = audio;
	audio.volume = 0.2;

	const clearActiveCry = (): void => {
		if (activeCry === audio) {
			activeCry = null;
		}
	};

	audio.addEventListener("ended", clearActiveCry, {
		once: true,
	});

	audio.addEventListener("error", clearActiveCry, {
		once: true,
	});

	try {
		await audio.play();
	} catch (error) {
		clearActiveCry();

		console.warn(
			`Could not play Pokémon cry for dex number ${pokemon.nr}`,
			error,
		);
	}
}

export function stopPokemonCry(): void {
	if (!activeCry) {
		return;
	}

	activeCry.pause();
	activeCry.currentTime = 0;
	activeCry = null;
}
