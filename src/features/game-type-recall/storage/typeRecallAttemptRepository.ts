import type { TypeRecallAttemptRecord } from "../model/typeRecallGameTypes.ts";

const storageKey = "poketype.daily-reversed.v1";

export interface TypeRecallAttemptRepository {
  readonly findByDate: (dateKey: string) => TypeRecallAttemptRecord | null;
  readonly findAll: () => readonly TypeRecallAttemptRecord[];

  readonly save: (attempt: TypeRecallAttemptRecord) => void;
}

export const typeRecallAttemptRepository: TypeRecallAttemptRepository = {
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

function readAttempts(): readonly TypeRecallAttemptRecord[] {
  const serializedAttempts = localStorage.getItem(storageKey);

  if (!serializedAttempts) {
    return [];
  }

  try {
    const parsedAttempts: unknown = JSON.parse(serializedAttempts);

    if (!Array.isArray(parsedAttempts)) {
      return [];
    }

    return parsedAttempts.filter(isTypeRecallAttemptRecord);
  } catch {
    return [];
  }
}

function isTypeRecallAttemptRecord(
  value: unknown,
): value is TypeRecallAttemptRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TypeRecallAttemptRecord>;

  return (
    typeof candidate.dateKey === "string" &&
    typeof candidate.completedAt === "number" &&
    typeof candidate.score === "number" &&
    typeof candidate.correctAnswers === "number" &&
    typeof candidate.canonicalOrderAnswers === "number" &&
    typeof candidate.highestMultiplier === "number"
  );
}
