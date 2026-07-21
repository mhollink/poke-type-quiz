import {GameResult} from "../../game-shared/components/GameResult";
import {dailyGameConfig} from "../dailyGameConfig";
import type {DailyAttemptRecord, DailyGameOverReason,} from "../model/dailyGameTypes";
import {shareGameResult, type ShareResult} from "../../../utils";
import {useState} from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

export interface DailyGameResultProps {
    readonly attempt: Pick<
        DailyAttemptRecord,
        "score" | "correctAnswers" | "mistakes" | "highestStreak"
    >;
    readonly reason: DailyGameOverReason | "already-played";
    readonly onExit: () => void;
}

export function DailyGameResult({
                                    attempt,
                                    reason,
                                    onExit,
                                }: DailyGameResultProps) {
    const [shareResult, setShareResult] = useState<ShareResult | null>(null);

    async function handleShare(): Promise<void> {
        const result = await       shareGameResult({
            score: attempt.score,
            correctAnswers: attempt.correctAnswers,
            highestMultiplier: attempt.highestStreak,
        });

        setShareResult(result);
    }

    return (
        <>
            <Snackbar
                open={shareResult === "copied"}
                autoHideDuration={5_000}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    severity="success"
                    variant="standard"
                    sx={{
                        width: "100%",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="body2" color="textSecondary">
                        Result copied to your clipboard.
                    </Typography>
                </Alert>
            </Snackbar>

            <GameResult
                title={getTitle(reason)}
                message={getMessage(reason)}
                score={attempt.score}
                correctAnswers={attempt.correctAnswers}
                highestMultiplier={calculateHighestMultiplier(attempt.highestStreak)}
                statistics={[
                    {
                        label: "Best streak",
                        value: attempt.highestStreak.toLocaleString(),
                    },
                ]}
                primaryAction={{
                    label: "Share",
                    onClick: handleShare
                }}
                secondaryAction={{
                    label: "Exit",
                    onClick: onExit,
                }}
            />
        </>
    );
}

function getTitle(reason: DailyGameOverReason | "already-played"): string {
    switch (reason) {
        case "time-expired":
            return "Daily challenge complete";

        case "no-challenges-left":
            return "Daily challenge mastered";

        case "already-played":
            return "Today's challenge is complete";
    }
}

function getMessage(reason: DailyGameOverReason | "already-played"): string {
    switch (reason) {
        case "time-expired":
            return "Time is up. Your score has been saved for today.";

        case "no-challenges-left":
            return "You completed every available challenge for today.";

        case "already-played":
            return "You have already used today's attempt. A new challenge will be available tomorrow.";
    }
}

function calculateHighestMultiplier(highestStreak: number): number {
    return Math.min(
        dailyGameConfig.maximumStreakMultiplier,
        1 + highestStreak * dailyGameConfig.streakMultiplierStep,
    );
}
