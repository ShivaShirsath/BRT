import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeId = "9b0ab864" | "e03d68e7" | "1bfe07e5" | "34f7e1f7";

export type Theme = {
  id: ThemeId;
  name: string;
  className: string;
  colorHex: string;
};

export const THEMES: Theme[] = [
  { id: "9b0ab864", name: "Sand (Yellow/Cream)", className: "theme-9b0ab864", colorHex: "#f7f6f0" },
  { id: "e03d68e7", name: "Ocean (Blue)", className: "theme-e03d68e7", colorHex: "#3b82f6" },
  { id: "1bfe07e5", name: "Rose (Red)", className: "theme-1bfe07e5", colorHex: "#e11d48" },
  { id: "34f7e1f7", name: "Emerald (Green)", className: "theme-34f7e1f7", colorHex: "#10b981" }
];

type ThemeState = {
  themeId: ThemeId;
  darkMode: boolean;
  setTheme: (id: ThemeId) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: "9b0ab864",
      darkMode: false,
      setTheme: (themeId) => set({ themeId }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (darkMode) => set({ darkMode }),
    }),
    {
      name: "brt-theme-settings",
    }
  )
);
