import { Alert, Avatar, Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import type { GameOverReason, Pokemon } from "../types";
import type { ShareResult } from "../utils";
import { getPokemonSpriteUrl, shareGameResult } from "../utils";

type GameOverProps = {
	score: number;
	correctAnswers: number;
	highestMultiplier: number;
	reason: GameOverReason;
	dailyBestScore: number;
	potentialAnswers: readonly Pokemon[];
	onPlayAgain: () => void;
};

export function GameOver({
	score,
	correctAnswers,
	highestMultiplier,
	reason,
	dailyBestScore,
	potentialAnswers,
	onPlayAgain,
}: GameOverProps) {
	const [shareResult, setShareResult] = useState<ShareResult | null>(null);

	async function handleShare(): Promise<void> {
		const result = await shareGameResult({
			score,
			correctAnswers,
			highestMultiplier,
		});

		setShareResult(result);
	}

	return (
		<Paper variant="outlined" sx={{ p: 4 }}>
			<Stack spacing={3} sx={{ textAlign: "center" }}>
				<div>
					<Typography
						component="h2"
						variant="h4"
						sx={{ fontWeight: 800, textAlign: "center" }}
					>
						Game over
					</Typography>

					<Typography color="text.secondary" sx={{ textAlign: "center" }}>
						{getGameOverMessage(reason)}
					</Typography>
				</div>

				<div>
					<Typography
						variant="h2"
						sx={{ fontWeight: 800, textAlign: "center" }}
					>
						{score.toLocaleString()}
					</Typography>

					<Typography color="text.secondary" sx={{ textAlign: "center" }}>
						points
					</Typography>
				</div>

				<Stack
					direction="row"
					spacing={4}
					sx={{ justifyContent: "space-between" }}
				>
					<ResultValue label="Correct" value={String(correctAnswers)} />

					<ResultValue
						label="Highest multiplier"
						value={`×${highestMultiplier.toFixed(2)}`}
					/>

					<ResultValue
						label="Today's best"
						value={dailyBestScore.toLocaleString()}
					/>
				</Stack>

				<PotentialValidOptions potentialAnswers={potentialAnswers} />

				{shareResult === "copied" && (
					<Alert severity="success">Result copied to your clipboard.</Alert>
				)}

				<Stack direction="row" spacing={2}>
					<Button variant="contained" onClick={onPlayAgain}>
						Play again
					</Button>

					<Button variant="outlined" onClick={handleShare}>
						Share result
					</Button>
				</Stack>
			</Stack>
		</Paper>
	);
}

function PotentialValidOptions({
	potentialAnswers,
}: {
	potentialAnswers: readonly Pokemon[];
}) {
	return potentialAnswers.length === 0 ? null : (
		<Stack spacing={1.5} sx={{ width: "100%" }}>
			<Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }}>
				Possible answers
			</Typography>

			<Stack spacing={1}>
				{potentialAnswers.map((pokemon) => (
					<Stack
						key={pokemon.id}
						direction="row"
						spacing={1.5}
						sx={{
							border: 1,
							borderColor: "divider",
							borderRadius: 1,
							px: 1.5,
							py: 0.75,
							alignItems: "center",
						}}
					>
						<Avatar
							src={getPokemonSpriteUrl(pokemon.nr)}
							alt=""
							variant="square"
							sx={{
								width: 40,
								height: 40,
								bgcolor: "transparent",
								imageRendering: "pixelated",
							}}
						/>

						<Typography
							sx={{
								flex: 1,
								fontWeight: 600,
							}}
						>
							{pokemon.name}
						</Typography>

						<Typography variant="caption" color="text.secondary">
							#{String(pokemon.nr).padStart(4, "0")}
						</Typography>
					</Stack>
				))}
			</Stack>
		</Stack>
	);
}

type ResultValueProps = {
	label: string;
	value: string;
};

function ResultValue({ label, value }: ResultValueProps) {
	return (
		<Stack sx={{ alignItems: "center" }}>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>

			<Typography variant="h6" sx={{ fontWeight: 700 }}>
				{value}
			</Typography>
		</Stack>
	);
}

function getGameOverMessage(reason: GameOverReason): string {
	switch (reason) {
		case "incorrect-answer":
			return "That Pokémon did not match the requested type.";

		case "time-expired":
			return "You ran out of time.";

		case "no-challenges-left":
			return "You completed every available challenge.";
	}
}
