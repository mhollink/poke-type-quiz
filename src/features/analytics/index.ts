export { analytics } from "./application/analyticsFeature";
export {
	trackGameAbandoned,
	trackGameCompleted,
	trackGameStarted,
} from "./application/gameAnalytics";
export { AnalyticsRoot } from "./components/AnalyticsRoot";
export type { Analytics } from "./model/Analytics";
export type {
	AbandonmentStage,
	AnalyticsEventMap,
	AnalyticsEventName,
} from "./model/AnalyticsEventMap";
export type { AnalyticsScreen } from "./model/AnalyticsScreen";
