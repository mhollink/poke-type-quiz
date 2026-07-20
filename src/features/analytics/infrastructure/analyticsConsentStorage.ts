import type { AnalyticsConsent } from "../model/AnalyticsConsent";

const STORAGE_KEY = "poketype.analytics-consent";

export function readAnalyticsConsent(): AnalyticsConsent {
	const value = localStorage.getItem(STORAGE_KEY);

	if (value === "granted" || value === "denied") {
		return value;
	}

	return "unknown";
}

export function writeAnalyticsConsent(
	consent: Exclude<AnalyticsConsent, "unknown">,
): void {
	localStorage.setItem(STORAGE_KEY, consent);
}

export function clearAnalyticsConsent(): void {
	localStorage.removeItem(STORAGE_KEY);
}
