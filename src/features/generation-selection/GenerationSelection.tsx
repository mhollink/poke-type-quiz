import { Tooltip } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { blue } from "@mui/material/colors";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { getPokemonSpriteUrl } from "../../utils";
import { localGenerationSelectionRepository } from "./storage/localGenerationSelectionRepository.ts";

const GENERATIONS = [
  { gen: 1, avatar: 1 },
  { gen: 2, avatar: 152 },
  { gen: 3, avatar: 252 },
  { gen: 4, avatar: 387 },
  { gen: 5, avatar: 495 },
  { gen: 6, avatar: 650 },
  { gen: 7, avatar: 722 },
  { gen: 8, avatar: 810 },
  { gen: 9, avatar: 906 },
];

type GenerationOption = {
  gen: number;
  avatar: number;
  enabled: boolean;
};

export function GenerationSelection() {
  const [generations, setGenerations] = useState<GenerationOption[]>(() => {
    const enabledGens =
      localGenerationSelectionRepository.findEnabledGenerations();

    return GENERATIONS.map((generation) => ({
      ...generation,
      enabled: enabledGens.has(generation.gen),
    }));
  });

  function toggleGeneration(gen: number, value: boolean) {
    setGenerations((current) => updateGenerationSelection(current, gen, value));
  }

  useEffect(() => {
    const enabledGens = generations
      .filter((generation) => generation.enabled)
      .map((generation) => generation.gen);

    localGenerationSelectionRepository.store(enabledGens);
  }, [generations]);

  function updateGenerationSelection(
    current: readonly GenerationOption[],
    gen: number,
    value: boolean,
  ): GenerationOption[] {
    const updated = current.map((candidate) =>
      candidate.gen === gen ? { ...candidate, enabled: value } : candidate,
    );

    if (updated.some((candidate) => candidate.enabled)) {
      return updated;
    }

    const alternatives = updated.filter((candidate) => candidate.gen !== gen);

    if (alternatives.length === 0) {
      return current.map((candidate) => ({
        ...candidate,
        enabled: true,
      }));
    }

    const randomAlternative =
      alternatives[Math.floor(Math.random() * alternatives.length)];

    return updated.map((candidate) =>
      candidate.gen === randomAlternative.gen
        ? { ...candidate, enabled: true }
        : candidate,
    );
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ justifyContent: "center", flexWrap: "wrap" }}
      tabIndex={0}
    >
      {generations.map((gen) => (
        <GenSelector
          key={gen.gen}
          gen={gen.gen}
          dexNr={gen.avatar}
          enabled={gen.enabled}
          setEnabled={(value) => toggleGeneration(gen.gen, value)}
        />
      ))}
    </Stack>
  );
}

interface GenSelectorProps {
  gen: number;
  dexNr: number;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}

function GenSelector({ gen, dexNr, enabled, setEnabled }: GenSelectorProps) {
  const sprite = getPokemonSpriteUrl(dexNr);
  return (
    <Tooltip title={`Enable or disable Generation ${gen}`}>
      <Avatar
        sx={{
          width: 56,
          height: 56,
          filter: enabled ? "" : "opacity(0.8) grayscale(1)",
          bgcolor: blue[200],
          border: 1,
          color: blue[400],
          "& .MuiAvatar-img": {
            scale: 1.5,
          },
          cursor: "pointer",
          "&:focus-visible": {
            outline: (theme) => `3px solid ${theme.palette.primary.main}`,
            outlineOffset: 3,
          },
        }}
        alt={`Gen ${gen}. ${enabled ? "Enabled" : "Disabled"}`}
        src={sprite}
        onClick={() => setEnabled(!enabled)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setEnabled(!enabled);
          }
        }}
        tabIndex={0}
      >
        {gen}
      </Avatar>
    </Tooltip>
  );
}
