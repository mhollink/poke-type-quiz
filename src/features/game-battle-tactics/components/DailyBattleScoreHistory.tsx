import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { BarPlot } from "@mui/x-charts/BarChart";
import { ChartsAxisHighlight } from "@mui/x-charts/ChartsAxisHighlight";
import { ChartsContainer } from "@mui/x-charts/ChartsContainer";
import { ChartsGrid } from "@mui/x-charts/ChartsGrid";
import { ChartsTooltip } from "@mui/x-charts/ChartsTooltip";
import { ChartsXAxis } from "@mui/x-charts/ChartsXAxis";
import { ChartsYAxis } from "@mui/x-charts/ChartsYAxis";
import { LinePlot, MarkPlot } from "@mui/x-charts/LineChart";
import { useMemo } from "react";
import type { DailyBattleAttemptRecord } from "../model/Score.ts";
import { localDailyBattleRepository } from "../storage/dailyAttemptRepository.ts";

type DailyScoreDatum = {
  dateKey: string;
  score: number;
  max: number;
  remainingToMax: number;
  percentage: number | null;
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
  records: readonly DailyBattleAttemptRecord[],
  today = new Date(),
): DailyScoreDatum[] {
  const recordsByDate = new Map<string, DailyBattleAttemptRecord>();

  for (const record of records) {
    const existing = recordsByDate.get(record.dateKey);

    if (!existing) {
      recordsByDate.set(record.dateKey, record);
      continue;
    }

    const currentCompletedAt = record.completedAt ?? 0;
    const existingCompletedAt = existing.completedAt ?? 0;

    if (currentCompletedAt > existingCompletedAt) {
      recordsByDate.set(record.dateKey, record);
    }
  }

  const endDate = new Date(today);
  endDate.setHours(12, 0, 0, 0);

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (29 - index));

    const dateKey = toDateKey(date);
    const record = recordsByDate.get(dateKey);

    if (!record) {
      return {
        dateKey,
        score: 0,
        max: 0,
        remainingToMax: 0,
        percentage: null,
        attempted: false,
      };
    }

    const score = record.score;
    const max = record.maxScore;

    return {
      dateKey,
      score,
      max,
      remainingToMax: Math.max(0, max - score),
      percentage: max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0,
      attempted: true,
    };
  });
}

function DailyScoreHistory() {
  const theme = useTheme();

  const dailyAttemptRecords = useMemo(
    () => localDailyBattleRepository.findAll(),
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
            (_, index) => index % 5 === 0 || index === chartData.length - 1,
          )
          .map(({ dateKey }) => dateKey),
      ),
    [chartData],
  );

  const summary = useMemo(() => {
    const attempts = chartData.filter(
      (datum): datum is DailyScoreDatum & { percentage: number } =>
        datum.attempted && datum.percentage !== null,
    );

    if (attempts.length === 0) {
      return {
        attemptedDays: 0,
        averageScore: 0,
        averagePercentage: 0,
        highestScore: 0,
      };
    }

    return {
      attemptedDays: attempts.length,
      averageScore: Math.round(
        attempts.reduce((total, attempt) => total + attempt.score, 0) /
          attempts.length,
      ),
      averagePercentage:
        attempts.reduce((total, attempt) => total + attempt.percentage, 0) /
        attempts.length,
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
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography variant="h6">Score history</Typography>

            <Typography variant="body2" color="textSecondary">
              Your Daily scores over the last 30 days
            </Typography>
          </div>

          {summary.attemptedDays > 0 && (
            <Typography variant="body2" color="textSecondary">
              {summary.attemptedDays} played ·{" "}
              {compactScoreFormatter.format(summary.averageScore)} average
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
            Complete a Battle Tactics to start your history.
          </Typography>
        ) : (
          <ChartsContainer
            dataset={chartData}
            xAxis={[
              {
                id: "date-axis",
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
                id: "score-axis",
                min: 0,
                width: 48,
                position: "left",
                valueFormatter: (value: number) =>
                  compactScoreFormatter.format(value),
              },
              {
                id: "percentage-axis",
                min: 0,
                max: 100,
                width: 42,
                position: "right",
                valueFormatter: (value: number) => `${Math.round(value)}%`,
              },
            ]}
            series={[
              {
                id: "score",
                type: "bar",
                dataKey: "score",
                label: "Score",
                stack: "score-total",
                stackOffset: "none",
                yAxisId: "score-axis",
                color: theme.palette.primary.main,
                valueFormatter: (value, context) => {
                  const datum = chartData[context.dataIndex];

                  if (!datum?.attempted) {
                    return "No attempt";
                  }

                  return `${scoreFormatter.format(value ?? 0)} points`;
                },
              },
              {
                id: "remaining-to-max",
                type: "bar",
                dataKey: "remainingToMax",
                label: "Maximum",
                stack: "score-total",
                yAxisId: "score-axis",
                color: alpha(theme.palette.error.main, 0.35),
                valueFormatter: (_value, context) => {
                  const datum = chartData[context.dataIndex];

                  if (!datum?.attempted) {
                    return null;
                  }

                  return `${scoreFormatter.format(datum.max)} points`;
                },
              },
              {
                id: "percentage",
                type: "line",
                dataKey: "percentage",
                label: "Percentage",
                yAxisId: "percentage-axis",
                color: theme.palette.success.light,
                curve: "linear",
                connectNulls: true,
                showMark: true,
                valueFormatter: (value, context) => {
                  const datum = chartData[context.dataIndex];

                  if (!datum?.attempted || value === null) {
                    return null;
                  }

                  return `${value.toFixed(1)}%`;
                },
              },
            ]}
            height={240}
            margin={{
              top: 8,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          >
            <ChartsGrid horizontal />

            <BarPlot />

            <LinePlot />
            <MarkPlot />

            <ChartsAxisHighlight x="band" />

            <ChartsXAxis axisId="date-axis" />
            <ChartsYAxis axisId="score-axis" />
            <ChartsYAxis axisId="percentage-axis" />

            <ChartsTooltip trigger="axis" />
          </ChartsContainer>
        )}

        {summary.attemptedDays > 0 && (
          <Typography variant="body2" color="textSecondary">
            {summary.attemptedDays} played ·{" "}
            {summary.averagePercentage.toFixed(1)}% average
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default DailyScoreHistory;
