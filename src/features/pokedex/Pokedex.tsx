import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Pokemon } from "../../types";
import {getPokemonSpriteUrl, pokemonData} from "../../utils";
import { TypeBadge } from "../game-shared/components/TypeBadge.tsx";
import { localPokedexRepository } from "./storage/pokedexRepository.ts";

interface PokedexProps {
	entries: readonly Pokemon[];
	onExit: () => void;
}

function Pokedex({ entries, onExit }: PokedexProps) {
	const unlockables = entries.filter((pokemon) => !pokemon.origin);
	const unlockedPokemonIds = new Set([...localPokedexRepository.findUnlockedIds()]
		.map((pid) => pokemonData.find(p => p.id === pid))
		.map(pokemon => {
			if (!pokemon?.origin) return pokemon?.id;
			return pokemonData.find(p => p.nr === pokemon.origin)?.id;
		})
		.filter(pokemon => !!pokemon));


	return (
		<Stack spacing={3}>
			<Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
				<IconButton aria-label="Return to home" onClick={onExit} edge="start">
					<ArrowBackIcon />
				</IconButton>

				<Box sx={{ flexGrow: 1 }}>
					<Typography variant="h4" component="h1">
						Pokédex
					</Typography>

					<Typography color="textSecondary">
						Complete daily challenges to discover more Pokémon.
					</Typography>
				</Box>
			</Stack>

			<Paper variant="outlined" sx={{ p: 3 }}>
				<Stack spacing={1}>
					<Stack
						direction="row"
						sx={{ justifyContent: "space-between", alignItems: "baseline" }}
					>
						<Typography variant="h6">Discovered</Typography>

						<Typography color="text.secondary">
							{unlockedPokemonIds.size} / {unlockables.length}
						</Typography>
					</Stack>

					<LinearProgress
						variant="determinate"
						value={(unlockedPokemonIds.size / unlockables.length) * 100}
						color={
							unlockedPokemonIds.size === unlockables.length
								? "success"
								: "primary"
						}
						sx={{
							height: 10,
							borderRadius: 5,
						}}
					/>
				</Stack>
			</Paper>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "repeat(2, minmax(0, 1fr))",
						sm: "repeat(3, minmax(0, 1fr))",
						md: "repeat(4, minmax(0, 1fr))",
						lg: "repeat(5, minmax(0, 1fr))",
					},
					gap: 2,
				}}
			>
				{unlockables.map((pokemon) => {
					const isUnlocked = unlockedPokemonIds.has(pokemon.id);

					return (
						<Paper
							key={pokemon.id}
							variant="outlined"
							sx={{
								p: 2,
								minHeight: 180,
								display: "flex",
								flexDirection: "column",
							}}
						>
							<Typography variant="caption" color="textSecondary">
								#{pokemon.nr.toString().padStart(4, "0")}
							</Typography>

							<Box
								sx={{
									flexGrow: 1,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									gap: 1,
								}}
							>
								{isUnlocked ? (
									<>
										<Avatar
											src={getPokemonSpriteUrl(pokemon.nr)}
											alt=""
											variant="square"
											sx={{
												width: 80,
												height: 80,
												bgcolor: "transparent",
												imageRendering: "pixelated",
											}}
										/>

										<Stack
											direction="row"
											spacing={0.5}
											useFlexGap
											sx={{
												justifyContent: "center",
												flexWrap: "wrap",
											}}
										>
											{pokemon.types.map((type) => (
												<TypeBadge key={type} type={type} size="small" />
											))}
										</Stack>
									</>
								) : (
									<>
										<LockOutlinedIcon color="disabled" fontSize="large" />
									</>
								)}
							</Box>
						</Paper>
					);
				})}
			</Box>
		</Stack>
	);
}

export default Pokedex;
