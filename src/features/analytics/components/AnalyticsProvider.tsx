import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { analyticsFeature } from "../application/analyticsFeature";
import {
	readAnalyticsConsent,
	writeAnalyticsConsent,
} from "../infrastructure/analyticsConsentStorage.ts";
import type { AnalyticsConsent } from "../model/AnalyticsConsent";

interface AnalyticsContextValue {
	consent: AnalyticsConsent;
	isInitializing: boolean;
	grantConsent(): Promise<void>;
	denyConsent(): void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(
	undefined,
);

export function AnalyticsProvider({ children }: PropsWithChildren) {
	const [consent, setConsent] = useState<AnalyticsConsent>(() =>
		readAnalyticsConsent(),
	);

	const [isInitializing, setIsInitializing] = useState(false);

	useEffect(() => {
		if (consent !== "granted") {
			analyticsFeature.disable();
			return;
		}

		let cancelled = false;

		async function initialize(): Promise<void> {
			setIsInitializing(true);

			try {
				await analyticsFeature.enable();
			} finally {
				if (!cancelled) {
					setIsInitializing(false);
				}
			}
		}

		void initialize();

		return () => {
			cancelled = true;
		};
	}, [consent]);

	const grantConsent = useCallback(async (): Promise<void> => {
		writeAnalyticsConsent("granted");
		setConsent("granted");
	}, []);

	const denyConsent = useCallback((): void => {
		writeAnalyticsConsent("denied");
		analyticsFeature.disable();
		setConsent("denied");
	}, []);

	const value = useMemo<AnalyticsContextValue>(
		() => ({
			consent,
			isInitializing,
			grantConsent,
			denyConsent,
		}),
		[consent, isInitializing, grantConsent, denyConsent],
	);

	return (
		<AnalyticsContext.Provider value={value}>
			{children}
		</AnalyticsContext.Provider>
	);
}

export function useAnalyticsConsent(): AnalyticsContextValue {
	const context = useContext(AnalyticsContext);

	if (!context) {
		throw new Error(
			"useAnalyticsConsent must be used inside AnalyticsProvider",
		);
	}

	return context;
}
