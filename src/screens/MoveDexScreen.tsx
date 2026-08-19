import { lazy, Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";

import { moveData } from "~/utils";

const MoveDex = lazy(() => import("../features/movedex/MoveDex.tsx"));

type MoveDexScreenProps = {
  readonly onExit: () => void;
};

export function MoveDexScreen({ onExit }: MoveDexScreenProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Suspense fallback={<ScreenLoader />}>
        <MoveDex moves={moveData} onExit={onExit} />
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
