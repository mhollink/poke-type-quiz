import Alert from "@mui/material/Alert";
import type { DailySubmissionResult } from "../hooks/useDailyGame";

export interface DailyAnswerFeedbackProps {
	readonly result: DailySubmissionResult;
}

export function DailyAnswerFeedback({ result }: DailyAnswerFeedbackProps) {
	const feedback = getFeedback(result);

	return (
		<Alert
			variant="standard"
			sx={{
				minHeight: "1.25rem",
				textAlign: "center",
			}}
			aria-live="polite"
			icon={false}
			severity={feedback?.severity ?? "info"}
		>
			{feedback?.message ??
				"Choose a Pokémon with the exact displayed type combination."}
		</Alert>
	);
}

interface Feedback {
	readonly severity: "success" | "error" | "warning";
	readonly message: string;
}

function getFeedback(result: DailySubmissionResult): Feedback | null {
	switch (result) {
		case "correct":
			return {
				severity: "success",
				message: "Correct. Your streak increased.",
			};

		case "incorrect-order":
			return {
				severity: "warning",
				message:
					"That Pokémon has the correct types, but the primary and secondary types are reversed.",
			};

		case "wrong-types":
			return {
				severity: "error",
				message: "That Pokémon does not have the displayed type combination.",
			};

		case "already-used":
			return {
				severity: "error",
				message: "You have already used that Pokémon during this run.",
			};

		case "unknown-pokemon":
			return {
				severity: "error",
				message: "That Pokémon could not be found.",
			};

		case null:
			return null;
	}
}
