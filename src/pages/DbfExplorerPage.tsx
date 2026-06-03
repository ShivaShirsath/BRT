import type { DbfTableResponse } from "../types/app";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

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
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 border rounded-lg">
        <p className="text-sm font-medium">
          Source: <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">{dbfSource || "Loading..."}</code>
        </p>
        <div className="flex gap-2">
          <label className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
            Import Folder
            {/* @ts-expect-error webkitdirectory is non-standard but supported in most browsers */}
            <input type="file" webkitdirectory="" directory="" multiple onChange={handleImport} className="hidden" />
          </label>
          <Button variant="outline" onClick={handleExport}>
            Export to JSON
          </Button>
        </div>
      </div>

      {dbfError && (
        <Alert variant="destructive">
          <AlertDescription>{dbfError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="md:col-span-1 flex flex-col min-h-0">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg font-bold">Files ({dbfFiles.length})</CardTitle>
            <Input
              placeholder="Search table..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
            {filteredFiles.map((t) => {
              const active = t.table === selectedTableName;
              return (
                <Button
                  key={t.table}
                  variant={active ? "default" : "ghost"}
                  onClick={() => {
                    setSelectedTableName(t.table);
                    setDbfPage(() => 1);
                  }}
                  className="w-full justify-between h-10 px-3 text-sm font-medium"
                >
                  <span>{t.table}</span>
                  <span className={active ? "text-slate-100" : "text-muted-foreground font-bold"}>
                    {t.recordCount > 0 ? t.recordCount : ""}
                  </span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 flex flex-col min-h-0 overflow-y-auto">
          <CardContent className="p-6 space-y-6">
            {dbfLoading ? <p className="text-sm text-muted-foreground">Loading table...</p> : null}
            {!dbfLoading && dbfTable ? (
              <>
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold tracking-tight">{dbfTable.table}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Records: {dbfTable.recordCount} | Fields: {dbfTable.fieldCount}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight">Real Data</h3>
                  <div className="border rounded-md max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {dbfTable.fields.map((f) => (
                            <TableHead key={f.name}>{f.name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dbfTable.rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {dbfTable.fields.map((f) => (
                              <TableCell key={f.name} className="font-mono text-xs">
                                {String(row[f.name] ?? "")}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {dbfTable.totalPages > 1 && (
                    <div className="flex items-center space-x-2 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={dbfTable.page <= 1}
                        onClick={() => setDbfPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {dbfTable.page} / {dbfTable.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={dbfTable.page >= dbfTable.totalPages}
                        onClick={() => setDbfPage((p) => Math.min(dbfTable.totalPages, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight">Fields Structure</h3>
                  <div className="flex flex-wrap gap-2">
                    {dbfTable.fields.map((f) => (
                      <div
                        key={f.name}
                        title={`${f.name} - ${f.type} (${f.size})`}
                        className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">{f.name}</span>
                        <span className="text-muted-foreground">
                          {f.type}({f.size})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight">Inferred Relations</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Target Table</TableHead>
                          <TableHead>Target Key</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dbfTable.relations.length ? (
                          dbfTable.relations.map((r, idx) => (
                            <TableRow key={`${r.key}-${r.targetTable}-${idx}`}>
                              <TableCell className="font-semibold">{r.key}</TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  className="h-auto p-0 font-semibold"
                                  onClick={() => {
                                    setSelectedTableName(r.targetTable);
                                    setDbfPage(() => 1);
                                  }}
                                >
                                  {r.targetTable}
                                </Button>
                              </TableCell>
                              <TableCell>{r.targetKey}</TableCell>
                              <TableCell>{r.relationType}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                              No inferred relations found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
