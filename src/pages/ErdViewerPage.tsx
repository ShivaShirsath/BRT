import type { DbfRelation, DbfTableResponse } from "../types/app";

type Props = {
  dbfFiles: { table: string; recordCount: number; fieldCount: number }[];
  selectedTableName: string;
  setSelectedTableName: (name: string) => void;
  tableSearch: string;
  setTableSearch: (v: string) => void;
  setDbfPage: (updater: (p: number) => number) => void;
  dbfTable: DbfTableResponse | null;
  tableMetaCache: Record<string, DbfTableResponse>;
  selectedRelation: DbfRelation | null;
  setSelectedRelation: (r: DbfRelation) => void;
  dbfLoading: boolean;
};

export function ErdViewerPage(props: Props) {
  const {
    dbfFiles,
    selectedTableName,
    setSelectedTableName,
    tableSearch,
    setTableSearch,
    setDbfPage,
    dbfTable,
    tableMetaCache,
    selectedRelation,
    setSelectedRelation,
    dbfLoading,
  } = props;

  const selected = dbfTable;

  return (
    <section className="window-section full-height">
      <p>Pick a table and inspect links and structure mapping.</p>
      <div className="dbf-layout">
        <aside className="dbf-files">
          <h3>Tables ({dbfFiles.length})</h3>
          <input className="dbf-search" placeholder="Search table..." value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} />
          <div className="dbf-files-list">
            {dbfFiles.filter((t) => t.table.toLowerCase().includes(tableSearch.toLowerCase())).map((t) => (
              <button key={t.table} type="button" className={t.table === selectedTableName ? "dbf-file active" : "dbf-file"} onClick={() => { setSelectedTableName(t.table); setDbfPage(() => 1); }}>
                {t.table}
              </button>
            ))}
          </div>
        </aside>
        <div className="dbf-details">
          {dbfLoading ? <p>Loading relations...</p> : null}
          {!dbfLoading && selected ? (
            <>
              <h3>{selected.table}</h3>
              <p>Direct relations: {selected.relations.length}</p>

              {selectedRelation ? (
                <div className="link-inspector">
                  <h3>Link Inspector</h3>
                  <p>{selected.table}.{selectedRelation.key} {"->"} {selectedRelation.targetTable}.{selectedRelation.targetKey}</p>
                  <div className="link-columns">
                    <div>
                      <h4>{selected.table}</h4>
                      <div className="table-wrap scrollable-y">
                        <table>
                          <thead><tr><th>Column</th><th>Type</th></tr></thead>
                          <tbody>{selected.fields.map((f) => <tr key={f.name} className={f.name === selectedRelation.key ? "active-col-row" : ""}><td>{f.name}</td><td>{f.type}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4>{selectedRelation.targetTable}</h4>
                      <div className="table-wrap scrollable-y">
                        <table>
                          <thead><tr><th>Column</th><th>Type</th></tr></thead>
                          <tbody>{(tableMetaCache[selectedRelation.targetTable]?.fields ?? []).map((f) => <tr key={f.name} className={f.name === selectedRelation.targetKey ? "active-col-row" : ""}><td>{f.name}</td><td>{f.type}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <h3>Inferred Relations</h3>
              <div className="table-wrap scrollable-y">
                <table>
                  <thead><tr><th>From Table</th><th>Key</th><th>To Table</th><th>Type</th></tr></thead>
                  <tbody>
                    {selected.relations.length ? selected.relations.map((r, idx) => (
                      <tr key={`${r.targetTable}-${r.key}-${idx}`} className={selectedRelation?.targetTable === r.targetTable && selectedRelation?.key === r.key ? "active-rel-row" : ""} onClick={() => setSelectedRelation(r)}>
                        <td>{selected.table}</td><td>{r.key}</td><td>{r.targetTable}</td><td>{r.relationType}</td>
                      </tr>
                    )) : <tr><td colSpan={4}>No relations found for this table.</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="erd-graph">
                <div className="erd-center">{selected.table}</div>
                <div className="erd-related-grid">
                  {selected.relations.map((r, idx) => (
                    <button key={`${r.targetTable}-${idx}`} type="button" className="erd-related-node" onClick={() => { setSelectedTableName(r.targetTable); setDbfPage(() => 1); }}>
                      <span>{r.targetTable}</span>
                      <small>{r.key}</small>
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
