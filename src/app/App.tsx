import { AppHeader } from "../components/AppHeader";
import { Game } from "../features/game/Game";
import { useSoundPreference } from "../hooks/useSoundPreference.ts";

export function App() {
	const { soundEnabled, toggleSound } = useSoundPreference();

	return (
		<>
			<AppHeader soundEnabled={soundEnabled} onToggleSound={toggleSound} />

			<Game soundEnabled={soundEnabled} />
		</>
	);
}
