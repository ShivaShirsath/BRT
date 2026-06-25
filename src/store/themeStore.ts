import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/client";

export type ThemeId = "9b0ab864" | "e03d68e7" | "1bfe07e5" | "34f7e1f7" | "1bf014bc" | "418a8650" | "dffd2629" | "f73e0bf6" | "737b8680";

export type ThemeMode = "light" | "dark" | "system";

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
  { id: "34f7e1f7", name: "Emerald (Green)", className: "theme-34f7e1f7", colorHex: "#10b981" },
  { id: "1bf014bc", name: "Amber Minimal (Yellow)", className: "theme-1bf014bc", colorHex: "#f59e0b" },
  { id: "418a8650", name: "Vercel (Black)", className: "theme-418a8650", colorHex: "#000000" },
  { id: "dffd2629", name: "Starry Night (Indigo)", className: "theme-dffd2629", colorHex: "#4f46e5" },
  { id: "f73e0bf6", name: "Facebook (Blue)", className: "theme-f73e0bf6", colorHex: "#2563eb" },
  { id: "737b8680", name: "Soft Pop (Rose)", className: "theme-737b8680", colorHex: "#e11d48" }
];

export const DEFAULT_PURCHASE_CHARGES: Record<string, string> = {
  "M. Tax": "0.00",
  "Commission": "0.00",
  "Pur. Comm": "0.00",
  "Freight": "0.00",
  "Packing": "0.00",
  "Loading": "0.00",
  "Leivy": "0.00",
  "Tolai": "0.00",
  "Hamali": "0.00",
  "Discount": "0.00",
  "IGST": "0.00",
  "SGST": "0.00",
  "CGST": "0.00",
  "TDS": "0.00",
  "Khandani": "0.00",
  "Our expenses": "0.00",
  "Exp. 2": "0.00",
  "Exp. 3": "0.00",
  "Exp. 4": "0.00",
};

export const DEFAULT_SALES_CHARGES: Record<string, string> = {
  "pattiFreight": "0.00",
  "commission": "0.00",
  "tdsPercent": "0.00",
};

type ThemeState = {
  themeId: ThemeId;
  themeMode: ThemeMode;
  defaultCrop: string;
  purchaseCharges: Record<string, string>;
  salesCharges: Record<string, string>;
  setTheme: (id: ThemeId) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDefaultCrop: (crop: string) => void;
  setPurchaseCharges: (charges: Record<string, string>) => void;
  setSalesCharges: (charges: Record<string, string>) => void;
  fetchSettingsFromServer: () => Promise<void>;
  saveSettingsToServer: (updates: Partial<Pick<ThemeState, "defaultCrop" | "purchaseCharges" | "salesCharges">>) => Promise<void>;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: "9b0ab864",
      themeMode: "system",
      defaultCrop: "",
      purchaseCharges: { ...DEFAULT_PURCHASE_CHARGES },
      salesCharges: { ...DEFAULT_SALES_CHARGES },
      setTheme: (themeId) => set({ themeId }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setDefaultCrop: (defaultCrop) => {
        set({ defaultCrop });
        api.post("/settings", { defaultCrop }).catch(err => console.error("Failed to sync defaultCrop", err));
      },
      setPurchaseCharges: (purchaseCharges) => {
        set({ purchaseCharges });
        api.post("/settings", { purchaseCharges }).catch(err => console.error("Failed to sync purchaseCharges", err));
      },
      setSalesCharges: (salesCharges) => {
        set({ salesCharges });
        api.post("/settings", { salesCharges }).catch(err => console.error("Failed to sync salesCharges", err));
      },
      fetchSettingsFromServer: async () => {
        try {
          const { data } = await api.get("/settings");
          if (data) {
            set({
              defaultCrop: data.defaultCrop || "",
              purchaseCharges: (data.purchaseCharges && Object.keys(data.purchaseCharges).length > 0)
                ? data.purchaseCharges
                : { ...DEFAULT_PURCHASE_CHARGES },
              salesCharges: (data.salesCharges && Object.keys(data.salesCharges).length > 0)
                ? data.salesCharges
                : { ...DEFAULT_SALES_CHARGES },
            });
          }
        } catch (err) {
          console.error("Failed to fetch settings from server", err);
        }
      },
      saveSettingsToServer: async (updates) => {
        try {
          const { data } = await api.post("/settings", updates);
          if (data) {
            set({
              defaultCrop: data.defaultCrop || "",
              purchaseCharges: (data.purchaseCharges && Object.keys(data.purchaseCharges).length > 0)
                ? data.purchaseCharges
                : { ...DEFAULT_PURCHASE_CHARGES },
              salesCharges: (data.salesCharges && Object.keys(data.salesCharges).length > 0)
                ? data.salesCharges
                : { ...DEFAULT_SALES_CHARGES },
            });
          }
        } catch (err) {
          console.error("Failed to save settings to server", err);
          set(updates);
        }
      },
    }),
    {
      name: "brt-theme-settings",
    }
  )
);
