export function takeRandom<T>(items: readonly T[], amount: number): T[] {
	return [...items].sort(() => Math.random() - 0.5).slice(0, amount);
}
