import {dailyGameConfig} from "../features/game-moves/dailyMoveGameConfig.ts";

type ShareGameResultInput = {
	score: number;
	correctAnswers: number;
};

type DailyChallengeResultInput = ShareGameResultInput & {
	highestMultiplier: number;
};

type DailyBattleResultInput = ShareGameResultInput & {
	percentage: number;
};

export type ShareResult = "shared" | "copied" | "cancelled";

export function createDailyChallengeShareText(result: DailyChallengeResultInput): string {
	return [
		'PokeType: Daily Types',
		'',
		`Final score: ${result.score.toLocaleString()}`,
		`Correct answers: ${result.correctAnswers}`,
		`Highest multiplier: ×${result.highestMultiplier.toFixed(2)}`,
	].join("\n");
}

export function createDailyBattleShareText(result: DailyBattleResultInput): string {
	return [
		'PokeType: Daily Battle',
		'',
		`Final score: ${result.score.toLocaleString()}`,
		`Optimal moves chosen: ${result.correctAnswers}/${dailyGameConfig.rounds}`,
		`Percentage ${result.percentage}%`,
	].join("\n");
}

export async function shareGameResult(
	text: string,
	title: string = "Poketype Quiz",
): Promise<ShareResult> {
	const url = window.location.href;

	if (navigator.share) {
		try {
			await navigator.share({
				title,
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
