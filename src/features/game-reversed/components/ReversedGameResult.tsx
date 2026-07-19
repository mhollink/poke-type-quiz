import { GameResult } from "../../game-shared/components/GameResult";
import type {
	ReversedGameOverReason,
	ReversedGameState,
} from "../model/reversedGameTypes";

export interface ReversedGameResultProps {
	readonly result: Pick<
		ReversedGameState,
		"score" | "correctAnswers" | "highestMultiplier" | "canonicalOrderAnswers"
	>;
	readonly reason: ReversedGameOverReason;
	readonly onRestart: () => void;
	readonly onExit: () => void;
}

export function ReversedGameResult({
	result,
	reason,
	onRestart,
	onExit,
}: ReversedGameResultProps) {
	return (
		<GameResult
			title={getTitle(reason)}
			message={getMessage(reason)}
			score={result.score}
			correctAnswers={result.correctAnswers}
			highestMultiplier={result.highestMultiplier}
			statistics={[
				{
					label: "Order bonuses",
					value: result.canonicalOrderAnswers.toLocaleString(),
				},
			]}
			primaryAction={{
				label: "Play again",
				onClick: onRestart,
			}}
			secondaryAction={{
				label: "Exit",
				onClick: onExit,
			}}
		/>
	);
}

function getTitle(reason: ReversedGameOverReason): string {
	switch (reason) {
		case "incorrect-answer":
			return "Incorrect type";

		case "time-expired":
			return "Time expired";

		case "no-challenges-left":
			return "Reversed run mastered";
	}
}

function getMessage(reason: ReversedGameOverReason): string {
	switch (reason) {
		case "incorrect-answer":
			return "The selected types did not match the displayed Pokémon.";

		case "time-expired":
			return "You did not submit the Pokémon's types before the timer expired.";

		case "no-challenges-left":
			return "You identified every available Pokémon correctly.";
	}
}
