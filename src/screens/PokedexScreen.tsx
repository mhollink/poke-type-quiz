import { CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { lazy, Suspense } from "react";
import { pokemonData } from "../utils";

const Pokedex = lazy(() => import("../features/pokedex/Pokedex"));

export interface PokedexScreenProps {
	onExit: () => void;
}

export function PokedexScreen({ onExit }: PokedexScreenProps) {
	return (
		<Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
			<Suspense fallback={<ScreenLoader />}>
				<Pokedex entries={pokemonData} onExit={onExit} />
			</Suspense>
		</Container>
	);
}

function ScreenLoader() {
	return (
		<Box
			sx={{
				minHeight: "100dvh",
				display: "grid",
				placeItems: "center",
			}}
		>
			<CircularProgress />
		</Box>
	);
}
