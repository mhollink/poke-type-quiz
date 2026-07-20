import { NoOpAnalytics } from "../infrastructure/NoOpAnalytics";
import type { Analytics } from "../model/Analytics";
import type {
	AnalyticsEventMap,
	AnalyticsEventName,
} from "../model/AnalyticsEventMap";
import type { AnalyticsScreen } from "../model/AnalyticsScreen";

export class AnalyticsManager implements Analytics {
	private delegate: Analytics = new NoOpAnalytics();

	public enable(delegate: Analytics): void {
		this.delegate = delegate;
	}

	public disable(): void {
		this.delegate = new NoOpAnalytics();
	}

	public track<EventName extends AnalyticsEventName>(
		eventName: EventName,
		parameters: AnalyticsEventMap[EventName],
	): void {
		console.log({ analytics: { eventName, parameters } });
		this.delegate.track(eventName, parameters);
	}

	public trackScreen(screen: AnalyticsScreen): void {
		this.delegate.trackScreen(screen);
	}
}
