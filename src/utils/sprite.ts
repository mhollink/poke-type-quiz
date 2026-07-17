const SPRITE_BASE_URL =
	"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export function getPokemonSpriteUrl(dexNumber: number): string {
	return `${SPRITE_BASE_URL}/${dexNumber}.png`;
}
