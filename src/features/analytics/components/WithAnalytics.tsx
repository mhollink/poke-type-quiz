import { type PropsWithChildren, useEffect } from "react";
import { analyticsFeature } from "../application/analyticsFeature";

export function WithAnalytics({ children }: PropsWithChildren) {
	useEffect(() => {
		async function initialize(): Promise<void> {
			try {
				await analyticsFeature.enable();
			} catch (e) {
				console.warn("Analytics could not be enabled", e);
			}
		}

		void initialize();
	}, []);

	return children;
}
