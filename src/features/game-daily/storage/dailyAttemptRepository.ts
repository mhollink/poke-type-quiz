export interface DailyAttempt {
	readonly dateKey: string;
	readonly startedAt: string;
	readonly completedAt: string | null;
	readonly score: number;
	readonly correctAnswers: number;
}

const storageKey = "poketype.daily-attempts.v1";

export function hasDailyAttempt(dateKey: string): boolean {
	return readDailyAttempts().some((attempt) => attempt.dateKey === dateKey);
}

export function saveDailyAttempt(attempt: DailyAttempt): void {
	const attempts = readDailyAttempts().filter(
		(candidate) => candidate.dateKey !== attempt.dateKey,
	);

	localStorage.setItem(storageKey, JSON.stringify([...attempts, attempt]));
}

export function readDailyAttempts(): readonly DailyAttempt[] {
	const storedValue = localStorage.getItem(storageKey);

	if (!storedValue) {
		return [];
	}

	try {
		const parsedValue: unknown = JSON.parse(storedValue);

		return Array.isArray(parsedValue) ? (parsedValue as DailyAttempt[]) : [];
	} catch {
		return [];
	}
}
