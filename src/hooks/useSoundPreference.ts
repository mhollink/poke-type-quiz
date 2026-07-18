import { useCallback, useState } from "react";

const STORAGE_KEY = "ptq:sound";

export function useSoundPreference() {
	const [soundEnabled, setSoundEnabled] = useState(() => {
		const value = localStorage.getItem(STORAGE_KEY);

		return value !== "false";
	});

	const toggleSound = useCallback(() => {
		setSoundEnabled((current) => {
			const next = !current;

			localStorage.setItem(STORAGE_KEY, String(next));

			return next;
		});
	}, []);

	return {
		soundEnabled,
		toggleSound,
	};
}
