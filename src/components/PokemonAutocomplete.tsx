import {
	Autocomplete,
	Avatar,
	Box,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import type { Pokemon } from "../types/pokemon";
import { filterPokemonByName } from "../utils/pokemonSearch";
import { getPokemonSpriteUrl } from "../utils/sprite";

type PokemonAutocompleteProps = {
	pokemon: readonly Pokemon[];
	disabled?: boolean;
	onSubmit: (pokemon: Pokemon) => void;
};

export function PokemonAutocomplete({
	pokemon,
	disabled = false,
	onSubmit,
}: PokemonAutocompleteProps) {
	const [selectedValue, setSelectedValue] = useState<Pokemon | null>(null);
	const [inputValue, setInputValue] = useState("");

	return (
		<Autocomplete
			value={selectedValue}
			inputValue={inputValue}
			options={pokemon}
			disabled={disabled}
			autoHighlight
			openOnFocus={false}
			clearOnBlur={false}
			filterOptions={(availableOptions, state) =>
				filterPokemonByName(availableOptions as Pokemon[], state.inputValue, 5)
			}
			getOptionLabel={(option) => option.name}
			isOptionEqualToValue={(option, value) => option.id === value.id}
			onInputChange={(_, nextInputValue, reason) => {
				if (reason !== "reset") {
					setInputValue(nextInputValue);
				}
			}}
			onChange={(_, nextValue) => {
				if (!nextValue) {
					return;
				}

				onSubmit(nextValue);
				setSelectedValue(null);
				setInputValue("");
			}}
			renderOption={(props, option) => {
				const { key, ...optionProps } = props;

				return (
					<Box
						component="li"
						key={key}
						{...optionProps}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1.5,
							py: 1,
						}}
					>
						<Avatar
							src={getPokemonSpriteUrl(option.nr)}
							alt=""
							variant="square"
							sx={{
								width: 48,
								height: 48,
								bgcolor: "transparent",
								imageRendering: "pixelated",
							}}
						/>

						<Stack
							direction="row"
							sx={{
								flex: 1,
								minWidth: 0,
								justifyContent: "space-between",
								alignItems: "baseline",
							}}
						>
							<Typography
								sx={{
									fontWeight: 600,
									textTransform: "capitalize",
								}}
							>
								{option.name}
							</Typography>

							<Typography variant="caption" color="text.secondary">
								#{String(option.nr).padStart(4, "0")}
							</Typography>
						</Stack>
					</Box>
				);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					autoFocus
					label="Pokémon"
					placeholder={`Type to search the Pokedex`}
				/>
			)}
		/>
	);
}
