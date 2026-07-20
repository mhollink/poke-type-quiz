import type { PropsWithChildren } from "react";
import { AnalyticsConsentModal } from "./AnalyticsConsentModal";
import { AnalyticsProvider } from "./AnalyticsProvider";

export function AnalyticsRoot({ children }: PropsWithChildren) {
	return (
		<AnalyticsProvider>
			{children}
			<AnalyticsConsentModal />
		</AnalyticsProvider>
	);
}
