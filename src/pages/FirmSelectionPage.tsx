import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

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
        setSelected(list[0] ?? null);
      } catch (e: any) {
        setError(e?.response?.data?.error ?? "Unable to load firms");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-[74px] border-b bg-background flex items-center justify-between px-6 md:px-12">
        <span className="text-2xl font-bold tracking-tight text-foreground">BRT Trading Platform</span>
        <span className="text-lg font-medium text-muted-foreground">Select Firm</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl relative p-8">
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate("/auth");
            }}
            className="absolute top-4 right-4 h-10 w-10 p-0 rounded-md"
          >
            ✕
          </Button>

          <div className="space-y-2 mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Choose Your Firm</h1>
            <p className="text-base text-muted-foreground">
              Same workflow as legacy app: user must select one firm before entering dashboard.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg bg-muted/30 p-4 max-h-[340px] overflow-y-auto space-y-2">
            {firms.map((firm) => {
              const active = selected?.code === firm.code;
              return (
                <Button
                  key={firm.code}
                  variant={active ? "default" : "outline"}
                  onClick={() => setSelected(firm)}
                  className="w-full justify-start h-12 text-lg font-medium px-4"
                >
                  {firm.name}
                </Button>
              );
            })}
          </div>

          <div className="flex justify-end mt-6">
            <div style={{ display: "flex", gap: 2 }}>
              <Button
                onClick={() => navigate("/create-firm")}
              >
                + Create Firm
              </Button>
              {isAdmin && (
                <Button onClick={() => navigate("/create-user")}>
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
              className="px-6 h-11 text-base font-semibold"
            >
              {loading ? "Loading..." : "Continue"}
            </Button>
          </div>
        </Card >
      </main >
    </div >
  );
}
