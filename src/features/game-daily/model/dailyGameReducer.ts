import {dailyGameConfig} from "../dailyGameConfig.ts";
import type {CompletedDailyAnswer, DailyChallenge, DailyGameOverReason, DailyGameState,} from "./dailyGameTypes";
import {createTypeKey} from "../challenge/createDailyChallenge.ts";

export type DailyGameAction =
    | {
    readonly type: "START_GAME";
    readonly dateKey: string;
    readonly challenge: DailyChallenge;
    readonly startedAt: number;
    readonly runEndsAt: number;
}
    | {
    readonly type: "CORRECT_ANSWER";
    readonly answer: CompletedDailyAnswer;
    readonly nextChallenge: DailyChallenge | null;
}
    | {
    readonly type: "INCORRECT_ANSWER";
}
    | {
    readonly type: "SKIP_ROUND";
    readonly skippedRound: DailyChallenge | null;
    readonly nextChallenge: DailyChallenge | null;
}
    | {
    readonly type: "END_GAME";
    readonly reason: DailyGameOverReason;
};

export function createInitialDailyGameState(): DailyGameState {
    return {
        dateKey: "",
        status: "playing",
        score: 0,
        correctAnswers: 0,
        skippedRounds: 0,
        mistakes: 0,
        streak: 0,
        highestStreak: 0,
        currentChallenge: null,
        startedAt: null,
        runEndsAt: null,
        skippedTypes: new Set(),
        usedPokemonIds: new Set(),
        completedAnswers: [],
        lastScore: null,
        gameOverReason: null,
    };
}

export function dailyGameReducer(
    state: DailyGameState,
    action: DailyGameAction,
): DailyGameState {
    switch (action.type) {
        case "START_GAME":
            return {
                ...createInitialDailyGameState(),
                dateKey: action.dateKey,
                currentChallenge: action.challenge,
                startedAt: action.startedAt,
                runEndsAt: action.runEndsAt,
            };

        case "CORRECT_ANSWER": {
            const usedPokemonIds = new Set(state.usedPokemonIds);
            usedPokemonIds.add(action.answer.pokemon.id);

            const nextStreak = state.streak + 1;
            const nextEndTime = Math.min(
                (state.runEndsAt ?? Date.now()) + 10 * 1000,
                Date.now() + dailyGameConfig.durationMs - 1000,
            );

            return {
                ...state,
                score: state.score + action.answer.score.totalPoints,
                correctAnswers: state.correctAnswers + 1,
                streak: nextStreak,
                highestStreak: Math.max(state.highestStreak, nextStreak),
                currentChallenge: action.nextChallenge,
                usedPokemonIds,
                completedAnswers: [...state.completedAnswers, action.answer],
                lastScore: action.answer.score,
                runEndsAt: nextEndTime,
            };
        }
        case "SKIP_ROUND": {
            const skippedTypes = new Set(state.skippedTypes);
            if (action.skippedRound) {
                skippedTypes.add(createTypeKey(action.skippedRound.types));
            }

            const nextEndTime = (state.runEndsAt ?? Date.now()) - 30 * 1000;
            return {
                ...state,
                streak: 0,
                skippedRounds: state.skippedRounds + 1,
                skippedTypes: skippedTypes,
                currentChallenge: action.nextChallenge,
                runEndsAt: nextEndTime,
            };
        }

        case "INCORRECT_ANSWER": {
            const nextEndTime = (state.runEndsAt ?? Date.now()) - 15 * 1000;
            return {
                ...state,
                mistakes: state.mistakes + 1,
                streak: 0,
                lastScore: null,
                runEndsAt: nextEndTime,
            };
        }

        case "END_GAME":
            return {
                ...state,
                status: "game-over",
                runEndsAt: null,
                gameOverReason: action.reason,
            };
    }
}
