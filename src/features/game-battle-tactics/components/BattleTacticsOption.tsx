import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { TypeBadge } from "../../game-shared/components/TypeBadge.tsx";
import type { BattleTacticsOption } from "../model/Round.ts";

type BattleTacticsOptionProps = {
  option: BattleTacticsOption;
  resolved: boolean;
  selected: boolean;
  optimal: boolean;
  onSelect: (moveId: string) => void;
};

export function BattleTacticsOptionCard({
  option,
  resolved,
  selected,
  optimal,
  onSelect,
}: BattleTacticsOptionProps) {
  const { move } = option;

  const hitLabel =
    move.minHits === move.maxHits
      ? `${move.minHits} hit`
      : `${move.minHits}-${move.maxHits} hits`;

  const color = useMemo(() => {
    if (!resolved)
      // Round is still playing, cards have default background
      return {
        borderColor: "divider",
        bgcolor: "background.paper",
      };

    if (optimal)
      // Optiomal card will always be green, regardless of selection
      return {
        borderColor: "#00FF0066",
        bgcolor: "#00FF0022",
      };

    if (selected)
      // If selection is other than optimal, tint it red.
      return {
        borderColor: "#FF000066",
        bgcolor: "#FF000022",
      };

    return {
      // Other (less important cards) can be muted.
      borderColor: "divider",
      bgcolor: "background.disabled",
      opacity: 0.7,
    };
  }, [resolved, selected, optimal]);

  return (
    <Card
      variant="outlined"
      sx={[
        {
          height: "100%",
          borderWidth: selected || optimal ? 2 : 1,
        },
        color,
      ]}
    >
      <CardActionArea
        disabled={resolved}
        onClick={() => onSelect(move.id)}
        sx={{
          height: "100%",
          p: 2,
        }}
      >
        <Stack spacing={1.5} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {move.name}
            </Typography>

            <TypeBadge type={move.type} size="small" />
          </Stack>

          {!resolved ? (
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              sx={{
                flexWrap: "wrap",
              }}
            >
              <Typography variant="caption" color="textSecondary">
                Power {move.power}
              </Typography>

              <Typography variant="caption" color="textSecondary">
                Accuracy {move.accuracy}%
              </Typography>

              <Typography variant="caption" color="textSecondary">
                {hitLabel}
              </Typography>
            </Stack>
          ) : (
            <Stack>
              <Typography variant="caption">
                {move.power} power × {option.hitCount}{" "}
                {option.hitCount === 1 ? "hit" : "hits"} ×{" "}
                {option.score.typeMultiplier} effectiveness ×{" "}
                {option.score.accuracyMultiplier} accuracy
              </Typography>

              <Stack
                direction="row"
                sx={{
                  mt: "auto",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {option.score.score.toLocaleString()} points
                </Typography>

                {selected &&
                  (optimal ? (
                    <CheckCircleRoundedIcon color="success" />
                  ) : (
                    <CancelRoundedIcon color="warning" />
                  ))}

                {!selected && optimal && (
                  <EmojiEventsRoundedIcon color="success" />
                )}
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardActionArea>
    </Card>
  );
}
