import type { TypeRushAttemptRecord } from "../model/typeRushGameTypes.ts";

const storageKey = "poketype.daily-attempts.v1";

export interface TypeRushAttemptRepository {
  readonly findByDate: (dateKey: string) => TypeRushAttemptRecord | null;
  readonly findAll: () => readonly TypeRushAttemptRecord[];

  readonly save: (attempt: TypeRushAttemptRecord) => void;
}

export const localTypeRushAttemptRepository: TypeRushAttemptRepository = {
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

function readAttempts(): readonly TypeRushAttemptRecord[] {
  const serializedAttempts = localStorage.getItem(storageKey);

  if (!serializedAttempts) {
    return [];
  }

  try {
    const parsedAttempts: unknown = JSON.parse(serializedAttempts);

    if (!Array.isArray(parsedAttempts)) {
      return [];
    }

    return parsedAttempts.filter(isTypeRushAttemptRecord);
  } catch {
    return [];
  }
}

function isTypeRushAttemptRecord(value: unknown): value is TypeRushAttemptRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TypeRushAttemptRecord>;

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
