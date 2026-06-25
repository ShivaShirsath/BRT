import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { FirmSelectionPage } from "./pages/FirmSelectionPage";
import { CreateFirmPage } from "./pages/CreateFirmPage";
import { CreateUserPage } from "./pages/CreateUserPage";
import { MenuPage } from "./pages/MenuPage";
import { PurchasePage } from "./pages/PurchasePage";
import { SalesPage } from "./pages/SalesPage";
import { DataEntryPage } from "./pages/DataEntryPage";
import { OpeningBalancePage } from "./pages/OpeningBalancePage";
import { ProductEntryPage } from "./pages/ProductEntryPage";
import { DalalPaymentPage } from "./pages/DalalPaymentPage";
import { DalalPayment1Page } from "./pages/DalalPayment1Page";
import { CashDepositPage } from "./pages/CashDepositPage";
import { CashWithdrawalPage } from "./pages/CashWithdrawalPage";
import { CustomerReceiptPage } from "./pages/CustomerReceiptPage";
import { MiscReceiptPage } from "./pages/MiscReceiptPage";
import { PaymentVoucherPage } from "./pages/PaymentVoucherPage";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "./api/client";
import { useAuthStore } from "./store/authStore";

import { useThemeStore } from "./store/themeStore";
import { Toaster } from "./components/ui/Toaster";

function SessionBootstrap({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const fetchSettingsFromServer = useThemeStore((s) => s.fetchSettingsFromServer);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setAuth(data);
        fetchSettingsFromServer().catch(err => console.error("Failed to fetch settings on bootstrap", err));
      } catch {
        logout();
      } finally {
        setReady(true);
      }
    })();
  }, [token, setAuth, logout, fetchSettingsFromServer]);

  if (!ready) return null;
  return <>{children}</>;
}

export default function App() {
  const themeId = useThemeStore((s) => s.themeId);
  const themeMode = useThemeStore((s) => s.themeMode);

  useEffect(() => {
    // 1. Swap theme stylesheet
    let link = document.getElementById("theme-link") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.id = "theme-link";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `${import.meta.env.BASE_URL}themes/theme-${themeId}.css`;

    // 2. Toggle dark mode class on document element
    const root = document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    const resolveAndApply = () => {
      if (themeMode === "system") {
        const nativeTheme = (window as any).__nativeColorScheme;
        if (typeof nativeTheme === "string") {
          applyTheme(nativeTheme === "dark");
        } else {
          applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
      } else {
        applyTheme(themeMode === "dark");
      }
    };

    resolveAndApply();

    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const mqListener = (e: MediaQueryListEvent) => {
        if (typeof (window as any).__nativeColorScheme !== "string") {
          applyTheme(e.matches);
        }
      };

      const nativeListener = (e: any) => {
        applyTheme(e.detail === "dark");
      };

      (window as any).setNativeColorScheme = (color: string) => {
        (window as any).__nativeColorScheme = color;
        applyTheme(color === "dark");
      };

      mediaQuery.addEventListener("change", mqListener);
      window.addEventListener("nativeColorScheme", nativeListener);

      return () => {
        mediaQuery.removeEventListener("change", mqListener);
        window.removeEventListener("nativeColorScheme", nativeListener);
        delete (window as any).setNativeColorScheme;
      };
    }
  }, [themeId, themeMode]);

  return (
    <>
      <SessionBootstrap>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/firm-selection" element={<FirmSelectionPage />} />
              <Route path="/create-firm" element={<CreateFirmPage />} />
              <Route path="/create-user" element={<CreateUserPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/data-entry" element={<DataEntryPage />} />
              <Route path="/purchase" element={<PurchasePage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/opening-balances" element={<OpeningBalancePage />} />
              <Route path="/product-entry" element={<ProductEntryPage />} />
              <Route path="/dalal-payment" element={<DalalPaymentPage />} />
              <Route path="/dalal-payment-1" element={<DalalPayment1Page />} />
              <Route path="/cash-deposit" element={<CashDepositPage />} />
              <Route path="/cash-withdrawal" element={<CashWithdrawalPage />} />
              <Route path="/customer-receipt" element={<CustomerReceiptPage />} />
              <Route path="/misc-receipt" element={<MiscReceiptPage />} />
              <Route path="/payment-voucher" element={<PaymentVoucherPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionBootstrap>
      <Toaster />
    </>
  );
}

