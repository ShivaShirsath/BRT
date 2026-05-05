import { useEffect, useState } from "react";
import type { DbfFileSummary, DbfRelation, DbfTableResponse } from "../types/app";

const DBF_API_BASE = import.meta.env.VITE_DBF_API_BASE ?? "http://127.0.0.1:4001/api/dbf";

export function useDbfData() {
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
        if (data.tables.length) setSelectedTableName(data.tables[0].table);
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

  return {
    dbfFiles,
    dbfSource,
    selectedTableName,
    setSelectedTableName,
    tableSearch,
    setTableSearch,
    dbfPage,
    setDbfPage,
    dbfTable,
    tableMetaCache,
    selectedRelation,
    setSelectedRelation,
    dbfLoading,
    dbfError,
  };
}
