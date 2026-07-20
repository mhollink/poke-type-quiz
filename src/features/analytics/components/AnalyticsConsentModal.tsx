import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
} from "@mui/material";
import { useState } from "react";

import { useAnalyticsConsent } from "./AnalyticsProvider";

export function AnalyticsConsentModal() {
	const { consent, denyConsent, grantConsent, isInitializing } =
		useAnalyticsConsent();

	const [isSubmitting, setIsSubmitting] = useState(false);

	const isOpen = consent === "unknown";

	async function handleAccept(): Promise<void> {
		setIsSubmitting(true);

		try {
			await grantConsent();
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleDeny(): void {
		denyConsent();
	}

	return (
		<Dialog
			open={isOpen}
			aria-labelledby="analytics-consent-title"
			aria-describedby="analytics-consent-description"
			maxWidth="sm"
			fullWidth
			onClose={(_, reason) => {
				/*
				 * Consent requires an explicit decision.
				 * Do not close through the backdrop or Escape key.
				 */
				if (reason === "backdropClick" || reason === "escapeKeyDown") {
					return;
				}
			}}
		>
			<DialogTitle id="analytics-consent-title" sx={{ fontWeight: 700 }}>
				Help improve PokeType
			</DialogTitle>

			<DialogContent>
				<Stack spacing={2}>
					<DialogContentText id="analytics-consent-description">
						Poketype will collect limited gameplay statistics to measure how the
						different game modes perform. This may include game starts,
						completions, scores, duration, and general progress.
					</DialogContentText>
					<DialogContentText>
						We do not collect names, email addresses, account details, typed
						answers, or other information intended to identify you. The
						statistics are limited to how the game is used and performed.
					</DialogContentText>
					<DialogContentText>
						We do not sell these statistics or share them with advertisers or
						other third parties for their own purposes. Analytics data is
						processed by Google Analytics on our behalf and is used only to
						understand and improve Poketype.
					</DialogContentText>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
				<Button
					type="button"
					size="small"
					onClick={handleDeny}
					disabled={isSubmitting || isInitializing}
				>
					Deny
				</Button>

				<Button
					type="button"
					variant="contained"
					size="large"
					onClick={() => void handleAccept()}
					disabled={isSubmitting || isInitializing}
				>
					{isSubmitting || isInitializing
						? "Enabling..."
						: "Help improve Poketype"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
