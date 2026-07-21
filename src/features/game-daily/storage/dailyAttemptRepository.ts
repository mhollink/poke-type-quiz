import type { DailyAttemptRecord } from "../model/dailyGameTypes";

const storageKey = "poketype.daily-attempts.v1";

export interface DailyAttemptRepository {
	readonly findByDate: (dateKey: string) => DailyAttemptRecord | null;
	readonly findAll: () => readonly DailyAttemptRecord[];

	readonly save: (attempt: DailyAttemptRecord) => void;
}

export const localDailyAttemptRepository: DailyAttemptRepository = {
	findByDate(dateKey) {
		return (
			readAttempts().find((attempt) => attempt.dateKey === dateKey) ?? null
		);
	},

	findAll() {
		return readAttempts();
	},

	save(attempt) {
		const attempts = readAttempts().filter(
			(existingAttempt) => existingAttempt.dateKey !== attempt.dateKey,
		);

		localStorage.setItem(storageKey, JSON.stringify([...attempts, attempt]));
	},
};

function readAttempts(): readonly DailyAttemptRecord[] {
	const serializedAttempts = localStorage.getItem(storageKey);

	if (!serializedAttempts) {
		return [];
	}

	try {
		const parsedAttempts: unknown = JSON.parse(serializedAttempts);

		if (!Array.isArray(parsedAttempts)) {
			return [];
		}

		return parsedAttempts.filter(isDailyAttemptRecord);
	} catch {
		return [];
	}
}

function isDailyAttemptRecord(value: unknown): value is DailyAttemptRecord {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Partial<DailyAttemptRecord>;

	return (
		typeof candidate.dateKey === "string" &&
		typeof candidate.startedAt === "number" &&
		(candidate.completedAt === null ||
			typeof candidate.completedAt === "number") &&
		typeof candidate.score === "number" &&
		typeof candidate.correctAnswers === "number" &&
		typeof candidate.mistakes === "number" &&
		typeof candidate.highestStreak === "number"
	);
}
