import { useState } from "react";

export function FirmSelectionWindow({ onContinue }: { onContinue: () => void }) {
  const [firm, setFirm] = useState("BRT Trading Co.");
  return (
    <main className="login-page" aria-label="Firm selection page">
      <div className="login-card">
        <p className="login-badge">Aadt solution</p>
        <h1>Select firm</h1>
        <p className="login-subtitle">Choose a firm to start your session.</p>
        <div className="firm-list">
          {["BRT Trading Co.", "BRT Agro", "BRT Wholesale"].map((item) => (
            <button key={item} type="button" className={item === firm ? "firm-btn active" : "firm-btn"} onClick={() => setFirm(item)}>
              {item}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" onClick={onContinue}>Continue with {firm}</button>
      </div>
    </main>
  );
}
