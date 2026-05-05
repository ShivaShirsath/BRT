import { useMemo, useState } from "react";
import "./App.css";
import seed from "./data/wmarket_seed.json";
import { NAV_ITEMS } from "./constants/navigation";
import { money } from "./lib/format";
import { useDbfData } from "./hooks/useDbfData";
import { LoginWindow } from "./components/LoginWindow";
import { FirmSelectionWindow } from "./components/FirmSelectionWindow";
import { SimpleTable } from "./components/SimpleTable";
import { DbfExplorerPage } from "./pages/DbfExplorerPage";
import { ErdViewerPage } from "./pages/ErdViewerPage";
import type { AppStage, AppView } from "./types/app";

function AppShell({ onLogout }: { onLogout: () => void }) {
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const dbf = useDbfData();

  const customers = seed.customers;
  const suppliers = seed.suppliers;
  const cont = seed.cont;
  const ledger = seed.ledger;
  const stock = seed.stock;

  const totals = useMemo(() => {
    const inwardQty = cont.reduce((s, r) => s + Number(r.RECEIVED ?? 0), 0);
    const netValue = ledger.reduce((s, r) => {
      const amt = Number(r.AMOUNT ?? 0);
      return s + (r.CD === "C" ? amt : -amt);
    }, 0);
    return { inwardQty, netValue };
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
          <SimpleTable title="Recent Cont Entries (Imported)" headers={["Date", "Sr No", "ACNO", "Received", "Send", "Sale Amt"]} rows={cont.slice(0, 20).map((r) => [String(r.DATE ?? ""), String(r.SRNO ?? ""), String(r.ACNO ?? ""), String(r.RECEIVED ?? ""), String(r.SEND ?? ""), money(r.SALE_AMT)])} />
        </>
      );
    }

    if (activeView === "customers") return <SimpleTable title="Customer Master (Imported CUST2601)" headers={["ACNO", "NAME", "CITY", "PHONE", "CLBALANCE"]} rows={customers.map((r) => [String(r.ACNO ?? ""), String(r.NAME ?? ""), String(r.CITY ?? ""), String(r.PHONE ?? ""), money(r.CLBALANCE)])} />;
    if (activeView === "suppliers") return <SimpleTable title="Supplier Master (Imported SUPP2601)" headers={["ACNO", "NAME", "CITY", "PHONE", "CLBALANCE"]} rows={suppliers.map((r) => [String(r.ACNO ?? ""), String(r.NAME ?? ""), String(r.CITY ?? ""), String(r.PHONE ?? ""), money(r.CLBALANCE)])} />;
    if (activeView === "inward") return <SimpleTable title="Inward Snapshot (from CONT2601)" headers={["Date", "Challan", "Vehicle", "Received", "ACNO"]} rows={cont.slice(0, 60).map((r) => [String(r.DATE ?? ""), String(r.CHALLAN_NO ?? ""), String(r.VEH_NO ?? ""), String(r.RECEIVED ?? ""), String(r.ACNO ?? "")])} />;
    if (activeView === "outward") return <SimpleTable title="Outward Snapshot (from CONT2601)" headers={["Date", "Sr No", "ACNO", "Send", "Sale Amt"]} rows={cont.slice(0, 60).map((r) => [String(r.DATE ?? ""), String(r.SRNO ?? ""), String(r.ACNO ?? ""), String(r.SEND ?? ""), money(r.SALE_AMT)])} />;
    if (activeView === "challans") return <SimpleTable title="Challan Flow (from CONT2601)" headers={["Challan", "Date", "ACNO", "Received", "Send", "Vehicle"]} rows={cont.slice(0, 80).map((r) => [String(r.CHALLAN_NO ?? ""), String(r.DATE ?? ""), String(r.ACNO ?? ""), String(r.RECEIVED ?? ""), String(r.SEND ?? ""), String(r.VEH_NO ?? "")])} />;
    if (activeView === "stock-ledger") return <SimpleTable title="Stock Ledger (Imported STOK2601)" headers={["Item Code", "Item Name", "Recd Qty", "Sale Qty", "Bal Qty", "Eff Value"]} rows={stock.slice(0, 120).map((r) => [String(r.RECD_ITEM ?? ""), String(r.RECD_NAME ?? ""), String(r.RECD_QTY ?? ""), String(r.SALE_QTY ?? ""), String(r.BAL_QTY ?? ""), money(r.EFF_VAL)])} />;
    if (activeView === "account-ledger") return <SimpleTable title="Account Ledger (Imported GL2601)" headers={["Date", "ACNO", "Description", "CD", "Amount", "Module", "Doc"]} rows={ledger.slice(0, 120).map((r) => [String(r.DATE ?? ""), String(r.ACNO ?? ""), String(r.DESC ?? ""), String(r.CD ?? ""), money(r.AMOUNT), String(r.MODULE ?? ""), String(r.DOC_NO ?? "")])} />;

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
          <h3>Live DBF Catalog (Dynamic)</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Table</th><th>Records</th><th>Fields</th></tr></thead>
              <tbody>{dbf.dbfFiles.map((t) => <tr key={t.table}><td>{t.table}</td><td>{t.recordCount}</td><td>{t.fieldCount}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      );
    }

    if (activeView === "dbf-explorer") {
      return <DbfExplorerPage {...dbf} />;
    }

    if (activeView === "erd-viewer") {
      return <ErdViewerPage {...dbf} />;
    }

    return (
      <section className="window-section">
        <h2>Settings</h2>
        <p>DBF Explorer now reads all files dynamically from local DATA via API.</p>
      </section>
    );
  }, [activeView, cont, customers, dbf, ledger, stock, suppliers, totals.inwardQty, totals.netValue]);

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
