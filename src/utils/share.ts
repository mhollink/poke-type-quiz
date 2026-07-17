type ShareGameResultInput = {
	score: number;
	correctAnswers: number;
	highestMultiplier: number;
};

export type ShareResult = "shared" | "copied" | "cancelled";

export function createShareText(result: ShareGameResultInput): string {
	return [
		"Pokemon Type Quiz\n",
		`Score: ${result.score.toLocaleString()}`,
		`Correct answers: ${result.correctAnswers}`,
		`Highest multiplier: ×${result.highestMultiplier.toFixed(2)}`,
	].join("\n");
}

export async function shareGameResult(
	result: ShareGameResultInput,
): Promise<ShareResult> {
	const text = createShareText(result);
	const url = window.location.href;

	if (navigator.share) {
		try {
			await navigator.share({
				title: "Pokemon Type Quiz",
				text,
				url,
			});

			return "shared";
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				return "cancelled";
			}
		}
	}

	await navigator.clipboard.writeText(`${text}\n\n${url}`);

	return "copied";
}
