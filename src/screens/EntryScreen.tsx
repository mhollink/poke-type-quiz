import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import CoffeeIcon from "@mui/icons-material/Coffee";
import DeleteIcon from "@mui/icons-material/Delete";
import GitHubIcon from "@mui/icons-material/GitHub";
import SportsMmaRoundedIcon from "@mui/icons-material/SportsMmaRounded";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { GameMode } from "~/types";

import logo from "../assets/poketype-logo.webp";
import { GameModeGrid } from "../features/gamemode-selection/components/GameModeGrid.tsx";
import { GenerationSelection } from "../features/generation-selection/GenerationSelection.tsx";
import { usePwaInstallPrompt } from "../hooks/usePwaInstallation.ts";

interface EntryPageProps {
  version: string;
  onSelectGameMode: (gameMode: GameMode) => void;
  onOpenPokedex: () => void;
  onOpenMovedex: () => void;
}

export function EntryScreen({
  version,
  onSelectGameMode,
  onOpenPokedex,
  onOpenMovedex,
}: EntryPageProps) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: {
          xs: "flex-start",
          md: "center",
        },
        px: {
          xs: 2,
          sm: 3,
        },
        py: {
          xs: 4,
          md: 6,
        },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `radial-gradient(
                              circle at top,
                              ${theme.palette.primary.dark}33,
                              transparent 40%
                          )`
            : `radial-gradient(
                              circle at top,
                              ${theme.palette.primary.light}33,
                              transparent 40%
                          )`,
      }}
    >
      <Stack
        spacing={{
          xs: 4,
          md: 5,
        }}
        sx={{
          width: "100%",
          maxWidth: 1450,
        }}
      >
        <Box
          component="header"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Poketype"
            sx={{
              display: "block",
              width: {
                xs: "min(100%, 360px)",
                sm: "min(100%, 480px)",
              },
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Box>

        <Box component="section" aria-labelledby="game-mode-heading">
          <Typography
            id="game-mode-heading"
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              textAlign: "center",
              fontWeight: 800,
            }}
          >
            Choose your game mode
          </Typography>
          <GameModeGrid onSelect={onSelectGameMode} />
        </Box>

        <Box component="section" aria-label="Selection of playable generations">
          <GenerationSelection />
        </Box>

        <EntrySupportLinks version={version} />
      </Stack>
      <Fab
        variant="extended"
        onClick={onOpenPokedex}
        color="secondary"
        size="large"
        sx={{
          position: "fixed",
          top: 16,
          right: 80,

          "& .MuiSvgIcon-root": {
            transform: "rotate(180deg)",
          },
        }}
      >
        <CatchingPokemonIcon sx={{ mr: 1 }} />
        Pokedex
      </Fab>
      <Fab
        variant="extended"
        onClick={onOpenMovedex}
        color="warning"
        size="large"
        sx={{
          position: "fixed",
          top: 16,
          right: 230,
        }}
      >
        <SportsMmaRoundedIcon sx={{ mr: 1 }} />
        Attackdex
      </Fab>

      {import.meta.env.DEV && (
        <Fab
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
          }}
          color="error"
          size="medium"
          onClick={() => {
            const deleteEverything = confirm(
              "Do you want to clear your localstorage?",
            );
            if (deleteEverything) {
              localStorage.removeItem("poketype.daily-attempts.v1");
              localStorage.removeItem("poketype.daily-classic.v1");
              localStorage.removeItem("poketype.daily-reversed.v1");
              localStorage.removeItem("poketype.daily-moves.v1");
              localStorage.removeItem("poketype:pokedex:v1");
              localStorage.removeItem("poketype:shinydex:v1");
              localStorage.removeItem("poketype:move-dex:v1");
              window.location.reload();
            }
          }}
        >
          <DeleteIcon />
        </Fab>
      )}

      <PwaInstallSnackbar />
    </Box>
  );
}

const SNACKBAR_DURATION_MS = 20_000;

function PwaInstallSnackbar() {
  const { isVisible, install, dismiss } = usePwaInstallPrompt();

  return (
    <Snackbar
      open={isVisible}
      autoHideDuration={SNACKBAR_DURATION_MS}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      onClose={(_, reason) => {
        // Prevent accidental dismissal when the user clicks elsewhere.
        if (reason === "clickaway") {
          return;
        }

        dismiss();
      }}
    >
      <Alert
        severity="info"
        variant="standard"
        sx={{
          width: "100%",
          alignItems: "center",
        }}
        action={
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
            }}
          >
            <Button color="inherit" size="small" onClick={() => void install()}>
              Install
            </Button>

            <Button color="inherit" size="small" onClick={dismiss}>
              Not now
            </Button>
          </Stack>
        }
      >
        <AlertTitle>Install Poketype</AlertTitle>
        <Typography variant="body2" color="textSecondary">
          Add Poketype to your home screen for quicker access.
        </Typography>
      </Alert>
    </Snackbar>
  );
}

const SUPPORT_URL = "https://buymeacoffee.com/mhollink";
const ISSUES_URL = "https://github.com/mhollink/poke-type-quiz/issues";
const DEVELOPER_URL = "https://marcel.hollink.dev/";

export function EntrySupportLinks({ version }: { version: string }) {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        pt: {
          xs: 1,
          md: 2,
        },
        textAlign: "center",
      }}
    >
      <Button
        component="a"
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        color="warning"
        startIcon={<CoffeeIcon />}
      >
        Support Poketype
      </Button>

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={{
          xs: 1,
          sm: 2,
        }}
        sx={{
          alignItems: "center",
        }}
      >
        <Link
          href={ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
          color="text.secondary"
          underline="hover"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <GitHubIcon fontSize="small" />
          Feedback and issues
        </Link>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },
          }}
          aria-hidden="true"
        >
          •
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Created by{" "}
          <Link
            href={DEVELOPER_URL}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="hover"
          >
            Marcel Hollink
          </Link>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },
          }}
          aria-hidden="true"
        >
          •
        </Typography>

        <Box component="span" sx={{ whiteSpace: "nowrap" }}>
          v{version}
        </Box>
      </Stack>
    </Box>
  );
}
