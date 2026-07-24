import type { DailyBattleAttemptRecord } from "../model/Score";

const storageKey = "poketype.daily-moves.v1";

export interface DailyAttemptRepository {
	readonly findByDate: (dateKey: string) => DailyBattleAttemptRecord | null;
	readonly findAll: () => readonly DailyBattleAttemptRecord[];

	readonly save: (attempt: DailyBattleAttemptRecord) => void;
}

export const localDailyBattleRepository: DailyAttemptRepository = {
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

function readAttempts(): readonly DailyBattleAttemptRecord[] {
	const serializedAttempts = localStorage.getItem(storageKey);

	if (!serializedAttempts) {
		return [];
	}

	try {
		const parsedAttempts: unknown = JSON.parse(serializedAttempts);

		if (!Array.isArray(parsedAttempts)) {
			return [];
		}

		return parsedAttempts.filter(isDailyBattleAttemptRecord);
	} catch {
		return [];
	}
}

function isDailyBattleAttemptRecord(
	value: unknown,
): value is DailyBattleAttemptRecord {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Partial<DailyBattleAttemptRecord>;

	return (
		typeof candidate.dateKey === "string" &&
		typeof candidate.score === "number" &&
		typeof candidate.correctAnswers === "number" &&
		typeof candidate.totalRounds === "number" &&
		typeof candidate.percentage === "number" &&
		typeof candidate.maxScore === "number"
	);
}
