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
  ).sort((a, b) => b.recordCount - a.recordCount);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter((f) => f.name.toLowerCase().endsWith(".dbf"));
    
    if (files.length === 0) {
      alert("No DBF files found in selected folder.");
      return;
    }

    let successCount = 0;
    for (const file of files) {
      try {
        const response = await fetch(`http://127.0.0.1:4001/api/dbf/upload?name=${encodeURIComponent(file.name)}`, {
          method: "POST",
          body: file,
        });
        if (response.ok) successCount++;
      } catch (err) {
        console.error("Failed to upload", file.name, err);
      }
    }
    alert(`Successfully imported ${successCount} DBF files.`);
    window.location.reload();
  };

  const handleExport = async () => {
    try {
      const res = await fetch("http://127.0.0.1:4001/api/dbf/export", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        alert(`Successfully exported ${data.exported} files to JSON in ${data.exportDir}`);
      } else {
        alert(`Export failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Export error: ${err}`);
    }
  };

  return (
    <section className="window-section full-height">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p>Source: <code>{dbfSource || "Loading..."}</code></p>
        <div style={{ display: "flex", gap: "10px" }}>
          <label className="secondary-btn" style={{ cursor: "pointer", padding: "4px 12px", border: "1px solid #ccc", borderRadius: "4px" }}>
            Import Folder
            {/* @ts-expect-error webkitdirectory is non-standard but supported in most browsers */}
            <input type="file" webkitdirectory="" directory="" multiple onChange={handleImport} style={{ display: "none" }} />
          </label>
          <button type="button" className="secondary-btn" onClick={handleExport}>
            Export to JSON
          </button>
        </div>
      </div>
      {dbfError ? <p className="error-text">{dbfError}</p> : null}
      <div className="dbf-layout">
        <aside className="dbf-files">
          <h3>Files ({dbfFiles.length})</h3>
          <input className="dbf-search" placeholder="Search table..." value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} />
          <div className="dbf-files-list">
            {filteredFiles.map((t) => (
              <button key={t.table} type="button" className={t.table === selectedTableName ? "dbf-file active" : "dbf-file"} onClick={() => { setSelectedTableName(t.table); setDbfPage(() => 1); }} style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <span>{t.table}</span><span style={{
                  fontWeight: 'bold'
                }}>{t.recordCount > 0 ? t.recordCount : ''}</span>
              </button>
            ))}
          </div>
        </aside>
        <div className="dbf-details">
          {dbfLoading ? <p>Loading table...</p> : null}
          {!dbfLoading && dbfTable ? (
            <>
              <h2> {dbfTable.table}</h2>

              <h3>Real Data</h3>
              <div className="table-wrap scrollable-y">
                <table>
                  <thead><tr>{dbfTable.fields.map((f) => <th key={f.name}>{f.name}</th>)}</tr></thead>
                  <tbody>
                    {dbfTable.rows.map((row, idx) => (
                      <tr key={idx}>{dbfTable.fields.map((f) => <td key={f.name}>{String(row[f.name] ?? "")}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {
                dbfTable.totalPages > 1 && (
                  <div className="dbf-pagination">
                    <button type="button" className="secondary-btn" disabled={dbfTable.page <= 1} onClick={() => setDbfPage((p) => Math.max(1, p - 1))}>Prev</button>
                    <span>Page {dbfTable.page} / {dbfTable.totalPages}</span>
                    <button type="button" className="secondary-btn" disabled={dbfTable.page >= dbfTable.totalPages} onClick={() => setDbfPage((p) => Math.min(dbfTable.totalPages, p + 1))}>Next</button>
                  </div>
                )
              }

              <p>Records: {dbfTable.recordCount} | Fields: {dbfTable.fieldCount}</p>
              <div className="dbf-fields-grid">
                {dbfTable.fields.map((f) => (
                  <div key={f.name} className="dbf-field-pill" title={`${f.name} - ${f.type} (${f.size})`}>
                    <span className="field-name">{f.name}</span>
                    <span className="field-info">{f.type}({f.size})</span>
                  </div>
                ))}
              </div>

              <h3>Inferred Relations</h3>
              <div className="table-wrap scrollable-y">
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
    </section >
  );
}
