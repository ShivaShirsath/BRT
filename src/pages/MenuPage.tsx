import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useNetwork } from "../hooks/useNetwork";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { triggerSync } from "../api/syncEngine";
import { Button } from "../components/ui/button";
import { useViewport } from "../hooks/useViewport";
import { Card } from "../components/ui/card";
import { useThemeStore, THEMES } from "../store/themeStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

type MenuItem = { code: string; label: string; route: string; sortOrder: number };

export function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const { viewportHeight } = useViewport();
  const setMenu = useAuthStore((s) => s.setMenu);
  const selectedFirm = useAuthStore((s) => s.selectedFirm);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);

  const [setupDialogOpen, setSetupDialogOpen] = useState(false);

  const isOnline = useNetwork();
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncingManual, setSyncingManual] = useState(false);

  const pendingCount = useLiveQuery(() => db.syncOutbox.count()) ?? 0;
  const outboxItems = useLiveQuery(() => db.syncOutbox.toArray()) ?? [];
  const cachedPurchases = useLiveQuery(() => db.purchases.toArray()) ?? [];
  const cachedSales = useLiveQuery(() => db.sales.toArray()) ?? [];

  async function handleManualSync() {
    setSyncingManual(true);
    try {
      await triggerSync();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingManual(false);
    }
  }

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/menu");
      const menu = (data.items ?? []) as MenuItem[];
      setItems(menu);
      setMenu(menu);
    })();
  }, [setMenu]);

  const quickItems = [
    "Staff Attendance",
    "Reminder Entry",
    "RTGS",
    "SMS Menu",
    "Mobile Menu",
    "Server Menu (CCS)",
    "Import Bills",
    "Billing Machine",
    "Barcode Stickers",
    "Update Purchase",
    "Tally Export",
  ];

  const centerItems = ["Data Entry", "Sync", "Printing", "Setup", "Miscellaneous", "Personal", "Exit"];
  const rightItems = [
    "Delivery Challan Entry",
    "Purchase Bill Entry",
    "Challan Print",
    "Sale Bill Print",
    "VATAV Report",
    "Javak Report",
    "Akak Report",
    "Profit/Loss Report",
    "Cash Book",
  ];

  function onMainAction(label: string) {
    if (label === "Exit") {
      logout();
      navigate("/auth");
      return;
    }
    if (label === "Sync") {
      setSyncDialogOpen(true);
      return;
    }
    if (label === "Setup") {
      setSetupDialogOpen(true);
      return;
    }
    if (label === "Data Entry") {
      const hasPurchase = items.some((i) => i.route === "/purchase");
      const hasSales = items.some((i) => i.route === "/sales");
      if (hasPurchase || hasSales) {
        navigate("/data-entry");
      }
    }
  }

  return (
    <div className="bg-background text-foreground flex flex-col overflow-hidden" style={{ height: viewportHeight }}>
      <header className="sticky top-0 z-40 shrink-0 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 text-card-foreground shadow-sm py-6 px-6 text-center relative">
        <div className="absolute top-4 left-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSetupDialogOpen(true)}
            className="font-bold border flex items-center space-x-1.5 h-8 text-xs bg-background shadow-sm"
          >
            <span 
              className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0" 
              style={{ backgroundColor: THEMES.find(t => t.id === themeId)?.colorHex }} 
            />
            <span>Theme / Display</span>
          </Button>
        </div>
        <div className="absolute top-4 right-4 flex items-center space-x-2 border rounded-full px-3 py-1 bg-background text-xs font-semibold shadow-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-destructive animate-pulse"}`} />
          <span className="text-muted-foreground">
            {isOnline ? "Online" : "Offline"} {pendingCount > 0 ? `(${pendingCount} pending)` : ""}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {selectedFirm?.name?.toUpperCase() || "BRT TRADING CO."}
        </h1>
        <p className="text-sm font-semibold text-muted-foreground mt-1">
          Financial Year: 01.04.2025 to 31.03.2026
        </p>
      </header>

      <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="flex flex-col space-y-2">
          {quickItems.map((item) => {
            const disabled = item === "Update Purchase";
            return (
              <Button
                key={item}
                variant="outline"
                disabled={disabled}
                className="w-full justify-start h-12 text-sm font-medium px-4 border"
              >
                {item}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-col space-y-2">
          {centerItems.map((item, idx) => {
            const active = idx === 0;
            return (
              <Button
                key={item}
                variant={active ? "default" : "outline"}
                onClick={() => onMainAction(item)}
                className="w-full h-14 text-lg font-bold border"
              >
                {item}
              </Button>
            );
          })}
        </div>

        <Card className="bg-slate-900 text-slate-50 border-0 p-6 flex flex-col space-y-4 shadow-lg">
          <div className="bg-primary-foreground/20 text-white font-extrabold px-4 py-2 rounded-md shadow-sm self-start">
            Contract Expired
          </div>
          <div className="flex flex-col space-y-3 pt-2">
            {rightItems.map((item) => (
              <span key={item} className="text-base font-semibold tracking-wide text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </Card>
      </main>

      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Data Synchronization Status</DialogTitle>
            <DialogDescription>
              Check connection and pending synchronization records for local database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 my-4">
            <Card className={`p-4 flex flex-col items-center justify-center text-center ${isOnline ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20" : "bg-destructive/5 border-destructive/20"}`}>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connection State</span>
              <span className={`text-2xl font-bold mt-1 ${isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center bg-muted/30">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Outbox Queue</span>
              <span className="text-2xl font-bold mt-1 text-foreground">{pendingCount} records</span>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Purchase Entries Cache</h4>
              {cachedPurchases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">No purchase entries stored locally</p>
              ) : (
                <div className="border rounded-md max-h-[150px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="py-2 h-8">Voucher No.</TableHead>
                        <TableHead className="py-2 h-8">Type</TableHead>
                        <TableHead className="py-2 h-8">Status</TableHead>
                        <TableHead className="py-2 h-8">Sync Error / Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cachedPurchases.map((p) => {
                        const isPending = outboxItems.some((item) => item.payload.id === p.id);
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="py-2 h-8 font-medium">{p.billNo}</TableCell>
                            <TableCell className="py-2 h-8">Purchase</TableCell>
                            <TableCell className="py-2 h-8">
                              <span className={`font-semibold ${p.synced ? "text-emerald-600 dark:text-emerald-400" : (isPending ? "text-amber-600" : "text-destructive")}`}>
                                {p.synced ? "Synced" : (isPending ? "Pending Sync" : "Error")}
                              </span>
                            </TableCell>
                            <TableCell className={`py-2 h-8 text-xs ${p.syncError ? "text-destructive" : "text-muted-foreground"}`}>
                              {p.syncError || (p.synced ? "Success" : "Waiting for network...")}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Sales Entries Cache</h4>
              {cachedSales.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">No sales entries stored locally</p>
              ) : (
                <div className="border rounded-md max-h-[150px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="py-2 h-8">Voucher No.</TableHead>
                        <TableHead className="py-2 h-8">Type</TableHead>
                        <TableHead className="py-2 h-8">Status</TableHead>
                        <TableHead className="py-2 h-8">Sync Error / Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cachedSales.map((s) => {
                        const isPending = outboxItems.some((item) => item.payload.id === s.id);
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="py-2 h-8 font-medium">{s.billNo}</TableCell>
                            <TableCell className="py-2 h-8">Sale</TableCell>
                            <TableCell className="py-2 h-8">
                              <span className={`font-semibold ${s.synced ? "text-emerald-600 dark:text-emerald-400" : (isPending ? "text-amber-600" : "text-destructive")}`}>
                                {s.synced ? "Synced" : (isPending ? "Pending Sync" : "Error")}
                              </span>
                            </TableCell>
                            <TableCell className={`py-2 h-8 text-xs ${s.syncError ? "text-destructive" : "text-muted-foreground"}`}>
                              {s.syncError || (s.synced ? "Success" : "Waiting for network...")}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={handleManualSync}
              disabled={syncingManual || !isOnline || pendingCount === 0}
            >
              {syncingManual ? "Syncing..." : "Sync Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">System Configuration</DialogTitle>
            <DialogDescription>
              Personalize your display options, active color theme, and appearance settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 my-4">
            {/* Appearance Mode Control */}
            <div className="space-y-3 border-b pb-4">
              <div>
                <span className="block font-bold text-foreground">Appearance</span>
                <span className="text-xs text-muted-foreground">Customize how the interface looks on your device.</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: "light", label: "Light" },
                  { mode: "dark", label: "Dark" },
                  { mode: "system", label: "System" }
                ].map(({ mode, label }) => {
                  const isSelected = themeMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setThemeMode(mode as any)}
                      className={`py-2 px-3 rounded-lg border-2 text-center transition-all hover:bg-muted font-bold text-sm ${
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-sm text-foreground" 
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Color Selector */}
            <div className="space-y-3">
              <div>
                <span className="block font-bold text-foreground">Color Theme</span>
                <span className="text-xs text-muted-foreground">Choose your active interface palette.</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {THEMES.map((theme) => {
                  const isSelected = theme.id === themeId;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 text-left transition-all hover:bg-muted ${
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-border bg-card"
                      }`}
                    >
                      <span 
                        className="h-4 w-4 rounded-full border border-black/10 shrink-0" 
                        style={{ backgroundColor: theme.colorHex }}
                      />
                      <span className="font-bold text-sm text-foreground">
                        {theme.name.split(" (")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setSetupDialogOpen(false)} className="w-full font-bold">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
