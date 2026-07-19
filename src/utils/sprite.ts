const SPRITE_BASE_URL =
	"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export function getPokemonSpriteUrl(
	dexNumber: number,
	shiny: boolean = false,
): string {
	if (shiny) {
		return `${SPRITE_BASE_URL}/shiny/${dexNumber}.png`;
	} else {
		return `${SPRITE_BASE_URL}/${dexNumber}.png`;
	}
}
