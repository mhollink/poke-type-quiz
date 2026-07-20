import type {
	AnalyticsEventMap,
	AnalyticsEventName,
} from "./AnalyticsEventMap";
import type { AnalyticsScreen } from "./AnalyticsScreen";

export interface Analytics {
	track<EventName extends AnalyticsEventName>(
		eventName: EventName,
		parameters: AnalyticsEventMap[EventName],
	): void;

	trackScreen(screen: AnalyticsScreen): void;
}
