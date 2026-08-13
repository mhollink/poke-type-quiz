import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {lazy, Suspense, useMemo, useState} from "react";
import {createTypeSurvivalChallengeShareText, shareGameResult, type ShareResult,} from "../../../utils";
import {GameResult} from "../../game-shared/components/GameResult.tsx";
import type {TypeSurvivalGameState} from "../model/typeSurvivalGameTypes.ts";
import {localDailyAttemptRepository} from "../storage/typeSurvivalAttemptRepository.ts";
import {usePokemonData} from "../../../hooks/usePokemonData.ts";
import type {Pokemon, PokemonType} from "../../../types";
import {shuffle} from "../../../utils/shuffle.ts";
import Paper from "@mui/material/Paper";
import {PotentialValidOptions} from "../../game-shared/components/PotentialValidAnswers.tsx";

const DailyScoreHistory = lazy(
    () => import("../../game-shared/components/DailyScoreHistory"),
);

export interface TypeSurvivalGameResultProps {
    readonly result: Pick<
        TypeSurvivalGameState,
        "score" | "correctAnswers" | "highestMultiplier"
    >;
    readonly reason:
        | "incorrect-answer"
        | "time-expired"
        | "no-challenges-left"
        | "already-played";
    readonly onExit: () => void;
    readonly onOpenPokedex: () => void;

    readonly incorrectType?: PokemonType
    readonly usedPokemonIds?: ReadonlySet<string>

}

export function TypeSurvivalGameResult({
                                           result,
                                           reason,
                                           onExit,
                                           onOpenPokedex,
                                           incorrectType,
                                           usedPokemonIds

                                       }: TypeSurvivalGameResultProps) {
    const dailyAttemptRecords = useMemo(() => localDailyAttemptRepository.findAll(), []);

    const [shareResult, setShareResult] = useState<ShareResult | null>(null);

    async function handleShare(): Promise<void> {
        const text = createTypeSurvivalChallengeShareText({
            score: result.score,
            correctAnswers: result.correctAnswers,
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
                title="Type Survival complete"
                score={result.score}
                correctAnswers={result.correctAnswers}
                highestMultiplier={result.highestMultiplier}
                message={getGameOverMessage(reason)}
                primaryAction={{
                    label: "Share",
                    onClick: handleShare,
                }}
                secondaryAction={{
                    label: "Exit",
                    onClick: onExit,
                }}
            />

            {incorrectType && usedPokemonIds  && (
                <MissedRoundFeedback usedPokemonIds={usedPokemonIds}
                                     incorrectType={incorrectType}/>
            )}

            <Button onClick={onOpenPokedex} color="primary">
                Go to pokedex
            </Button>

            <Suspense
                fallback={<Skeleton variant="rounded" animation="wave" height={260}/>}
            >
                <DailyScoreHistory dailyAttemptRecords={dailyAttemptRecords}/>
            </Suspense>
        </Stack>
    );
}

function getGameOverMessage(
    reason:
        | "incorrect-answer"
        | "time-expired"
        | "no-challenges-left"
        | "already-played",
): string {
    switch (reason) {
        case "incorrect-answer":
            return "That Pokémon does not match the requested type.";

        case "time-expired":
            return "You ran out of time.";

        case "no-challenges-left":
            return "You completed every available challenge.";

        case "already-played":
            return "You have already used today's attempt. A new challenge will be available tomorrow.";
    }
}

function MissedRoundFeedback({
                                 incorrectType,
                                 usedPokemonIds
                             }: Required<Pick<TypeSurvivalGameResultProps,  'incorrectType' | 'usedPokemonIds'>>) {

    const {availablePokemon} = usePokemonData();

    const hints: Pokemon[] = useMemo(() => {
        const unusedPokemon = availablePokemon.filter(candidate => !usedPokemonIds.has(candidate.id));
        const withRequestedType = unusedPokemon.filter(candidate => candidate.types.includes(incorrectType))
        const shuffled = shuffle(withRequestedType);

        return shuffled.slice(0, 5).sort((a, b) => a.nr - b.nr);
    }, [usedPokemonIds, incorrectType, availablePokemon])

    return (
        <Paper variant="outlined" sx={{p: {xs: 3, sm: 5,},}}>
            <PotentialValidOptions potentialAnswers={hints}/>
        </Paper>
    );
}
