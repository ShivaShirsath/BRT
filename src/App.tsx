import { useEffect, useMemo, useState } from "react";
import "./App.css";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dbf = useDbfData();

  // Sync real data table based on view
  useEffect(() => {
    const VIEW_TO_TABLE: Record<string, string> = {
      "customers": "CUST2601.DBF",
      "suppliers": "SUPP2601.DBF",
      "inward": "CONT2601.DBF",
      "outward": "CONT2601.DBF",
      "challans": "CONT2601.DBF",
      "stock-ledger": "STOK2601.DBF",
      "account-ledger": "GL2601.DBF",
    };
    const target = VIEW_TO_TABLE[activeView] || (activeView === "dashboard" ? "CONT2601.DBF" : null);
    if (target && dbf.dbfFiles.some(f => f.table === target)) {
      dbf.setSelectedTableName(target);
    }
  }, [activeView, dbf.dbfFiles]);

  const customers: any[] = [];
  const suppliers: any[] = [];
  const cont: any[] = [];
  const ledger: any[] = [];
  const stock: any[] = [];

  // Real-time counts from DBF catalog
  const realCustCount = dbf.dbfFiles.find(t => t.table === "CUST2601.DBF")?.recordCount ?? 0;
  const realSuppCount = dbf.dbfFiles.find(t => t.table === "SUPP2601.DBF")?.recordCount ?? 0;

  const totals = useMemo(() => {
    const inwardQty = cont.reduce((s, r) => s + Number(r.RECEIVED ?? 0), 0);
    const netValue = ledger.reduce((s, r) => {
      const amt = Number(r.AMOUNT ?? 0);
      return s + (r.CD === "C" ? amt : -amt);
    }, 0);
    return { inwardQty, netValue };
  }, [cont, ledger]);

  const content = useMemo(() => {
    // Helper to get real rows or fallback to seed
    const getRows = (tableName: string, fallback: any[]) => {
      if (dbf.dbfTable?.table === tableName) return dbf.dbfTable.rows;
      return fallback;
    };

    if (activeView === "dashboard") {
      const displayCont = getRows("CONT2601.DBF", cont);
      return (
        <div className="dashboard-content">
          <section className="metrics-grid-premium">
            <article className="metric-card-premium">
              <div className="card-icon blue">👤</div>
              <div className="card-details">
                <p>Total Customers</p>
                <h3>{realCustCount}</h3>
                <span className="card-trend positive">↑ Active Master</span>
              </div>
            </article>
            <article className="metric-card-premium">
              <div className="card-icon purple">🚚</div>
              <div className="card-details">
                <p>Total Suppliers</p>
                <h3>{realSuppCount}</h3>
                <span className="card-trend">Verified sources</span>
              </div>
            </article>
            <article className="metric-card-premium">
              <div className="card-icon orange">📥</div>
              <div className="card-details">
                <p>Inward Volume</p>
                <h3>{totals.inwardQty.toLocaleString()}</h3>
                <span className="card-trend positive">Total units recd</span>
              </div>
            </article>
            <article className="metric-card-premium">
              <div className="card-icon green">💰</div>
              <div className="card-details">
                <p>Net Financial Value</p>
                <h3>{money(totals.netValue)}</h3>
                <span className={`card-trend ${totals.netValue >= 0 ? "positive" : "negative"}`}>
                  {totals.netValue >= 0 ? "Credit Balance" : "Debit Balance"}
                </span>
              </div>
            </article>
          </section>

          <div className="dashboard-grid-main">
            <section className="window-section-premium main-table">
              <div className="section-header">
                <h3>Recent Transactions (Live)</h3>
                <button className="text-link-btn" onClick={() => setActiveView("inward")}>View All</button>
              </div>
              <div className="table-wrap scrollable-y">
                {dbf.dbfLoading && dbf.dbfTable?.table !== "CONT2601.DBF" ? <p className="loading-overlay">Syncing live data...</p> : null}
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Party ACNO</th>
                      <th>Recd</th>
                      <th>Send</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCont.slice(0, 15).map((r, i) => (
                      <tr key={i}>
                        <td>{String(r.DATE ?? "")}</td>
                        <td>{String(r.SRNO ?? "-")}</td>
                        <td>{String(r.ACNO ?? "")}</td>
                        <td className="text-green">{Number(r.RECEIVED) > 0 ? r.RECEIVED : ""}</td>
                        <td className="text-orange">{Number(r.SEND) > 0 ? r.SEND : ""}</td>
                        <td className="font-bold">{money(r.SALE_AMT)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="summary-sidebar">
              <section className="window-section-premium">
                <h3>Master Distribution</h3>
                <div className="distribution-list">
                  <div className="dist-item">
                    <div className="dist-info"><span>Customers</span><span>{Math.round((customers.length / (customers.length + suppliers.length)) * 100)}%</span></div>
                    <div className="progress-bar"><div className="progress blue" style={{ width: `${(customers.length / (customers.length + suppliers.length)) * 100}%` }}></div></div>
                  </div>
                  <div className="dist-item">
                    <div className="dist-info"><span>Suppliers</span><span>{Math.round((suppliers.length / (customers.length + suppliers.length)) * 100)}%</span></div>
                    <div className="progress-bar"><div className="progress purple" style={{ width: `${(suppliers.length / (customers.length + suppliers.length)) * 100}%` }}></div></div>
                  </div>
                </div>
              </section>

              <section className="window-section-premium dark">
                <h3>System Status</h3>
                <div className="status-grid">
                  <div className="status-item"><small>DBF Sync</small><strong>Healthy</strong></div>
                  <div className="status-item"><small>Last Import</small><strong>Just now</strong></div>
                  <div className="status-item"><small>Engine</small><strong>V8 Hybrid</strong></div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      );
    }

    if (activeView === "customers") return <SimpleTable title="Customer Master (from CUST2601)" headers={["ACNO", "Name", "City", "Phone", "Balance"]} rows={getRows("CUST2601.DBF", customers).map((r) => [String(r.ACNO ?? ""), String(r.NAME ?? ""), String(r.CITY ?? ""), String(r.PHONE ?? ""), money(r.CLBALANCE)])} />;
    if (activeView === "suppliers") return <SimpleTable title="Supplier Master (from SUPP2601)" headers={["ACNO", "Name", "City", "Phone", "Balance"]} rows={getRows("SUPP2601.DBF", suppliers).map((r) => [String(r.ACNO ?? ""), String(r.NAME ?? ""), String(r.CITY ?? ""), String(r.PHONE ?? ""), money(r.CLBALANCE)])} />;

    if (activeView === "inward") return <SimpleTable title="Inward Snapshot (from CONT2601)" headers={["Date", "Challan", "Vehicle", "Received", "ACNO"]} rows={getRows("CONT2601.DBF", cont).slice(0, 100).map((r) => [String(r.DATE ?? ""), String(r.CHALLAN_NO ?? ""), String(r.VEH_NO ?? ""), String(r.RECEIVED ?? ""), String(r.ACNO ?? "")])} />;
    if (activeView === "outward") return <SimpleTable title="Outward Snapshot (from CONT2601)" headers={["Date", "Sr No", "ACNO", "Send", "Sale Amt"]} rows={getRows("CONT2601.DBF", cont).slice(0, 100).map((r) => [String(r.DATE ?? ""), String(r.SRNO ?? ""), String(r.ACNO ?? ""), String(r.SEND ?? ""), money(r.SALE_AMT)])} />;
    if (activeView === "challans") return <SimpleTable title="Challan Flow (from CONT2601)" headers={["Challan", "Date", "ACNO", "Received", "Send", "Vehicle"]} rows={getRows("CONT2601.DBF", cont).slice(0, 100).map((r) => [String(r.CHALLAN_NO ?? ""), String(r.DATE ?? ""), String(r.ACNO ?? ""), String(r.RECEIVED ?? ""), String(r.SEND ?? ""), String(r.VEH_NO ?? "")])} />;
    if (activeView === "stock-ledger") return <SimpleTable title="Stock Ledger (from STOK2601)" headers={["Item Code", "Item Name", "Recd Qty", "Sale Qty", "Bal Qty", "Eff Value"]} rows={getRows("STOK2601.DBF", stock).slice(0, 150).map((r) => [String(r.RECD_ITEM ?? ""), String(r.RECD_NAME ?? ""), String(r.RECD_QTY ?? ""), String(r.SALE_QTY ?? ""), String(r.BAL_QTY ?? ""), money(r.EFF_VAL)])} />;
    if (activeView === "account-ledger") return <SimpleTable title="Account Ledger (from GL2601)" headers={["Date", "ACNO", "Description", "CD", "Amount", "Module", "Doc"]} rows={getRows("GL2601.DBF", ledger).slice(0, 150).map((r) => [String(r.DATE ?? ""), String(r.ACNO ?? ""), String(r.DESC ?? ""), String(r.CD ?? ""), money(r.AMOUNT), String(r.MODULE ?? ""), String(r.DOC_NO ?? "")])} />;

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
          <div className="table-wrap scrollable-y">
            <table>
              <thead><tr><th>Table</th><th>Records</th><th>Fields</th></tr></thead>
              <tbody>{dbf.dbfFiles.sort((a, b) => b.recordCount - a.recordCount).map((t) => <tr key={t.table}><td>{t.table}</td><td>{t.recordCount}</td><td>{t.fieldCount}</td></tr>)}</tbody>
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
    <main className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`} aria-label="Aadt solution application">
      <aside className="sidebar">
        <div className="sidebar-header">
          {!isSidebarCollapsed && <h1>Aadt solution</h1>}
          <button type="button" className="sidebar-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="9" x2="9" y1="3" y2="21" />
            </svg>
          </button>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button key={item.key} type="button" className={item.key === activeView ? "nav-btn active" : "nav-btn"} onClick={() => setActiveView(item.key)}>
              <span className="nav-icon">{item.label[0]}</span>
              {!isSidebarCollapsed && <span className="nav-text">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button type="button" className="logout-btn" onClick={onLogout}>
          <span className="nav-icon">L</span>
          {!isSidebarCollapsed && <span className="nav-text">Logout</span>}
        </button>
      </aside>
      <section className="content-area">
        <header className="content-header">
          <div className="header-left">
            {isSidebarCollapsed && (
              <button type="button" className="sidebar-toggle-main" onClick={() => setIsSidebarCollapsed(false)} title="Show sidebar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <line x1="9" x2="9" y1="3" y2="21" />
                </svg>
              </button>
            )}
            <h2>{NAV_ITEMS.find((item) => item.key === activeView)?.label}</h2>
          </div>
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
