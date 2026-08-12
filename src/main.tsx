import { CssBaseline, ThemeProvider } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { WithAnalytics } from "./features/analytics";
import { theme } from "./theme/theme";
import "./styles/globals.css";
import { SoundPreferencesProvider } from "./features/sound/SoundPreferencesProvider.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <WithAnalytics>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SoundPreferencesProvider>
          <App />
        </SoundPreferencesProvider>
      </ThemeProvider>
    </WithAnalytics>
  </StrictMode>,
);
