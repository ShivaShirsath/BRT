import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import seed from "./data/wmarket_seed.json";
import liveDb from "./data/wmarket_live_db.json";
import "./App.css";

type AppView =
  | "dashboard"
  | "customers"
  | "suppliers"
  | "inward"
  | "outward"
  | "challans"
  | "stock-ledger"
  | "account-ledger"
  | "reports"
  | "settings";

type AppStage = "login" | "firm-selection" | "app";

type NavItem = { key: AppView; label: string };

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "customers", label: "Customer Master" },
  { key: "suppliers", label: "Supplier Master" },
  { key: "inward", label: "Inward Entry" },
  { key: "outward", label: "Outward Entry" },
  { key: "challans", label: "Order / Challan" },
  { key: "stock-ledger", label: "Stock Ledger" },
  { key: "account-ledger", label: "Account Ledger" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
];

function money(value: unknown): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "₹0";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function LoginWindow({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) return;
    onLogin();
  }

  return (
    <main className="login-page" aria-label="Login page">
      <div className="login-card">
        <p className="login-badge">Aadt solution</p>
        <h1>Welcome back</h1>
        <p className="login-subtitle">Sign in to continue to your dashboard.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Sign in</button>
        </form>
      </div>
    </main>
  );
}

function FirmSelectionWindow({ onContinue }: { onContinue: () => void }) {
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

function SimpleTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section className="window-section">
      <h2>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={`${i}-${j}`}>{cell}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AppShell({ onLogout }: { onLogout: () => void }) {
  const [activeView, setActiveView] = useState<AppView>("dashboard");

  const customers = seed.customers;
  const suppliers = seed.suppliers;
  const cont = seed.cont;
  const ledger = seed.ledger;
  const stock = seed.stock;

  const totals = useMemo(() => {
    const inwardQty = cont.reduce((s, r) => s + Number(r.RECEIVED ?? 0), 0);
    const outwardQty = cont.reduce((s, r) => s + Number(r.SEND ?? 0), 0);
    const netValue = ledger.reduce((s, r) => {
      const amt = Number(r.AMOUNT ?? 0);
      return s + (r.CD === "C" ? amt : -amt);
    }, 0);
    return { inwardQty, outwardQty, netValue };
  }, [cont, ledger]);

  const content = useMemo(() => {
    if (activeView === "dashboard") {
      return (
        <>
          <section className="metrics-grid">
            <article className="metric-card"><p>Customers</p><h3>{customers.length}</h3></article>
            <article className="metric-card"><p>Suppliers</p><h3>{suppliers.length}</h3></article>
            <article className="metric-card"><p>Total Received Qty</p><h3>{totals.inwardQty}</h3></article>
            <article className="metric-card"><p>Net Ledger Value</p><h3>{money(totals.netValue)}</h3></article>
          </section>
          <SimpleTable
            title="Recent Cont Entries (Imported)"
            headers={["Date", "Sr No", "ACNO", "Received", "Send", "Sale Amt"]}
            rows={cont.slice(0, 20).map((r) => [
              String(r.DATE ?? ""),
              String(r.SRNO ?? ""),
              String(r.ACNO ?? ""),
              String(r.RECEIVED ?? ""),
              String(r.SEND ?? ""),
              money(r.SALE_AMT),
            ])}
          />
        </>
      );
    }

    if (activeView === "customers") {
      return (
        <SimpleTable
          title="Customer Master (Imported CUST2601)"
          headers={["ACNO", "NAME", "CITY", "PHONE", "CLBALANCE"]}
          rows={customers.map((r) => [String(r.ACNO ?? ""), String(r.NAME ?? ""), String(r.CITY ?? ""), String(r.PHONE ?? ""), money(r.CLBALANCE)])}
        />
      );
    }

    if (activeView === "suppliers") {
      return (
        <SimpleTable
          title="Supplier Master (Imported SUPP2601)"
          headers={["ACNO", "NAME", "CITY", "PHONE", "CLBALANCE"]}
          rows={suppliers.map((r) => [String(r.ACNO ?? ""), String(r.NAME ?? ""), String(r.CITY ?? ""), String(r.PHONE ?? ""), money(r.CLBALANCE)])}
        />
      );
    }

    if (activeView === "inward") {
      return (
        <SimpleTable
          title="Inward Snapshot (from CONT2601)"
          headers={["Date", "Challan", "Vehicle", "Received", "ACNO"]}
          rows={cont.slice(0, 60).map((r) => [String(r.DATE ?? ""), String(r.CHALLAN_NO ?? ""), String(r.VEH_NO ?? ""), String(r.RECEIVED ?? ""), String(r.ACNO ?? "")])}
        />
      );
    }

    if (activeView === "outward") {
      return (
        <SimpleTable
          title="Outward Snapshot (from CONT2601)"
          headers={["Date", "Sr No", "ACNO", "Send", "Sale Amt"]}
          rows={cont.slice(0, 60).map((r) => [String(r.DATE ?? ""), String(r.SRNO ?? ""), String(r.ACNO ?? ""), String(r.SEND ?? ""), money(r.SALE_AMT)])}
        />
      );
    }

    if (activeView === "challans") {
      return (
        <SimpleTable
          title="Challan Flow (from CONT2601)"
          headers={["Challan", "Date", "ACNO", "Received", "Send", "Vehicle"]}
          rows={cont.slice(0, 80).map((r) => [String(r.CHALLAN_NO ?? ""), String(r.DATE ?? ""), String(r.ACNO ?? ""), String(r.RECEIVED ?? ""), String(r.SEND ?? ""), String(r.VEH_NO ?? "")])}
        />
      );
    }

    if (activeView === "stock-ledger") {
      return (
        <SimpleTable
          title="Stock Ledger (Imported STOK2601)"
          headers={["Item Code", "Item Name", "Recd Qty", "Sale Qty", "Bal Qty", "Eff Value"]}
          rows={stock.slice(0, 120).map((r) => [String(r.RECD_ITEM ?? ""), String(r.RECD_NAME ?? ""), String(r.RECD_QTY ?? ""), String(r.SALE_QTY ?? ""), String(r.BAL_QTY ?? ""), money(r.EFF_VAL)])}
        />
      );
    }

    if (activeView === "account-ledger") {
      return (
        <SimpleTable
          title="Account Ledger (Imported GL2601)"
          headers={["Date", "ACNO", "Description", "CD", "Amount", "Module", "Doc"]}
          rows={ledger.slice(0, 120).map((r) => [String(r.DATE ?? ""), String(r.ACNO ?? ""), String(r.DESC ?? ""), String(r.CD ?? ""), money(r.AMOUNT), String(r.MODULE ?? ""), String(r.DOC_NO ?? "")])}
        />
      );
    }

    if (activeView === "reports") {
      return (
        <section className="window-section">
          <h2>Imported Data Summary</h2>
          <ul>
            <li>Customers: {customers.length}</li>
            <li>Suppliers: {suppliers.length}</li>
            <li>Cont entries: {cont.length}</li>
            <li>Ledger entries: {ledger.length}</li>
            <li>Stock entries: {stock.length}</li>
          </ul>
          <h3>Live DBF Tables (Direct Read via dbffile)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Records</th>
                  <th>Fields</th>
                </tr>
              </thead>
              <tbody>
                {liveDb.tables.map((t) => (
                  <tr key={t.table}>
                    <td>{t.table}</td>
                    <td>{t.recordCount}</td>
                    <td>{t.fieldCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    return (
      <section className="window-section">
        <h2>Settings</h2>
        <p>Data source is imported from local DBF files in `/wmarket/DATA`.</p>
      </section>
    );
  }, [activeView, cont, customers, ledger, stock, suppliers, totals.inwardQty, totals.netValue]);

  return (
    <main className="app-layout" aria-label="Aadt solution application">
      <aside className="sidebar">
        <h1>Aadt solution</h1>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button key={item.key} type="button" className={item.key === activeView ? "nav-btn active" : "nav-btn"} onClick={() => setActiveView(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" className="logout-btn" onClick={onLogout}>Logout</button>
      </aside>
      <section className="content-area">
        <header className="content-header">
          <h2>{NAV_ITEMS.find((item) => item.key === activeView)?.label}</h2>
          <div className="status-pill">Imported Local Data</div>
        </header>
        {content}
      </section>
    </main>
  );
}

export default function App() {
  const [stage, setStage] = useState<AppStage>("login");

  if (stage === "login") return <LoginWindow onLogin={() => setStage("firm-selection")} />;
  if (stage === "firm-selection") return <FirmSelectionWindow onContinue={() => setStage("app")} />;
  return <AppShell onLogout={() => setStage("login")} />;
}
