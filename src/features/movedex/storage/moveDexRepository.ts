import type {
  MoveDexEntry,
  ResolvedBattleTacticsRound,
} from "../model/MoveDex.ts";

const storageKey = "poketype:move-dex:v1";

type MoveDexStore = {
  readonly appliedDates: string[];
  readonly entries: Readonly<Record<string, MoveDexEntry>>;
};

export type MoveDexChange = {
  readonly previous: MoveDexEntry | null;
  readonly current: MoveDexEntry;
};

export type ApplyMoveDexRoundResult = {
  readonly applied: boolean;
  readonly changes: readonly MoveDexChange[];
};

export interface MoveDexRepository {
  readonly findAll: () => readonly MoveDexEntry[];

  readonly findByMoveId: (moveId: string) => MoveDexEntry | null;

  readonly applyRounds: (
    dateKey: string,
    rounds: ResolvedBattleTacticsRound[],
  ) => ApplyMoveDexRoundResult;
}

export const moveDexRepository: MoveDexRepository = {
  findAll() {
    return Object.values(readStore().entries);
  },

  findByMoveId(moveId) {
    return readStore().entries[moveId] ?? null;
  },

  applyRounds(dateKey, rounds) {
    const store = readStore();
    const entries = { ...store.entries };
    const changes: MoveDexChange[] = [];

    if (store.appliedDates.includes(dateKey)) {
      return {
        applied: false,
        changes: [],
      };
    }

    for (const round of rounds) {
      for (const option of round.options) {
        const previous = entries[option.moveId] ?? null;

        const current: MoveDexEntry = {
          moveId: option.moveId,
          discoveredAt: previous?.discoveredAt ?? round.resolvedAt,
          encounters: (previous?.encounters ?? 0) + 1,
          selections: (previous?.selections ?? 0) + (option.selected ? 1 : 0),
          optimalAppearances:
            (previous?.optimalAppearances ?? 0) + (option.optimal ? 1 : 0),
          optimalSelections:
            (previous?.optimalSelections ?? 0) +
            (option.selected && option.optimal ? 1 : 0),
          judgementAttempts:
            (previous?.judgementAttempts ?? 0) +
            (option.judgement === "neutral" ? 0 : 1),
          correctJudgements:
            (previous?.correctJudgements ?? 0) +
            (option.judgement === "correct" ? 1 : 0),
          bestScore: Math.max(previous?.bestScore ?? 0, option.score),
          bestEffectiveness: Math.max(
            previous?.bestEffectiveness ?? 0,
            option.typeMultiplier,
          ),
        };

        entries[option.moveId] = current;

        changes.push({ previous, current });
      }
    }

    writeStore({ appliedDates: [...store.appliedDates, dateKey], entries });

    return {
      applied: true,
      changes,
    };
  },
};

function emptyStore(): MoveDexStore {
  return {
    appliedDates: [],
    entries: {},
  };
}

function readStore(): MoveDexStore {
  const serialized = localStorage.getItem(storageKey);

  if (!serialized) {
    return emptyStore();
  }

  try {
    const parsed: unknown = JSON.parse(serialized);

    if (!isRecord(parsed)) {
      return emptyStore();
    }

    const rawEntries = parsed.entries;

    if (!isRecord(rawEntries)) {
      return emptyStore();
    }

    const entries = Object.fromEntries(
      Object.entries(rawEntries).filter(isMoveDexEntry),
    );

    const appliedDates = Array.isArray(parsed.appliedDates)
      ? parsed.appliedDates.filter(
          (value): value is string => typeof value === "string",
        )
      : [];

    return {
      appliedDates,
      entries,
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: MoveDexStore): void {
  localStorage.setItem(storageKey, JSON.stringify(store));
}

function isMoveDexEntry(
  entry: [string, unknown],
): entry is [string, MoveDexEntry] {
  return valueIsMoveDexEntry(entry[1]);
}

function valueIsMoveDexEntry(value: unknown): value is MoveDexEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.moveId === "string" &&
    typeof value.discoveredAt === "number" &&
    typeof value.encounters === "number" &&
    typeof value.selections === "number" &&
    typeof value.optimalAppearances === "number" &&
    typeof value.optimalSelections === "number" &&
    typeof value.judgementAttempts === "number" &&
    typeof value.correctJudgements === "number" &&
    typeof value.bestScore === "number" &&
    typeof value.bestEffectiveness === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
