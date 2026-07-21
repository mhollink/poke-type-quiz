import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import { useMemo } from "react";
import { localDailyAttemptRepository } from "../storage/dailyAttemptRepository.ts";
import type {DailyAttemptRecord} from "../model/dailyGameTypes.ts";

type DailyScoreDatum = {
    dateKey: string;
    score: number;
    attempted: boolean;
};

const scoreFormatter = new Intl.NumberFormat();
const compactScoreFormatter = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
});

const longDateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "long",
});

function toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string): Date {
    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day);
}

export function buildLast30DaysScoreData(
    records: readonly DailyAttemptRecord[],
    today = new Date(),
): DailyScoreDatum[] {
    /*
     * Normally there should only be one attempt per date.
     * Keeping the latest completed record makes this resilient to duplicates.
     */
    const recordsByDate = new Map<string, DailyAttemptRecord>();

    for (const record of records) {
        const existing = recordsByDate.get(record.dateKey);

        if (!existing) {
            recordsByDate.set(record.dateKey, record);
        } else {
            const a = record.completedAt ?? 0;
            const b = existing.completedAt ?? 0;
            if (a > b) {
                recordsByDate.set(record.dateKey, record);
            }
        }
    }

    const endDate = new Date(today);
    endDate.setHours(12, 0, 0, 0);

    return Array.from({ length: 30 }, (_, index) => {
        const date = new Date(endDate);

        // index 0 is 29 days ago; index 29 is today.
        date.setDate(endDate.getDate() - (29 - index));

        const dateKey = toDateKey(date);
        const record = recordsByDate.get(dateKey);

        return {
            dateKey,
            score: record?.score ?? 0,
            attempted: record !== undefined,
        };
    });
}

export function DailyScoreHistory() {
    const theme = useTheme();

    const dailyAttemptRecords = useMemo(
        () => localDailyAttemptRepository.findAll(),
        [],
    );

    const chartData = useMemo(
        () => buildLast30DaysScoreData(dailyAttemptRecords),
        [dailyAttemptRecords],
    );

    const visibleTickDateKeys = useMemo(
        () =>
            new Set(
                chartData
                    .filter(
                        (_, index) =>
                            index % 5 === 0 ||
                            index === chartData.length - 1,
                    )
                    .map(({ dateKey }) => dateKey),
            ),
        [chartData],
    );

    const summary = useMemo(() => {
        const attempts = chartData.filter(({ attempted }) => attempted);

        if (attempts.length === 0) {
            return {
                attemptedDays: 0,
                averageScore: 0,
                highestScore: 0,
            };
        }

        return {
            attemptedDays: attempts.length,
            averageScore: Math.round(
                attempts.reduce((total, attempt) => total + attempt.score, 0) /
                attempts.length,
            ),
            highestScore: Math.max(...attempts.map(({ score }) => score)),
        };
    }, [chartData]);

    return (
        <Paper
            variant="outlined"
            sx={{
                p: {
                    xs: 2,
                    sm: 3,
                },
            }}
        >
            <Stack spacing={2}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={0.5}
                    sx={{
                        justifyContent: "space-between"
                    }}
                >
                    <div>
                        <Typography variant="h6">
                            Score history
                        </Typography>

                        <Typography
                            variant="body2"
                            color="textSecondary"
                        >
                            Your Daily scores over the last 30 days
                        </Typography>
                    </div>

                    {summary.attemptedDays > 0 && (
                        <Typography
                            variant="body2"
                            color="textSecondary"
                        >
                            {summary.attemptedDays} played ·{" "}
                            {compactScoreFormatter.format(
                                summary.averageScore,
                            )}{" "}
                            average
                        </Typography>
                    )}
                </Stack>

                {summary.attemptedDays === 0 ? (
                    <Typography
                        color="textSecondary"
                        sx={{
                            py: 6,
                            textAlign: "center",
                        }}
                    >
                        Complete a Daily challenge to start your history.
                    </Typography>
                ) : (
                    <BarChart
                        dataset={chartData}
                        xAxis={[
                            {
                                scaleType: "band",
                                dataKey: "dateKey",
                                height: 32,
                                valueFormatter: (dateKey, context) => {
                                    const date = parseDateKey(dateKey);

                                    if (context.location === "tooltip") {
                                        return longDateFormatter.format(date);
                                    }

                                    return visibleTickDateKeys.has(dateKey)
                                        ? shortDateFormatter.format(date)
                                        : "";
                                },
                            },
                        ]}
                        yAxis={[
                            {
                                min: 0,
                                width: 48,
                                valueFormatter: (value: number) =>
                                    compactScoreFormatter.format(value),
                            },
                        ]}
                        series={[
                            {
                                dataKey: "score",
                                label: "Score",
                                valueFormatter: (value, context) => {
                                    const datum =
                                        chartData[context.dataIndex];

                                    if (!datum?.attempted) {
                                        return "No attempt";
                                    }

                                    return `${scoreFormatter.format(value ?? 0)} points`;
                                },
                            },
                        ]}
                        colors={[theme.palette.primary.main]}
                        height={220}
                        borderRadius={4}
                        grid={{ horizontal: true }}
                        hideLegend
                        margin={{
                            top: 8,
                            right: 8,
                            bottom: 0,
                            left: 0,
                        }}
                        slotProps={{
                            tooltip: {
                                trigger: "axis",
                            },
                        }}
                    />
                )}

                {summary.attemptedDays > 0 && (
                    <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{
                            textAlign: "right"
                        }}
                    >
                        Best:{" "}
                        {scoreFormatter.format(summary.highestScore)} points
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
}