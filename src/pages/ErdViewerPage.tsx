import type { DbfRelation, DbfTableResponse } from "../types/app";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
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
    <div className="flex flex-col h-full space-y-4">
      <p className="text-sm text-muted-foreground">Pick a table and inspect links and structure mapping.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="md:col-span-1 flex flex-col min-h-0">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg font-bold">Tables ({dbfFiles.length})</CardTitle>
            <Input
              placeholder="Search table..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
            {dbfFiles
              .filter((t) => t.table.toLowerCase().includes(tableSearch.toLowerCase()))
              .sort((a, b) => b.recordCount - a.recordCount)
              .map((t) => {
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
            {dbfLoading ? <p className="text-sm text-muted-foreground">Loading relations...</p> : null}
            {!dbfLoading && selected ? (
              <>
                <div className="space-y-1 border-b pb-4">
                  <h3 className="text-2xl font-bold tracking-tight">{selected.table}</h3>
                  <p className="text-sm text-muted-foreground">Direct relations: {selected.relations.length}</p>
                </div>

                {selectedRelation ? (
                  <Card className="bg-slate-50/50 dark:bg-slate-900/50">
                    <CardHeader className="p-4 border-b">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Link Inspector</CardTitle>
                      <p className="text-sm font-semibold mt-1">
                        {selected.table}.{selectedRelation.key} {"->"} {selectedRelation.targetTable}.{selectedRelation.targetKey}
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold">{selected.table}</h4>
                        <div className="border rounded-md max-h-[200px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="py-2 h-8">Column</TableHead>
                                <TableHead className="py-2 h-8">Type</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selected.fields.map((f) => (
                                <TableRow
                                  key={f.name}
                                  className={f.name === selectedRelation.key ? "bg-primary/10 hover:bg-primary/15" : ""}
                                >
                                  <TableCell className="py-2 h-8 font-medium">{f.name}</TableCell>
                                  <TableCell className="py-2 h-8 text-muted-foreground">{f.type}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-bold">{selectedRelation.targetTable}</h4>
                        <div className="border rounded-md max-h-[200px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="py-2 h-8">Column</TableHead>
                                <TableHead className="py-2 h-8">Type</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(tableMetaCache[selectedRelation.targetTable]?.fields ?? []).map((f) => (
                                <TableRow
                                  key={f.name}
                                  className={f.name === selectedRelation.targetKey ? "bg-primary/10 hover:bg-primary/15" : ""}
                                >
                                  <TableCell className="py-2 h-8 font-medium">{f.name}</TableCell>
                                  <TableCell className="py-2 h-8 text-muted-foreground">{f.type}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight">Inferred Relations</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>From Table</TableHead>
                          <TableHead>Key</TableHead>
                          <TableHead>To Table</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.relations.length ? (
                          selected.relations.map((r, idx) => {
                            const isSelected = selectedRelation?.targetTable === r.targetTable && selectedRelation?.key === r.key;
                            return (
                              <TableRow
                                key={`${r.targetTable}-${r.key}-${idx}`}
                                onClick={() => setSelectedRelation(r)}
                                className={`cursor-pointer ${isSelected ? "bg-accent text-accent-foreground" : ""}`}
                              >
                                <TableCell className="font-medium">{selected.table}</TableCell>
                                <TableCell>{r.key}</TableCell>
                                <TableCell>{r.targetTable}</TableCell>
                                <TableCell>{r.relationType}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No relations found for this table.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <div className="flex justify-center">
                    <div className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-md shadow-sm">
                      {selected.table}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selected.relations.map((r, idx) => (
                      <Card
                        key={`${r.targetTable}-${idx}`}
                        onClick={() => {
                          setSelectedTableName(r.targetTable);
                          setDbfPage(() => 1);
                        }}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors p-3 flex flex-col justify-between"
                      >
                        <span className="font-semibold text-sm">{r.targetTable}</span>
                        <span className="text-xs text-muted-foreground mt-1">{r.key}</span>
                      </Card>
                    ))}
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
