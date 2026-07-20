import type { Analytics } from "../model/Analytics";

export class NoOpAnalytics implements Analytics {
	track(): void {
		// Analytics intentionally disabled.
	}

	trackScreen(): void {
		// Analytics intentionally disabled.
	}
}
