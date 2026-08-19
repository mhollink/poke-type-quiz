import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { type MoveClassifier, POKEMON_TYPES, type PokemonType } from "~/types";

import type { MoveDexStatus } from "../model/filterMoveDex.ts";

type MoveDexFiltersProps = {
  readonly status: MoveDexStatus;
  readonly type: PokemonType | "all";
  readonly classifier: MoveClassifier | "all";

  readonly onStatusChange: (status: MoveDexStatus) => void;
  readonly onTypeChange: (type: PokemonType | "all") => void;
  readonly onClassifierChange: (classifier: MoveClassifier | "all") => void;
};

export function MoveDexFilters({
  status,
  type,
  classifier,
  onStatusChange,
  onTypeChange,
  onClassifierChange,
}: MoveDexFiltersProps) {
  return (
    <Stack spacing={1.5}>
      <ToggleButtonGroup
        value={status}
        exclusive
        fullWidth
        size="small"
        aria-label="Move discovery status"
        onChange={(_, value: MoveDexStatus | null) => {
          if (value !== null) {
            onStatusChange(value);
          }
        }}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="discovered">Discovered</ToggleButton>
        <ToggleButton value="undiscovered">Undiscovered</ToggleButton>
        <ToggleButton value="mastered">Mastered</ToggleButton>
      </ToggleButtonGroup>

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
      >
        <FormControl fullWidth size="small">
          <InputLabel id="move-dex-type-filter-label">Type</InputLabel>

          <Select
            labelId="move-dex-type-filter-label"
            value={type}
            label="Type"
            onChange={(event) => {
              onTypeChange(event.target.value as PokemonType | "all");
            }}
          >
            <MenuItem value="all">All types</MenuItem>

            {POKEMON_TYPES.map((pokemonType) => (
              <MenuItem
                key={pokemonType}
                value={pokemonType}
                sx={{ textTransform: "capitalize" }}
              >
                {pokemonType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="move-dex-classifier-filter-label">
            Category
          </InputLabel>

          <Select
            labelId="move-dex-classifier-filter-label"
            value={classifier}
            label="Category"
            onChange={(event) => {
              onClassifierChange(event.target.value as MoveClassifier | "all");
            }}
          >
            <MenuItem value="all">All categories</MenuItem>

            <MenuItem value="physical">Physical</MenuItem>

            <MenuItem value="special">Special</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}
