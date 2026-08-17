import { useMemo, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PokemonSprite, TypeBadge } from "~/features/game-shared";
import { usePokedex } from "~/features/pokedex/hooks/usePokedex.ts";
import {
  type PokedexFilter,
  usePokedexFilter,
} from "~/features/pokedex/hooks/usePokedexFilter.ts";
import type { Pokemon } from "~/types";

interface PokedexProps {
  entries: readonly Pokemon[];
  onExit: () => void;
}

function Pokedex({ entries, onExit }: PokedexProps) {
  const dex = usePokedex(entries);
  const filter = usePokedexFilter(dex);

  const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const [generation, setGeneration] = useState<number | "all">("all");
  const [status, setStatus] = useState<PokedexFilter["status"]>("all");

  const visibleDex = useMemo(() => {
    return filter({ generation, status });
  }, [generation, status]);

  const total = visibleDex.length;
  const unlocked = visibleDex.filter((p) => p.isUnlocked).length;
  const shinies = visibleDex.filter((p) => p.isShiny).length;

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

            <Typography color="textSecondary">
              {unlocked} / {total}
            </Typography>
          </Stack>

          <CompletionProgress
            totalPokemon={total}
            unlockedPokemon={unlocked}
            unlockedShinies={shinies}
          />
        </Stack>
      </Paper>

      <Stack spacing={1.5}>
        <ToggleButtonGroup
          value={generation}
          exclusive
          onChange={(_, value) => {
            if (value !== null) {
              setGeneration(value);
            }
          }}
          size="small"
          fullWidth
        >
          <ToggleButton value="all">All</ToggleButton>
          {generations.map((gen) => (
            <ToggleButton key={gen} value={gen}>
              {gen}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={status}
          exclusive
          fullWidth
          onChange={(_, value) => {
            if (value !== null) {
              setStatus(value);
            }
          }}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="unlocked">Unlocked</ToggleButton>
          <ToggleButton value="locked">Locked</ToggleButton>
          <ToggleButton value="shiny">Shiny</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

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
        {visibleDex.map(({ pokemon, isShiny, isUnlocked }) => {
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
              <Typography
                variant="caption"
                sx={{
                  color: isShiny ? "darkorange" : "gray",
                  textShadow: "#00000022 2px 0 10px",
                }}
              >
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
                    <PokemonSprite
                      pokemon={pokemon}
                      shiny={isShiny}
                      size="medium"
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
                  <LockOutlinedIcon color="disabled" fontSize="large" />
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Stack>
  );
}

type CompletionProgressProps = {
  unlockedPokemon: number;
  unlockedShinies: number;
  totalPokemon: number;
};

function CompletionProgress({
  unlockedPokemon,
  unlockedShinies,
  totalPokemon,
}: CompletionProgressProps) {
  const unlockedPercentage = (unlockedPokemon / totalPokemon) * 100;
  const shinyPercentage = (unlockedShinies / totalPokemon) * 100;

  return (
    <Box
      sx={{
        position: "relative",
        height: 16,
      }}
    >
      <LinearProgress
        variant="determinate"
        value={unlockedPercentage}
        color={unlockedPokemon === totalPokemon ? "success" : "primary"}
        sx={{
          height: 16,
          borderRadius: 5,
        }}
      />

      <LinearProgress
        variant="determinate"
        value={shinyPercentage}
        color="warning"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 16,
          borderRadius: 2,
          backgroundColor: "transparent",

          "& .MuiLinearProgress-bar": {
            borderRadius: 2,
            background:
              "linear-gradient(90deg, #b8860b 0%, #ffd700 35%, #fff1a8 50%, #ffd700 65%, #b8860b 100%)",
          },
        }}
      />
    </Box>
  );
}

export default Pokedex;
