import { GoogleAnalytics } from "../infrastructure/GoogleAnalytics";
import { loadGoogleTag } from "../infrastructure/loadGoogleTag";
import { AnalyticsManager } from "./AnalyticsManager";

export interface AnalyticsFeature {
	analytics: AnalyticsManager;
	enable(): Promise<void>;
	disable(): void;
}

export interface CreateAnalyticsOptions {
	measurementId?: string;
	debug?: boolean;
}

export function createAnalytics(
	options: CreateAnalyticsOptions,
): AnalyticsFeature {
	const analytics = new AnalyticsManager();

	return {
		analytics,

		async enable(): Promise<void> {
			if (!options.measurementId) {
				console.warn(
					"Analytics cannot be enabled because no measurement ID is configured",
				);

				analytics.disable();
				return;
			}

			try {
				await loadGoogleTag(options.measurementId);

				const googleAnalytics = new GoogleAnalytics({
					measurementId: options.measurementId,
					debug: options.debug,
				});

				googleAnalytics.configure();
				analytics.enable(googleAnalytics);
			} catch (error: unknown) {
				analytics.disable();

				console.warn("Analytics could not be initialized", error);
			}
		},

		disable(): void {
			analytics.disable();
		},
	};
}
