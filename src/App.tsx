import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { FirmSelectionPage } from "./pages/FirmSelectionPage";
import { MenuPage } from "./pages/MenuPage";
import { PurchasePage } from "./pages/PurchasePage";
import { SalesPage } from "./pages/SalesPage";
import { DataEntryPage } from "./pages/DataEntryPage";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "./api/client";
import { useAuthStore } from "./store/authStore";

function SessionBootstrap({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
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
      } catch {
        logout();
      } finally {
        setReady(true);
      }
    })();
  }, [token, setAuth, logout]);

  if (!ready) return null;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <CssBaseline />
      <SessionBootstrap>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/firm-selection" element={<FirmSelectionPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/data-entry" element={<DataEntryPage />} />
              <Route path="/purchase" element={<PurchasePage />} />
              <Route path="/sales" element={<SalesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionBootstrap>
    </>
  );
}
