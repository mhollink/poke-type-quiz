import {GameResult} from "../../game-shared/components/GameResult";
import type {ReversedGameOverReason, ReversedGameState,} from "../model/reversedGameTypes";
import {useState} from "react";
import {createReversedChallengeShareText, shareGameResult, type ShareResult} from "../../../utils";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export interface ReversedGameResultProps {
    readonly result: Pick<
        ReversedGameState,
        "score" | "correctAnswers" | "highestMultiplier" | "canonicalOrderAnswers"
    >;
    readonly reason: ReversedGameOverReason | "already-played";
    readonly onExit: () => void;
    readonly onOpenPokedex: () => void;
}

export function ReversedGameResult({
                                       result,
                                       reason,
                                       onExit,
                                       onOpenPokedex,
                                   }: ReversedGameResultProps) {
    const [shareResult, setShareResult] = useState<ShareResult | null>(null);

    async function handleShare(): Promise<void> {
        const text = createReversedChallengeShareText({
            score: result.score,
            correctAnswers: result.correctAnswers,
            canonicalOrderAnswers: result.canonicalOrderAnswers,
            highestMultiplier: result.highestMultiplier,
        });

        const shareResult = await shareGameResult(text);
        setShareResult(shareResult);
    }

    return (
        <Stack spacing={2}>
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
                score={result.score}
                correctAnswers={result.correctAnswers}
                highestMultiplier={result.highestMultiplier}
                statistics={[
                    {
                        label: "Order bonuses",
                        value: result.canonicalOrderAnswers.toLocaleString(),
                    },
                ]}
                primaryAction={{
                    label: "Share",
                    onClick: handleShare,
                }}
                secondaryAction={{
                    label: "Exit",
                    onClick: onExit,
                }}
            />

            <Button onClick={onOpenPokedex} color="primary">
                Go to pokedex
            </Button>

        </Stack>
    );
}

function getTitle(reason: ReversedGameOverReason | "already-played"): string {
    switch (reason) {
        case "incorrect-answer":
            return "Incorrect type";

        case "time-expired":
            return "Time expired";

        case "no-challenges-left":
            return "Reversed run mastered";

        case "already-played":
            return "Today's challenge is complete";
    }
}

function getMessage(reason: ReversedGameOverReason | "already-played"): string {
    switch (reason) {
        case "incorrect-answer":
            return "The selected types did not match the displayed Pokémon.";

        case "time-expired":
            return "You did not submit the Pokémon's types before the timer expired.";

        case "no-challenges-left":
            return "You identified every available Pokémon correctly.";

        case "already-played":
            return "You have already used today's attempt. A new challenge will be available tomorrow.";
    }
}
