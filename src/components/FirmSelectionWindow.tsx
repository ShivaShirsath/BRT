import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_DBF_API_BASE ?? "http://127.0.0.1:4001/api/dbf";

type FirmsResponse = { firms?: string[] };

export function FirmSelectionWindow({ onContinue }: { onContinue: (firm: string) => void }) {
  const [firms, setFirms] = useState<string[]>([]);
  const [firm, setFirm] = useState("BRT TRADING CO.");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/firms`);
        if (!res.ok) throw new Error(`Failed to load firms (${res.status})`);
        const data = (await res.json()) as FirmsResponse;
        const items = (data.firms ?? []).filter(Boolean);
        if (!active) return;
        setFirms(items);
        if (items.length) setFirm(items[0]);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : String(err));
        setFirms(["BRT TRADING CO."]);
        setFirm("BRT TRADING CO.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="login-page" aria-label="Firm selection page">
      <div className="login-card">
        <p className="login-badge">Aadt solution</p>
        <h1>Select firm</h1>
        <p className="login-subtitle">Choose a firm from database to start your session.</p>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="firm-list">
          {(firms.length ? firms : ["BRT TRADING CO."]).map((item) => (
            <button key={item} type="button" className={item === firm ? "firm-btn active" : "firm-btn"} onClick={() => setFirm(item)}>
              {item}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" disabled={loading} onClick={() => onContinue(firm)}>
          {loading ? "Loading firms..." : `Continue with ${firm}`}
        </button>
      </div>
    </main>
  );
}
