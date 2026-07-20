import { createAnalytics } from "./createAnalytics";

export const analyticsFeature = createAnalytics({
	measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
	debug: import.meta.env.DEV,
});

export const analytics = analyticsFeature.analytics;
