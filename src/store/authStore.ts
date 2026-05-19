import { create } from "zustand";
import { persist } from "zustand/middleware";

type Firm = { code: string; name: string };
type MenuItem = { code: string; label: string; route: string; sortOrder: number };

type AuthState = {
  token: string;
  userCode: string;
  fullName: string;
  roleCode: string;
  firmCode: string;
  selectedFirm: Firm | null;
  menu: MenuItem[];
  setAuth: (payload: { token: string; userCode: string; fullName: string; roleCode: string; firmCode: string }) => void;
  setFirm: (firm: Firm) => void;
  setMenu: (menu: MenuItem[]) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "",
      userCode: "",
      fullName: "",
      roleCode: "",
      firmCode: "",
      selectedFirm: null,
      menu: [],
      setAuth: (payload) => set(payload),
      setFirm: (selectedFirm) => set({ selectedFirm }),
      setMenu: (menu) => set({ menu }),
      logout: () => set({ token: "", userCode: "", fullName: "", roleCode: "", firmCode: "", selectedFirm: null, menu: [] }),
    }),
    {
      name: "brt-auth-session",
    }
  )
);
