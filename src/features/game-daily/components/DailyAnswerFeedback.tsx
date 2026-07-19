import Typography from "@mui/material/Typography";
import type { DailySubmissionResult } from "../hooks/useDailyGame";

export interface DailyAnswerFeedbackProps {
	readonly result: DailySubmissionResult;
}

export function DailyAnswerFeedback({ result }: DailyAnswerFeedbackProps) {
	const feedback = getFeedback(result);

	return (
		<Typography
			variant="caption"
			color={
				feedback?.severity === "error"
					? "error"
					: feedback?.severity === "success"
						? "success"
						: "textSecondary"
			}
			sx={{
				minHeight: "1.25rem",
				textAlign: "center",
			}}
			aria-live="polite"
		>
			{feedback?.message ??
				"Choose a Pokémon with the exact displayed type combination."}
		</Typography>
	);
}

interface Feedback {
	readonly severity: "success" | "error";
	readonly message: string;
}

function getFeedback(result: DailySubmissionResult): Feedback | null {
	switch (result) {
		case "correct":
			return {
				severity: "success",
				message: "Correct. Your streak increased.",
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
