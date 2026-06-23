import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { cn } from "../lib/utils";

type Firm = { code: string; name: string };

export function FirmSelectionPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selected, setSelected] = useState<Firm | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setFirm = useAuthStore((s) => s.setFirm);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const roleCode = useAuthStore((s) => s.roleCode);
  const navigate = useNavigate();

  const isAdmin = roleCode?.toUpperCase() === "ADMIN";

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/firms");
        const list = (data.firms ?? []) as Firm[];
        setFirms(list);
        setSelected(null); // Match image 1: nothing selected by default
      } catch (e: any) {
        setError(e?.response?.data?.error ?? "Unable to load firms");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      <header className="h-[74px] border-b bg-white dark:bg-card flex items-center justify-between px-6 md:px-12 transition-colors duration-200">
        <span className="text-[22px] font-bold tracking-tight text-[#1a2b5c] dark:text-foreground">
          BRT Trading Platform
        </span>
        <button
          onClick={() => {
            logout();
            navigate("/auth");
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          title="Click to logout"
        >
          <span className="text-[15px] font-medium text-gray-600 dark:text-gray-300">
            User Profile
          </span>
          <div className="w-10 h-10 rounded-full bg-[#d9d9d9] dark:bg-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground font-bold" />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-border/50 rounded-3xl bg-white dark:bg-card">
          <div className="space-y-2 mb-8">
            <h1 className="text-[28px] font-extrabold tracking-tight text-foreground/90">
              Choose Your Firm
            </h1>
            <p className="text-[15px] text-muted-foreground/90 leading-relaxed">
              Same workflow as legacy app: user must select one firm before entering dashboard.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1 mb-8">
            {firms.map((firm) => {
              const active = selected?.code === firm.code;
              return (
                <button
                  key={firm.code}
                  onClick={() => setSelected(firm)}
                  className={cn(
                    "w-full flex items-center justify-start h-14 text-[16px] font-normal px-5 rounded-[12px] border transition-all duration-150 text-left outline-none",
                    active
                      ? "border-[var(--firm-border-active)] bg-[var(--firm-bg-active)] text-[var(--firm-text-active)] font-semibold shadow-[0_2px_8px_rgba(24,119,242,0.08)]"
                      : "border-[var(--firm-border-inactive)] bg-[var(--firm-bg-inactive)] text-foreground/95 hover:bg-[var(--firm-bg-hover)]"
                  )}
                >
                  {firm.name}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center gap-4 mt-8 pt-4 border-t border-border/30">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/create-firm")}
                className="h-11 px-4 rounded-xl border border-primary/20 text-primary hover:bg-primary/5 dark:text-blue-400 font-medium"
              >
                + Create Firm
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/create-user")}
                  className="h-11 px-4 rounded-xl border border-primary/20 text-primary hover:bg-primary/5 dark:text-blue-400 font-medium"
                >
                  + Create User
                </Button>
              )}
            </div>
            <Button
              disabled={!selected || loading}
              onClick={async () => {
                if (!selected) return;
                setLoading(true);
                setError("");
                try {
                  const { data } = await api.post("/auth/select-firm", { firmCode: selected.code });
                  setAuth(data);
                  setFirm(selected);
                  navigate("/menu");
                } catch (e: any) {
                  setError(e?.response?.data?.error ?? "Unable to select firm");
                } finally {
                  setLoading(false);
                }
              }}
              className="px-8 h-11 text-base font-semibold rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground transition-all duration-150 shadow-sm disabled:bg-primary/40 disabled:text-white/85 disabled:opacity-100 disabled:pointer-events-none"
            >
              {loading ? "Loading..." : "Continue"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
