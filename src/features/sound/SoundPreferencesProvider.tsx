import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import Fab from "@mui/material/Fab";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

export type SoundLevel = "on" | "mute";

const STORAGE_KEY = "sound-level";

const SoundPreferencesContext = createContext<SoundLevel | undefined>(
  undefined,
);

export function SoundPreferencesProvider({ children }: PropsWithChildren) {
  const [soundLevel, setSoundLevel] = useState<SoundLevel>(() => {
    const storedSoundLevel = localStorage.getItem(STORAGE_KEY);

    return storedSoundLevel === "on" || storedSoundLevel === "mute"
      ? storedSoundLevel
      : "mute";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, soundLevel);
  }, [soundLevel]);

  const toggleSound = () => {
    setSoundLevel((current) => (current === "on" ? "mute" : "on"));
  };

  return (
    <SoundPreferencesContext value={soundLevel}>
      <Fab
        onClick={toggleSound}
        color="inherit"
        size="medium"
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
        }}
      >
        {soundLevel === "on" ? <VolumeUpIcon /> : <VolumeOffIcon />}
      </Fab>

      {children}
    </SoundPreferencesContext>
  );
}

export function useSoundLevel(): SoundLevel {
  const soundLevel = useContext(SoundPreferencesContext);

  if (soundLevel === undefined) {
    throw new Error(
      "useSoundLevel must be used within a SoundPreferencesProvider",
    );
  }

  return soundLevel;
}
