import { useCallback, useEffect, useState } from "react";

type InstallOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<{
		outcome: InstallOutcome;
		platform?: string;
	}>;
}

interface NavigatorWithStandalone extends Navigator {
	standalone?: boolean;
}

const SNACKBAR_DURATION_MS = 20_000;
const DISMISSAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1_000;
const DISMISSED_AT_STORAGE_KEY = "pwa-install-dismissed-at";

function isRunningStandalone(): boolean {
	const navigatorWithStandalone = navigator as NavigatorWithStandalone;

	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		navigatorWithStandalone.standalone === true
	);
}

function wasRecentlyDismissed(): boolean {
	const storedValue = localStorage.getItem(DISMISSED_AT_STORAGE_KEY);

	if (!storedValue) {
		return false;
	}

	const dismissedAt = Number(storedValue);

	return (
		Number.isFinite(dismissedAt) &&
		Date.now() - dismissedAt < DISMISSAL_COOLDOWN_MS
	);
}

export interface PwaInstallPrompt {
	isVisible: boolean;
	install(): Promise<void>;
	dismiss(): void;
}

export function usePwaInstallPrompt(): PwaInstallPrompt {
	const [promptEvent, setPromptEvent] =
		useState<BeforeInstallPromptEvent | null>(null);

	const [isVisible, setVisible] = useState(false);

	const dismiss = useCallback(() => {
		localStorage.setItem(DISMISSED_AT_STORAGE_KEY, String(Date.now()));

		setVisible(false);
		setPromptEvent(null);
	}, []);

	const install = useCallback(async () => {
		if (!promptEvent) {
			return;
		}

		// trackEvent('pwa_install_clicked');

		const result = await promptEvent.prompt();

		// trackEvent('pwa_install_prompt_result', {
		//   outcome: result.outcome,
		// });

		setVisible(false);
		setPromptEvent(null);

		if (result.outcome === "dismissed") {
			localStorage.setItem(DISMISSED_AT_STORAGE_KEY, String(Date.now()));
		}
	}, [promptEvent]);

	useEffect(() => {
		if (isRunningStandalone()) {
			return;
		}

		const handleBeforeInstallPrompt = (event: Event): void => {
			if (wasRecentlyDismissed()) {
				return;
			}

			event.preventDefault();

			setPromptEvent(event as BeforeInstallPromptEvent);

			setVisible(true);

			// trackEvent('pwa_install_snackbar_shown');
		};

		const handleInstalled = (): void => {
			setVisible(false);
			setPromptEvent(null);

			// trackEvent('pwa_installed');
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		window.addEventListener("appinstalled", handleInstalled);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);

			window.removeEventListener("appinstalled", handleInstalled);
		};
	}, []);

	useEffect(() => {
		if (!isVisible) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setVisible(false);
		}, SNACKBAR_DURATION_MS);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [isVisible]);

	return {
		isVisible,
		install,
		dismiss,
	};
}
