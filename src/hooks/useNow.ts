import { useEffect, useState } from "react";

export function useNow(enabled: boolean, intervalMs = 50): number {
	const [now, setNow] = useState(() => performance.now());

	useEffect(() => {
		if (!enabled) {
			return;
		}

		setNow(performance.now());

		const interval = window.setInterval(() => {
			setNow(performance.now());
		}, intervalMs);

		return () => {
			window.clearInterval(interval);
		};
	}, [enabled, intervalMs]);

	return now;
}
