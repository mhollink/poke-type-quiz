import type { Analytics } from "../model/Analytics";
import type {
	AnalyticsEventMap,
	AnalyticsEventName,
} from "../model/AnalyticsEventMap";
import type { AnalyticsScreen } from "../model/AnalyticsScreen";

export interface GoogleAnalyticsOptions {
	measurementId: string;
	debug?: boolean;
}

export class GoogleAnalytics implements Analytics {
	private readonly options: GoogleAnalyticsOptions;

	public constructor(options: GoogleAnalyticsOptions) {
		this.options = options;
	}

	public configure(): void {
		window.gtag?.("config", this.options.measurementId, {
			send_page_view: false,
			debug_mode: this.options.debug ?? false,
			allow_google_signals: false,
			allow_ad_personalization_signals: false,
		});
	}

	public track<EventName extends AnalyticsEventName>(
		eventName: EventName,
		parameters: AnalyticsEventMap[EventName],
	): void {
		window.gtag?.("event", eventName, parameters);
	}

	public trackScreen(screen: AnalyticsScreen): void {
		window.gtag?.("event", "page_view", {
			page_title: screen,
			page_location: getPageLocation(screen),
		});
	}
}

function getPageLocation(screen: AnalyticsScreen): string {
	const url = new URL(window.location.href);

	/*
	 * The application has one real page. The hash supplies a stable,
	 * non-sensitive virtual location for SPA reporting.
	 */
	url.hash = screen;

	return url.toString();
}
