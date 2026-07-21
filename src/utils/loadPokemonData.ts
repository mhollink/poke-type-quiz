export async function loadPokemonData() {
    const module = await import("../assets/pokemon.json");
    return module.default;
}