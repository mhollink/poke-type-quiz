type GtagEventParameters = Record<
	string,
	string | number | boolean | undefined
>;

type GtagConfigParameters = {
	send_page_view?: boolean;
	debug_mode?: boolean;
	allow_google_signals?: boolean;
	allow_ad_personalization_signals?: boolean;
};

type GtagFunction = {
	(command: "js", date: Date): void;

	(
		command: "config",
		measurementId: string,
		parameters?: GtagConfigParameters,
	): void;

	(command: "event", eventName: string, parameters?: GtagEventParameters): void;
};

declare global {
	interface Window {
		dataLayer?: IArguments[];
		gtag?: GtagFunction;
	}
}

export {};
