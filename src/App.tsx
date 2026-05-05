import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import seed from "./data/wmarket_seed.json";
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
  | "dbf-explorer"
  | "erd-viewer"
  | "settings";

type AppStage = "login" | "firm-selection" | "app";
type NavItem = { key: AppView; label: string };

type DbfFileSummary = {
  table: string;
  recordCount: number;
  fieldCount: number;
};

type DbfField = {
  name: string;
  type: string;
  size: number;
};

type DbfRelation = {
  key: string;
  targetTable: string;
  targetKey: string;
  relationType: string;
};

type DbfTableResponse = {
  source: string;
  table: string;
  recordCount: number;
  fieldCount: number;
  fields: DbfField[];
  relations: DbfRelation[];
  page: number;
  pageSize: number;
  totalPages: number;
  rows: Record<string, unknown>[];
};

const DBF_API_BASE = import.meta.env.VITE_DBF_API_BASE ?? "http://127.0.0.1:4001/api/dbf";

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
  { key: "dbf-explorer", label: "DBF Explorer" },
  { key: "erd-viewer", label: "ERD Viewer" },
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

  const [dbfFiles, setDbfFiles] = useState<DbfFileSummary[]>([]);
  const [dbfSource, setDbfSource] = useState("");
  const [selectedTableName, setSelectedTableName] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [dbfPage, setDbfPage] = useState(1);
  const [dbfTable, setDbfTable] = useState<DbfTableResponse | null>(null);
  const [tableMetaCache, setTableMetaCache] = useState<Record<string, DbfTableResponse>>({});
  const [selectedRelation, setSelectedRelation] = useState<DbfRelation | null>(null);
  const [dbfLoading, setDbfLoading] = useState(false);
  const [dbfError, setDbfError] = useState("");

  const customers = seed.customers;
  const suppliers = seed.suppliers;
  const cont = seed.cont;
  const ledger = seed.ledger;
  const stock = seed.stock;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${DBF_API_BASE}/files`);
        if (!res.ok) throw new Error(`Failed to load DBF files (${res.status})`);
        const data = (await res.json()) as { source: string; tables: DbfFileSummary[] };
        if (!active) return;
        setDbfFiles(data.tables);
        setDbfSource(data.source);
        if (data.tables.length) {
          setSelectedTableName(data.tables[0].table);
        }
      } catch (err) {
        if (!active) return;
        setDbfError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTableName) return;
    let active = true;
    setDbfLoading(true);
    setDbfError("");

    (async () => {
      try {
        const url = `${DBF_API_BASE}/table?name=${encodeURIComponent(selectedTableName)}&page=${dbfPage}&pageSize=50`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load table (${res.status})`);
        const data = (await res.json()) as DbfTableResponse;
        if (!active) return;
        setDbfTable(data);
        setTableMetaCache((prev) => ({ ...prev, [data.table]: data }));
        setSelectedRelation(data.relations[0] ?? null);
      } catch (err) {
        if (!active) return;
        setDbfError(err instanceof Error ? err.message : String(err));
      } finally {
        if (active) setDbfLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedTableName, dbfPage]);

  useEffect(() => {
    if (!selectedRelation?.targetTable) return;
    if (tableMetaCache[selectedRelation.targetTable]) return;

    let active = true;
    (async () => {
      try {
        const url = `${DBF_API_BASE}/table?name=${encodeURIComponent(selectedRelation.targetTable)}&page=1&pageSize=1`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as DbfTableResponse;
        if (!active) return;
        setTableMetaCache((prev) => ({ ...prev, [data.table]: data }));
      } catch {
        // ignore metadata prefetch errors
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedRelation, tableMetaCache]);

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
          <SimpleTable
            title="Recent Cont Entries (Imported)"
            headers={["Date", "Sr No", "ACNO", "Received", "Send", "Sale Amt"]}
            rows={cont.slice(0, 20).map((r) => [
              String(r.DATE ?? ""), String(r.SRNO ?? ""), String(r.ACNO ?? ""), String(r.RECEIVED ?? ""), String(r.SEND ?? ""), money(r.SALE_AMT),
            ])}
          />
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
              <tbody>
                {dbfFiles.map((t) => (
                  <tr key={t.table}><td>{t.table}</td><td>{t.recordCount}</td><td>{t.fieldCount}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    if (activeView === "dbf-explorer") {
      const filteredFiles = dbfFiles.filter((t) =>
        t.table.toLowerCase().includes(tableSearch.toLowerCase()),
      );
      return (
        <section className="window-section">
          <h2>DBF Explorer</h2>
          <p>Source: <code>{dbfSource || "Loading..."}</code></p>
          {dbfError ? <p className="error-text">{dbfError}</p> : null}
          <div className="dbf-layout">
            <aside className="dbf-files">
              <h3>Files ({dbfFiles.length})</h3>
              <input
                className="dbf-search"
                placeholder="Search table..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
              {filteredFiles.map((t) => (
                <button
                  key={t.table}
                  type="button"
                  className={t.table === selectedTableName ? "dbf-file active" : "dbf-file"}
                  onClick={() => {
                    setSelectedTableName(t.table);
                    setDbfPage(1);
                  }}
                >
                  {t.table}
                </button>
              ))}
            </aside>
            <div className="dbf-details">
              {dbfLoading ? <p>Loading table...</p> : null}
              {!dbfLoading && dbfTable ? (
                <>
                  <h3>{dbfTable.table}</h3>
                  <p>Records: {dbfTable.recordCount} | Fields: {dbfTable.fieldCount}</p>

                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Column</th><th>Type</th><th>Size</th></tr></thead>
                      <tbody>
                        {dbfTable.fields.map((f) => (
                          <tr key={f.name}><td>{f.name}</td><td>{f.type}</td><td>{f.size}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3>Real Data</h3>
                  <div className="dbf-pagination">
                    <button type="button" className="secondary-btn" disabled={dbfTable.page <= 1} onClick={() => setDbfPage((p) => Math.max(1, p - 1))}>Prev</button>
                    <span>Page {dbfTable.page} / {dbfTable.totalPages}</span>
                    <button type="button" className="secondary-btn" disabled={dbfTable.page >= dbfTable.totalPages} onClick={() => setDbfPage((p) => Math.min(dbfTable.totalPages, p + 1))}>Next</button>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead><tr>{dbfTable.fields.map((f) => <th key={f.name}>{f.name}</th>)}</tr></thead>
                      <tbody>
                        {dbfTable.rows.map((row, idx) => (
                          <tr key={idx}>
                            {dbfTable.fields.map((f) => (
                              <td key={f.name}>{String(row[f.name] ?? "")}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3>Inferred Relations</h3>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Key</th><th>Target Table</th><th>Target Key</th><th>Type</th></tr></thead>
                      <tbody>
                        {dbfTable.relations.length ? dbfTable.relations.map((r, idx) => (
                          <tr key={`${r.key}-${r.targetTable}-${idx}`}>
                            <td>{r.key}</td>
                            <td>
                              <button
                                type="button"
                                className="link-btn"
                                onClick={() => {
                                  setSelectedTableName(r.targetTable);
                                  setDbfPage(1);
                                }}
                              >
                                {r.targetTable}
                              </button>
                            </td>
                            <td>{r.targetKey}</td>
                            <td>{r.relationType}</td>
                          </tr>
                        )) : <tr><td colSpan={4}>No inferred relations found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    if (activeView === "erd-viewer") {
      const selected = dbfTable;
      const graphNodes =
        selected
          ? [
              { table: selected.table, kind: "center" as const },
              ...selected.relations.map((r) => ({
                table: r.targetTable,
                kind: "related" as const,
                key: r.key,
              })),
            ]
          : [];

      return (
        <section className="window-section">
          <h2>ERD Viewer</h2>
          <p>
            Pick a table from DBF Explorer list, then inspect direct relations here.
          </p>
          <div className="dbf-layout">
            <aside className="dbf-files">
              <h3>Tables ({dbfFiles.length})</h3>
              <input
                className="dbf-search"
                placeholder="Search table..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
              {dbfFiles
                .filter((t) =>
                  t.table.toLowerCase().includes(tableSearch.toLowerCase()),
                )
                .map((t) => (
                  <button
                    key={t.table}
                    type="button"
                    className={
                      t.table === selectedTableName ? "dbf-file active" : "dbf-file"
                    }
                    onClick={() => {
                      setSelectedTableName(t.table);
                      setDbfPage(1);
                    }}
                  >
                    {t.table}
                  </button>
                ))}
            </aside>
            <div className="dbf-details">
              {dbfLoading ? <p>Loading relations...</p> : null}
              {!dbfLoading && selected ? (
                <>
                  <h3>{selected.table}</h3>
                  <p>
                    Direct relations: {selected.relations.length}
                  </p>
                  {selectedRelation ? (
                    <div className="link-inspector">
                      <h3>Link Inspector</h3>
                      <p>
                        {selected.table}.{selectedRelation.key} {"->"}{" "}
                        {selectedRelation.targetTable}.{selectedRelation.targetKey}
                      </p>
                      <div className="link-columns">
                        <div>
                          <h4>{selected.table}</h4>
                          <div className="table-wrap">
                            <table>
                              <thead>
                                <tr>
                                  <th>Column</th>
                                  <th>Type</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selected.fields.map((f) => (
                                  <tr
                                    key={f.name}
                                    className={
                                      f.name === selectedRelation.key ? "active-col-row" : ""
                                    }
                                  >
                                    <td>{f.name}</td>
                                    <td>{f.type}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div>
                          <h4>{selectedRelation.targetTable}</h4>
                          <div className="table-wrap">
                            <table>
                              <thead>
                                <tr>
                                  <th>Column</th>
                                  <th>Type</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(tableMetaCache[selectedRelation.targetTable]?.fields ?? []).map(
                                  (f) => (
                                    <tr
                                      key={f.name}
                                      className={
                                        f.name === selectedRelation.targetKey
                                          ? "active-col-row"
                                          : ""
                                      }
                                    >
                                      <td>{f.name}</td>
                                      <td>{f.type}</td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <h3>Inferred Relations</h3>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>From Table</th>
                          <th>Key</th>
                          <th>To Table</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.relations.length ? (
                          selected.relations.map((r, idx) => (
                            <tr
                              key={`${r.targetTable}-${r.key}-${idx}`}
                              className={
                                selectedRelation?.targetTable === r.targetTable &&
                                selectedRelation?.key === r.key
                                  ? "active-rel-row"
                                  : ""
                              }
                              onClick={() => setSelectedRelation(r)}
                            >
                              <td>{selected.table}</td>
                              <td>{r.key}</td>
                              <td>{r.targetTable}</td>
                              <td>{r.relationType}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4}>No relations found for this table.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="erd-graph">
                    <div className="erd-center">{selected.table}</div>
                    <div className="erd-related-grid">
                      {graphNodes
                        .filter((n) => n.kind === "related")
                        .map((n, idx) => (
                          <button
                            key={`${n.table}-${idx}`}
                            type="button"
                            className="erd-related-node"
                            onClick={() => {
                              setSelectedTableName(n.table);
                              setDbfPage(1);
                            }}
                          >
                            <span>{n.table}</span>
                            <small>{n.key}</small>
                          </button>
                        ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="window-section">
        <h2>Settings</h2>
        <p>DBF Explorer now reads all files dynamically from local DATA via API.</p>
      </section>
    );
  }, [
    activeView,
    cont,
    customers,
    dbfError,
    dbfFiles,
    dbfLoading,
    dbfSource,
    dbfTable,
    ledger,
    selectedRelation,
    selectedTableName,
    stock,
    suppliers,
    tableMetaCache,
    tableSearch,
    totals.inwardQty,
    totals.netValue,
  ]);

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
