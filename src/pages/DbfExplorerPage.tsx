import type { DbfTableResponse } from "../types/app";

type Props = {
  dbfFiles: { table: string; recordCount: number; fieldCount: number }[];
  dbfSource: string;
  selectedTableName: string;
  setSelectedTableName: (name: string) => void;
  tableSearch: string;
  setTableSearch: (v: string) => void;
  dbfPage: number;
  setDbfPage: (updater: (p: number) => number) => void;
  dbfTable: DbfTableResponse | null;
  dbfLoading: boolean;
  dbfError: string;
};

export function DbfExplorerPage(props: Props) {
  const {
    dbfFiles,
    dbfSource,
    selectedTableName,
    setSelectedTableName,
    tableSearch,
    setTableSearch,
    setDbfPage,
    dbfTable,
    dbfLoading,
    dbfError,
  } = props;

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
          <input className="dbf-search" placeholder="Search table..." value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} />
          {filteredFiles.map((t) => (
            <button key={t.table} type="button" className={t.table === selectedTableName ? "dbf-file active" : "dbf-file"} onClick={() => { setSelectedTableName(t.table); setDbfPage(() => 1); }}>
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
                  <tbody>{dbfTable.fields.map((f) => <tr key={f.name}><td>{f.name}</td><td>{f.type}</td><td>{f.size}</td></tr>)}</tbody>
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
                      <tr key={idx}>{dbfTable.fields.map((f) => <td key={f.name}>{String(row[f.name] ?? "")}</td>)}</tr>
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
                        <td><button type="button" className="link-btn" onClick={() => { setSelectedTableName(r.targetTable); setDbfPage(() => 1); }}>{r.targetTable}</button></td>
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
