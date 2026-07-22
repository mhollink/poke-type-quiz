import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { DailyMoveOption } from "../model/Round.ts";

type DailyMoveResultProps = {
	option: DailyMoveOption;
	roundMaximum: number;
};

export function DailyMoveResult({
	option,
	roundMaximum,
}: DailyMoveResultProps) {
	const { move, hitCount, score } = option;
	const isOptimal = score.score === roundMaximum;

	return (
		<Alert
			variant="standard"
			icon={false}
			color={isOptimal ? "success" : "warning"}
		>
			<Stack>
				<AlertTitle>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						{isOptimal
							? "Best move selected!"
							: `${move.name} wasn't the best move!`}
					</Typography>
				</AlertTitle>

				{isOptimal ? (
					<Typography variant="subtitle1">
						You earned <strong>{score.score.toLocaleString()}</strong> points.
					</Typography>
				) : (
					<Typography variant="subtitle1">
						You earned <strong>{score.score.toLocaleString()}</strong> of{" "}
						<strong>{roundMaximum.toLocaleString()}</strong> points.
					</Typography>
				)}

				<Typography variant="body2" sx={{ opacity: 0.5, mt: -0.5 }}>
					{move.power} power × {hitCount} {hitCount === 1 ? "hit" : "hits"} ×{" "}
					{score.typeMultiplier} effectiveness × {score.accuracyMultiplier}{" "}
					accuracy
				</Typography>
			</Stack>
		</Alert>
	);
}
