import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { Pokemon } from "../../../types";
import { filterPokemonByName, getPokemonSpriteUrl } from "../../../utils";

type PokemonAutocompleteProps = {
	pokemon: readonly Pokemon[];
	excludedPokemonIds: ReadonlySet<string>;
	minimumSearchLength: number;
	maximumSuggestions: number;
	disabled?: boolean;
	onSubmit: (pokemon: Pokemon) => void;
};

export function PokemonAutocomplete({
	pokemon,
	excludedPokemonIds,
	minimumSearchLength,
	maximumSuggestions,
	disabled = false,
	onSubmit,
}: PokemonAutocompleteProps) {
	const [selectedValue, setSelectedValue] = useState<Pokemon | null>(null);
	const [inputValue, setInputValue] = useState("");

	const options = pokemon.filter(
		(candidate) => !excludedPokemonIds.has(candidate.id),
	);

	return (
		<Autocomplete
			value={selectedValue}
			inputValue={inputValue}
			options={options}
			disabled={disabled}
			autoHighlight
			openOnFocus={false}
			clearOnBlur={false}
			filterOptions={(availableOptions, state) => {
				if (state.inputValue.length < minimumSearchLength) return [];

				return filterPokemonByName(
					availableOptions as Pokemon[],
					state.inputValue,
					maximumSuggestions,
				);
			}}
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

							<Typography variant="caption" color="textSecondary">
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
					placeholder={`Enter at least ${minimumSearchLength} characters`}
				/>
			)}
		/>
	);
}
