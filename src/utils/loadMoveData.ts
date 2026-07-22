export async function loadMoveData() {
	const module = await import("../assets/moves.json");
	return module.default;
}
