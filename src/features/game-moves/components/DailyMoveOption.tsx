import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TypeBadge } from "../../game-shared/components/TypeBadge.tsx";
import type { DailyMoveOption } from "../model/Round.ts";

type DailyMoveOptionProps = {
	option: DailyMoveOption;
	resolved: boolean;
	selected: boolean;
	optimal: boolean;
	onSelect: (moveId: string) => void;
};

export function DailyMoveOptionCard({
	option,
	resolved,
	selected,
	optimal,
	onSelect,
}: DailyMoveOptionProps) {
	const { move } = option;

	const hitLabel =
		move.minHits === move.maxHits
			? `${move.minHits} hit`
			: `${move.minHits}-${move.maxHits} hits`;

	return (
		<Card
			variant="outlined"
			sx={{
				height: "100%",
				borderWidth: selected || optimal ? 2 : 1,
				borderColor: selected
					? "primary.main"
					: optimal
						? "success.main"
						: "divider",
			}}
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

					<Stack
						direction="row"
						spacing={1}
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

					{resolved && (
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

							{selected && <CheckCircleRoundedIcon color="primary" />}

							{!selected && optimal && (
								<EmojiEventsRoundedIcon color="success" />
							)}
						</Stack>
					)}
				</Stack>
			</CardActionArea>
		</Card>
	);
}
