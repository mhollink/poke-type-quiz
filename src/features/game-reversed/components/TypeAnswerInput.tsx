import type { FilterOptionsState } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
	type KeyboardEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { levenshteinDistance, normalizeSearchValue } from "../../../utils";
import { TypeBadge } from "../../game-shared/components/TypeBadge";
import type { PokemonType } from "../model/reversedGameTypes";

export interface TypeAnswerInputProps {
	readonly challengeId: string;
	readonly availableTypes: readonly PokemonType[];
	readonly requiredTypeCount: number;
	readonly disabled?: boolean;
	readonly onSubmit: (types: readonly PokemonType[]) => void;
}

const minimumSearchLength = 2;
const maximumSuggestions = 3;

function filterTypeOptions(
	options: readonly PokemonType[],
	state: FilterOptionsState<PokemonType>,
): PokemonType[] {
	const normalizedInput = normalizeSearchValue(state.inputValue);

	if (normalizedInput.length < minimumSearchLength) {
		return [];
	}

	return options
		.map((type) => {
			const normalizedType = normalizeSearchValue(type);

			return {
				type,
				startsWithInput: normalizedType.startsWith(normalizedInput),
				containsInput: normalizedType.includes(normalizedInput),
				distance: levenshteinDistance(normalizedInput, normalizedType),
			};
		})
		.sort((left, right) => {
			if (left.startsWithInput !== right.startsWithInput) {
				return left.startsWithInput ? -1 : 1;
			}

			if (left.containsInput !== right.containsInput) {
				return left.containsInput ? -1 : 1;
			}

			if (left.distance !== right.distance) {
				return left.distance - right.distance;
			}

			return left.type.localeCompare(right.type);
		})
		.slice(0, maximumSuggestions)
		.map((candidate) => candidate.type);
}

export function TypeAnswerInput({
	challengeId,
	availableTypes,
	requiredTypeCount,
	disabled = false,
	onSubmit,
}: TypeAnswerInputProps) {
	const [selectedTypes, setSelectedTypes] = useState<readonly PokemonType[]>(
		[],
	);
	const [inputValue, setInputValue] = useState("");

	const inputRef = useRef<HTMLInputElement>(null);

	const remainingTypes = useMemo(
		() => availableTypes.filter((type) => !selectedTypes.includes(type)),
		[availableTypes, selectedTypes],
	);

	useEffect(() => {
		setSelectedTypes([]);
		setInputValue("");

		focusInput();
	}, [challengeId]);

	function focusInput(): void {
		requestAnimationFrame(() => {
			inputRef.current?.focus();
		});
	}

	function handleTypeSelected(type: PokemonType | null): void {
		if (type === null || disabled || selectedTypes.includes(type)) {
			return;
		}

		const nextSelectedTypes = [...selectedTypes, type];

		setSelectedTypes(nextSelectedTypes);
		setInputValue("");

		if (nextSelectedTypes.length === requiredTypeCount) {
			onSubmit(nextSelectedTypes);
			return;
		}

		focusInput();
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
		if (
			event.key === "Backspace" &&
			inputValue.length === 0 &&
			selectedTypes.length > 0
		) {
			event.preventDefault();

			setSelectedTypes((currentTypes) => currentTypes.slice(0, -1));

			focusInput();
		}
	}

	return (
		<Stack spacing={3}>
			<AnswerSlots
				selectedTypes={selectedTypes}
				requiredTypeCount={requiredTypeCount}
			/>

			<Autocomplete
				value={null}
				inputValue={inputValue}
				options={remainingTypes}
				filterOptions={filterTypeOptions}
				disabled={disabled}
				autoHighlight
				autoSelect
				openOnFocus={false}
				clearOnBlur={false}
				clearOnEscape
				disablePortal
				noOptionsText={
					normalizeSearchValue(inputValue).length < minimumSearchLength
						? "Type at least 2 letters"
						: "No matching types"
				}
				getOptionLabel={formatType}
				isOptionEqualToValue={(option, value) => option === value}
				onInputChange={(_event, nextValue, reason) => {
					if (reason !== "reset") {
						setInputValue(nextValue);
					}
				}}
				onChange={(_event, value) => {
					handleTypeSelected(value);
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						inputRef={inputRef}
						label={getInputLabel(selectedTypes.length, requiredTypeCount)}
						placeholder="Start typing a type"
						onKeyDown={handleKeyDown}
						slotProps={{
							...params.slotProps,
							htmlInput: {
								...params.slotProps.htmlInput,
								autoComplete: "off",
							},
						}}
					/>
				)}
			/>

			<Typography
				variant="caption"
				color="textSecondary"
				sx={{
					textAlign: "center",
				}}
			>
				{getKeyboardHint(selectedTypes.length, requiredTypeCount)}
			</Typography>
		</Stack>
	);
}

interface AnswerSlotsProps {
	readonly selectedTypes: readonly PokemonType[];
	readonly requiredTypeCount: number;
}

function AnswerSlots({ selectedTypes, requiredTypeCount }: AnswerSlotsProps) {
	return (
		<Stack
			spacing={1}
			sx={{
				alignItems: "center",
				minHeight: 40,
			}}
		>
			<Stack direction="row" spacing={1}>
				{Array.from({ length: requiredTypeCount }, (_, index) => {
					const selectedType = selectedTypes[index];

					return selectedType ? (
						<TypeBadge key={`${index}-${selectedType}`} type={selectedType} />
					) : (
						<TypeBadge
							key={`empty-${index}`}
							placeholder={`Type ${index + 1}`}
						/>
					);
				})}
			</Stack>

			{requiredTypeCount === 2 && (
				<Typography variant="caption" color="text.secondary">
					Selecting both types in canonical order earns a bonus.
				</Typography>
			)}
		</Stack>
	);
}

function getInputLabel(selectedCount: number, requiredCount: number): string {
	if (requiredCount === 1) {
		return "Pokémon type";
	}

	return selectedCount === 0 ? "Primary type" : "Secondary type";
}

function getKeyboardHint(selectedCount: number, requiredCount: number): string {
	if (selectedCount === 0) {
		return requiredCount === 1
			? "Type a Pokémon type and press Enter to submit."
			: "Type the primary type and press Enter.";
	}

	return "Type the secondary type and press Enter to submit. Backspace removes the previous type.";
}

function formatType(type: PokemonType): string {
	return type
		.replaceAll("-", " ")
		.replace(/\b\w/g, (character) => character.toUpperCase());
}
