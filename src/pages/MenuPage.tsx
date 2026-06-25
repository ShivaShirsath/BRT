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
import { Input } from "../components/ui/input";
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
import {
  Users,
  Bell,
  ArrowRightLeft,
  MessageSquare,
  Smartphone,
  Server,
  FileDown,
  Calculator,
  Barcode,
  RefreshCw,
  FileSpreadsheet,
  Database,
  Printer,
  Settings,
  Grid,
  User,
  LogOut,
  Truck,
  FileText,
  FileCheck,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  BookOpen,
  Plus,
  Minus,
  Palette,
  Leaf,
  ShoppingBag
} from "lucide-react";

type MenuItem = { code: string; label: string; route: string; sortOrder: number };

const itemIcons: Record<string, React.ComponentType<any>> = {
  // Primary / Center items
  "Data Entry": Database,
  "Sync": RefreshCw,
  "Printing": Printer,
  "Setup": Settings,
  "Miscellaneous": Grid,
  "Personal": User,
  "Exit": LogOut,

  // Secondary / Quick items
  "Staff Attendance": Users,
  "Reminder Entry": Bell,
  "RTGS": ArrowRightLeft,
  "SMS Menu": MessageSquare,
  "Mobile Menu": Smartphone,
  "Server Menu (CCS)": Server,
  "Import Bills": FileDown,
  "Billing Machine": Calculator,
  "Barcode Stickers": Barcode,
  "Barcode stickers": Barcode,
  "Update Purchase": RefreshCw,
  "Tally Export": FileSpreadsheet,

  // Tertiary / Right items
  "Delivery Challan Entry": Truck,
  "Purchase Bill Entry": FileText,
  "Challan Print": FileCheck,
  "Sale Bill Print": Receipt,
  "VATAV Report": TrendingUp,
  "Javak Report": ArrowUpRight,
  "Akak Report": ArrowDownLeft,
  "Profit/Loss Report": PieChart,
  "Cash Book": BookOpen,
};

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
  const defaultCrop = useThemeStore((s) => s.defaultCrop);
  const setDefaultCrop = useThemeStore((s) => s.setDefaultCrop);
  const purchaseCharges = useThemeStore((s) => s.purchaseCharges);
  const setPurchaseCharges = useThemeStore((s) => s.setPurchaseCharges);
  const salesCharges = useThemeStore((s) => s.salesCharges);
  const setSalesCharges = useThemeStore((s) => s.setSalesCharges);
  const fetchSettingsFromServer = useThemeStore((s) => s.fetchSettingsFromServer);

  const [products, setProducts] = useState<any[]>([]);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [activeSetupTab, setActiveSetupTab] = useState<"theme" | "crop" | "purchase" | "sales">("crop");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    loadProducts();
  }, []);

  const isOnline = useNetwork();
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncingManual, setSyncingManual] = useState(false);

  const pendingCount = useLiveQuery(() => db.syncOutbox.count()) ?? 0;
  const outboxItems = useLiveQuery(() => db.syncOutbox.toArray()) ?? [];
  const cachedPurchases = useLiveQuery(() => db.purchases.toArray()) ?? [];
  const cachedSales = useLiveQuery(() => db.sales.toArray()) ?? [];

  const [expandedSection, setExpandedSection] = useState<"Primary" | "Secondary" | "Tertiary">("Secondary");

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
    fetchSettingsFromServer();
  }, [setMenu, fetchSettingsFromServer]);

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
    "Product Master",
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

  function handleItemAction(label: string) {
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
      return;
    }
    if (label === "Purchase Bill Entry" || label === "Purchase Bill") {
      navigate("/purchase");
      return;
    }
    if (label === "Sale Bill Print" || label === "Sales Patti Entry") {
      navigate("/sales");
      return;
    }
    if (label === "Opening Balance") {
      navigate("/opening-balances");
      return;
    }
    if (label === "Product Master") {
      navigate("/product-entry");
      return;
    }
    if (label === "Dalal Payment") {
      navigate("/dalal-payment");
      return;
    }
    if (label === "Dalal Payment 1") {
      navigate("/dalal-payment-1");
      return;
    }
    if (label === "Cash Deposit") {
      navigate("/cash-deposit");
      return;
    }
    if (label === "Cash Withdrawal") {
      navigate("/cash-withdrawal");
      return;
    }
    if (label === "Customer Receipt") {
      navigate("/customer-receipt");
      return;
    }
    if (label === "Miscellaneous Receipt") {
      navigate("/misc-receipt");
      return;
    }
    if (label === "Payment Voucher") {
      navigate("/payment-voucher");
      return;
    }
  }

  const sections = [
    { id: "Primary", label: "Primary", items: centerItems },
    { id: "Secondary", label: "Secondary", items: quickItems },
    { id: "Tertiary", label: "Tertiary", items: rightItems },
  ] as const;

  const currentSectionItems = sections.find((s) => s.id === expandedSection)?.items ?? [];

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] flex flex-col overflow-hidden" style={{ height: viewportHeight }}>
      {/* Premium Header */}
      <header className="h-16 shrink-0 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between px-8 z-30">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-extrabold tracking-tight text-[#1e3a8a]">
            {selectedFirm?.name?.toUpperCase() || "BRT TRADING CO."}
          </h1>
        </div>

        <div className="text-sm font-semibold text-slate-500">
          Financial Year: 01.04.2025 to 31.03.2026
        </div>

        <div className="flex items-center space-x-6">
          {/* Sync status */}
          <div className="flex items-center space-x-2 border border-slate-200 rounded-full px-3 py-1 bg-slate-50 text-xs font-semibold shadow-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-destructive animate-pulse"}`} />
            <span className="text-slate-600">
              {isOnline ? "Online" : "Offline"} {pendingCount > 0 ? `(${pendingCount})` : ""}
            </span>
          </div>

          {/* Theme display button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveSetupTab("theme");
              setSetupDialogOpen(true);
            }}
            className="font-bold border flex items-center space-x-1.5 h-8 text-xs bg-white shadow-sm"
          >
            <span 
              className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0" 
              style={{ backgroundColor: THEMES.find(t => t.id === themeId)?.colorHex }} 
            />
            <span>Theme / Display</span>
          </Button>

          {/* User profile */}
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-semibold text-slate-600">User Profile</span>
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300 select-none cursor-pointer">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Sidebar + Child Page */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-4 space-y-2 overflow-y-auto shrink-0 select-none">
          {sections.map((section) => {
            const isExpanded = expandedSection === section.id;
            return (
              <div key={section.id} className="flex flex-col">
                <div
                  onClick={() => setExpandedSection(isExpanded ? "Secondary" : section.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors ${
                    isExpanded 
                      ? "bg-slate-100 text-[#1e293b] border border-slate-200" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-dashed border-slate-400 rounded-sm mr-3 flex-shrink-0" />
                    <span>{section.label}</span>
                  </div>
                  {isExpanded ? (
                    <Minus className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="pl-9 pr-2 py-1.5 flex flex-col space-y-1">
                    {section.items.map((item) => {
                      const disabled = item === "Update Purchase";
                      return (
                        <div
                          key={item}
                          onClick={() => !disabled && handleItemAction(item)}
                          className={`text-xs py-1.5 px-2 rounded cursor-pointer font-medium transition-colors ${
                            disabled 
                              ? "text-slate-300 cursor-not-allowed" 
                              : "text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-50"
                          }`}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* Child Page Area */}
        <main className="flex-1 bg-slate-50 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto flex flex-col space-y-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                {expandedSection} Menu
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select an action from the grid below or expand sections in the sidebar
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentSectionItems.map((item) => {
                const IconComponent = itemIcons[item] || Grid;
                const disabled = item === "Update Purchase";

                return (
                  <div
                    key={item}
                    onClick={() => !disabled && handleItemAction(item)}
                    className={`bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm select-none transition-all duration-300 ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-slate-200"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-4 text-[#475569]">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 leading-tight">
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

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
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden flex flex-col h-[550px] bg-white border border-slate-200 shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#1e3a8a]" />
              System Settings & Configuration
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Manage your display preferences, crop defaults, and transaction settings.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar Navigation */}
            <div className="w-64 bg-slate-50 border-r border-slate-150 p-3 flex flex-col space-y-1 shrink-0">
              {[
                { id: "theme", label: "Theme & Display", icon: Palette },
                { id: "crop", label: "Default Crop", icon: Leaf },
                { id: "purchase", label: "Purchase Settings", icon: ShoppingBag },
                { id: "sales", label: "Sales Settings", icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSetupTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSetupTab(tab.id as any)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                      isActive
                        ? "bg-[#1e3a8a] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col">
              <div className="flex-1">
                {activeSetupTab === "theme" && (
                  <div className="space-y-6">
                    {/* Appearance Mode Control */}
                    <div className="space-y-3">
                      <div>
                        <span className="block font-extrabold text-slate-800 text-sm">Appearance Mode</span>
                        <span className="text-xs text-slate-500">Customize how the interface looks on your device.</span>
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
                              className={`py-2 px-3 rounded-lg border text-center transition-all hover:bg-slate-50 font-bold text-xs ${
                                isSelected
                                  ? "border-[#1e3a8a] bg-blue-50/40 text-[#1e3a8a]"
                                  : "border-slate-200 bg-white text-slate-600"
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
                        <span className="block font-extrabold text-slate-800 text-sm">Color Theme</span>
                        <span className="text-xs text-slate-500">Choose your active interface palette.</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {THEMES.map((theme) => {
                          const isSelected = theme.id === themeId;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => setTheme(theme.id)}
                              className={`flex items-center space-x-3 p-2.5 rounded-lg border text-left transition-all hover:bg-slate-50 ${
                                isSelected
                                  ? "border-[#1e3a8a] bg-blue-50/40"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: theme.colorHex }}
                              />
                              <span className="font-bold text-xs text-slate-700">
                                {theme.name.split(" (")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeSetupTab === "crop" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <span className="block font-extrabold text-slate-800 text-sm">Default Crop Selection</span>
                        <span className="text-xs text-slate-500">Pre-fill the first commodity row on new Purchase entries automatically.</span>
                      </div>
                      <select
                        value={defaultCrop}
                        onChange={(e) => setDefaultCrop(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold outline-none focus:border-[#1e3a8a] text-slate-700 cursor-pointer shadow-sm"
                      >
                        <option value="">None (Empty by default)</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.englishName}>
                            {p.englishName} {p.marathiName ? `(${p.marathiName})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {activeSetupTab === "purchase" && (
                  <div className="space-y-4">
                    <div>
                      <span className="block font-extrabold text-slate-800 text-sm">Default Purchase Charges & Taxes</span>
                      <span className="text-xs text-slate-500">Configure default values for charges and taxes automatically applied to new purchase bills.</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-h-[310px] overflow-y-auto pr-1">
                      {Object.keys(purchaseCharges).map((field) => (
                        <div key={field} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block truncate" title={field}>
                            {field}
                          </label>
                          <Input
                            type="text"
                            value={purchaseCharges[field] ?? "0.00"}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                              setPurchaseCharges({
                                ...purchaseCharges,
                                [field]: cleaned
                              });
                            }}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSetupTab === "sales" && (
                  <div className="space-y-4">
                    <div>
                      <span className="block font-extrabold text-slate-800 text-sm">Default Sales Charges & Deductions</span>
                      <span className="text-xs text-slate-500">Configure default values automatically applied to new patti rows.</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Patti Freight</label>
                        <Input
                          type="text"
                          value={salesCharges["pattiFreight"] ?? "0.00"}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                            setSalesCharges({
                              ...salesCharges,
                              pattiFreight: cleaned
                            });
                          }}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Commission</label>
                        <Input
                          type="text"
                          value={salesCharges["commission"] ?? "0.00"}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                            setSalesCharges({
                              ...salesCharges,
                              commission: cleaned
                            });
                          }}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">TDS %</label>
                        <Input
                          type="text"
                          value={salesCharges["tdsPercent"] ?? "0.00"}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                            setSalesCharges({
                              ...salesCharges,
                              tdsPercent: cleaned
                            });
                          }}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end shrink-0">
                <Button onClick={() => setSetupDialogOpen(false)} className="px-6 font-bold bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
