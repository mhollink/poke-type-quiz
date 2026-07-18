import type { GameMode } from "../features/game-modes/gameModeTypes.ts";
import type {
	DailyScore,
	StoredGameAttempt,
	StoredScoreData,
} from "../types/game";
import { getLocalDateKey } from "./date";

const STORAGE_KEY = "ptq:games";
const MAXIMUM_STORED_DAYS = 90;

const emptyScoreData: StoredScoreData = {
	version: 1,
	scoresByDate: {},
};

export function loadScoreData(mode: GameMode): StoredScoreData {
	const storedValue = localStorage.getItem(`${STORAGE_KEY}:${mode}`);

	if (!storedValue) {
		return emptyScoreData;
	}

	try {
		const parsedValue = JSON.parse(storedValue) as unknown;

		if (!isStoredScoreData(parsedValue)) {
			return emptyScoreData;
		}

		return parsedValue;
	} catch {
		return emptyScoreData;
	}
}

export function saveGameAttempt(
	attempt: StoredGameAttempt,
	mode: GameMode,
	date = getLocalDateKey(),
): DailyScore {
	const currentData = loadScoreData(mode);
	const currentDailyScore = currentData.scoresByDate[date];

	const attempts = [...(currentDailyScore?.attempts ?? []), attempt];

	const updatedDailyScore: DailyScore = {
		date,
		attempts,
		bestScore: Math.max(currentDailyScore?.bestScore ?? 0, attempt.score),
		bestCorrectAnswers: Math.max(
			currentDailyScore?.bestCorrectAnswers ?? 0,
			attempt.correctAnswers,
		),
	};

	const scoresByDate = retainRecentDays({
		...currentData.scoresByDate,
		[date]: updatedDailyScore,
	});

	localStorage.setItem(
		`${STORAGE_KEY}:${mode}`,
		JSON.stringify({
			version: 1,
			scoresByDate,
		} satisfies StoredScoreData),
	);

	return updatedDailyScore;
}

export function getScoreHistory(mode: GameMode): () => DailyScore[] {
	return () =>
		Object.values(loadScoreData(mode).scoresByDate).sort((left, right) =>
			right.date.localeCompare(left.date),
		);
}

function retainRecentDays(
	scoresByDate: Record<string, DailyScore>,
): Record<string, DailyScore> {
	return Object.fromEntries(
		Object.entries(scoresByDate)
			.sort(([left], [right]) => right.localeCompare(left))
			.slice(0, MAXIMUM_STORED_DAYS),
	);
}

function isStoredScoreData(value: unknown): value is StoredScoreData {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Partial<StoredScoreData>;

	return (
		candidate.version === 1 &&
		candidate.scoresByDate !== null &&
		typeof candidate.scoresByDate === "object"
	);
}
