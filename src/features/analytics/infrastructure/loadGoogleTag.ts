const GOOGLE_TAG_SCRIPT_ID = "google-analytics-script";

let loadingPromise: Promise<void> | undefined;

export function loadGoogleTag(measurementId: string): Promise<void> {
	if (window.gtag) {
		return Promise.resolve();
	}

	if (loadingPromise) {
		return loadingPromise;
	}

	initializeDataLayer();

	loadingPromise = new Promise<void>((resolve, reject) => {
		const existingScript = document.getElementById(GOOGLE_TAG_SCRIPT_ID);

		if (existingScript) {
			resolve();
			return;
		}

		const script = document.createElement("script");

		script.id = GOOGLE_TAG_SCRIPT_ID;
		script.async = true;
		script.src =
			"https://www.googletagmanager.com/gtag/js" +
			`?id=${encodeURIComponent(measurementId)}`;

		script.addEventListener("load", () => resolve(), {
			once: true,
		});

		script.addEventListener(
			"error",
			() => {
				script.remove();
				loadingPromise = undefined;

				reject(new Error("Failed to load the Google Analytics tag"));
			},
			{ once: true },
		);

		document.head.appendChild(script);
	});

	return loadingPromise;
}

function initializeDataLayer(): void {
	window.dataLayer = window.dataLayer ?? [];

	window.gtag = function gtag(): void {
		window.dataLayer?.push(arguments);
	};

	window.gtag("js", new Date());
}
