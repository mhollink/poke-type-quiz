import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {DailyMoveGameState} from "../model/dailyMoveGameReducer.ts";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {useState} from "react";
import {createDailyBattleShareText, shareGameResult, type ShareResult} from "../../../utils";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

type DailyMoveGameResultProps = {
    state: DailyMoveGameState;
    onExit: () => void;
};

export function DailyMoveGameResult({
                                        state,
                                        onExit,
                                    }: DailyMoveGameResultProps) {
    const [shareResult, setShareResult] = useState<ShareResult | null>(null);
    const percentage =
        state.challenge.maxScore === 0
            ? 0
            : Math.round((state.score / state.challenge.maxScore) * 100);


    async function handleShare(): Promise<void> {
        const text = createDailyBattleShareText({
            score: state.score,
            correctAnswers: state.optimalSelections,
            percentage: percentage,
        })

        const result = await shareGameResult(text, "PokeType Quiz: Daily Battle");

        setShareResult(result);
    }

    return (
        <Container
            component="main"
            maxWidth="sm"
            sx={{
                py: {
                    xs: 4,
                    md: 8,
                },
            }}
        >
            <Paper
                variant="outlined"
                sx={{
                    p: {
                        xs: 3,
                        sm: 5,
                    },
                }}
            >
                <Stack spacing={3} sx={{textAlign: "center"}}>
                    <Stack spacing={1}>
                        <Typography component="h1" variant="h4">
                            Daily complete
                        </Typography>

                        <Typography color="textSecondary">
                            You selected the strongest move in {state.optimalSelections} of{" "}
                            {state.challenge.rounds.length} battles.
                        </Typography>
                    </Stack>

                    <Stack>
                        <Typography variant="h3" component="p" sx={{fontWeight: 700}}>
                            {state.score.toLocaleString()}
                        </Typography>

                        <Typography color="textSecondary">
                            of {state.challenge.maxScore.toLocaleString()} points
                        </Typography>
                    </Stack>

                    <Typography variant="h6">
                        {percentage}% of the daily maximum
                    </Typography>

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


                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={1.5}
                        sx={{
                            justifyContent: "center",
                            width: "100%",
                        }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SendRoundedIcon/>}
                            onClick={handleShare}
                        >
                            Share score
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ArrowBackRoundedIcon/>}
                            onClick={onExit}
                        >
                            Back to menu
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
}
