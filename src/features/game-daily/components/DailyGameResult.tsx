// features/game-daily/components/DailyGameResult.tsx

import { GameResult } from "../../game-shared/components/GameResult";
import { dailyGameConfig } from "../dailyGameConfig";
import type {
	DailyAttemptRecord,
	DailyGameOverReason,
} from "../model/dailyGameTypes";

export interface DailyGameResultProps {
	readonly attempt: Pick<
		DailyAttemptRecord,
		"score" | "correctAnswers" | "mistakes" | "highestStreak"
	>;
	readonly reason: DailyGameOverReason | "already-played";
	readonly onExit: () => void;
}

export function DailyGameResult({
	attempt,
	reason,
	onExit,
}: DailyGameResultProps) {
	return (
		<GameResult
			title={getTitle(reason)}
			message={getMessage(reason)}
			score={attempt.score}
			correctAnswers={attempt.correctAnswers}
			highestMultiplier={calculateHighestMultiplier(attempt.highestStreak)}
			statistics={[
				{
					label: "Best streak",
					value: attempt.highestStreak.toLocaleString(),
				},
			]}
			primaryAction={{
				label: "Exit",
				onClick: onExit,
			}}
		/>
	);
}

function getTitle(reason: DailyGameOverReason | "already-played"): string {
	switch (reason) {
		case "time-expired":
			return "Daily challenge complete";

		case "no-challenges-left":
			return "Daily challenge mastered";

		case "already-played":
			return "Today's challenge is complete";
	}
}

function getMessage(reason: DailyGameOverReason | "already-played"): string {
	switch (reason) {
		case "time-expired":
			return "Time is up. Your score has been saved for today.";

		case "no-challenges-left":
			return "You completed every available challenge for today.";

		case "already-played":
			return "You have already used today's attempt. A new challenge will be available tomorrow.";
	}
}

function calculateHighestMultiplier(highestStreak: number): number {
	return Math.min(
		dailyGameConfig.maximumStreakMultiplier,
		1 + highestStreak * dailyGameConfig.streakMultiplierStep,
	);
}
