import { useMemo } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Badge } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TypeBadge } from "~/features/game-shared";
import type { Pokemon } from "~/types";
import { getPokemonSpriteUrl, pokemonData } from "~/utils";

import { localPokedexRepository } from "./storage/pokedexRepository.ts";

interface PokedexProps {
  entries: readonly Pokemon[];
  onExit: () => void;
}

function Pokedex({ entries, onExit }: PokedexProps) {
  const unlockables = useMemo(
    () => entries.filter((pokemon) => !pokemon.origin),
    [entries],
  );

  const unlockedPokemonIds = useMemo(
    () =>
      new Set(
        [...localPokedexRepository.findUnlockedIds()]
          .map((pid) => pokemonData.find((p) => p.id === pid))
          .map((pokemon) => {
            if (!pokemon?.origin) return pokemon?.id;
            return pokemonData.find((p) => p.nr === pokemon.origin)?.id;
          })
          .filter((pokemon) => !!pokemon),
      ),
    [],
  );

  const unlockedShinies = useMemo(
    () =>
      new Set(
        [...localPokedexRepository.findUnlockedIds({ shiny: true })]
          .map((pid) => pokemonData.find((p) => p.id === pid))
          .map((pokemon) => {
            if (!pokemon?.origin) return pokemon?.id;
            return pokemonData.find((p) => p.nr === pokemon.origin)?.id;
          })
          .filter((pokemon) => !!pokemon),
      ),
    [],
  );

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
              {unlockedPokemonIds.size} / {unlockables.length}
            </Typography>
          </Stack>

          <CompletionProgress
            totalPokemon={unlockables.length}
            unlockedPokemon={unlockedPokemonIds.size}
            unlockedShinies={unlockedShinies.size}
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
          const isShiny = unlockedShinies.has(pokemon.id);

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
                    <Badge
                      overlap="rectangular"
                      invisible={!isShiny}
                      badgeContent={
                        <AutoAwesomeRoundedIcon
                          aria-hidden
                          sx={{
                            fontSize: 16,
                          }}
                        />
                      }
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      sx={{
                        "& .MuiBadge-badge": {
                          width: 20,
                          height: 20,
                          minWidth: 20,
                          borderRadius: "50%",
                          color: "darkorange",
                        },
                      }}
                    >
                      <Avatar
                        src={getPokemonSpriteUrl(pokemon.nr, isShiny)}
                        alt=""
                        variant="square"
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: "transparent",
                          imageRendering: "pixelated",
                        }}
                      />
                    </Badge>

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
