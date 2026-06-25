import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useViewport } from "../hooks/useViewport";
import { useNetwork } from "../hooks/useNetwork";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useThemeStore, THEMES } from "../store/themeStore";
import { Button } from "../components/ui/button";
import { AccountGenerationModal } from "../components/AccountGenerationModal";
import { useToastStore } from "../store/toastStore";
import api from "../api/client";
import {
  Search,
  Truck,
  UserPlus,
  Package,
  ShoppingCart,
  ClipboardList,
  FileCheck,
  Receipt,
  RefreshCw,
  IndianRupee,
  Wallet,
  Landmark,
  Store,
  Box,
  ArrowDownCircle,
  CheckSquare,
  Layers,
  ArrowUpCircle,
  Train,
  FileLock2,
  AppWindow,
  Coins,
  FileSignature,
  Banknote,
  Award,
  Plus,
  Minus
} from "lucide-react";

export function DataEntryPage() {
  const navigate = useNavigate();
  const { viewportHeight } = useViewport();
  const selectedFirm = useAuthStore((s) => s.selectedFirm);
  const logout = useAuthStore((s) => s.logout);
  const isOnline = useNetwork();

  const themeId = useThemeStore((s) => s.themeId);
  const pendingCount = useLiveQuery(() => db.syncOutbox.count()) ?? 0;
  const addToast = useToastStore((s) => s.addToast);

  const [expandedSection, setExpandedSection] = useState<"Primary" | "Secondary" | "Tertiary">("Primary");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [overallStats, setOverallStats] = useState<any | null>(null);
  const [loadingOverall, setLoadingOverall] = useState(false);

  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year" | "custom">("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const dates = useMemo(() => {
    const now = new Date();
    let start = "";
    let end = "";

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (timeRange === "today") {
      const todayStr = formatDate(now);
      start = todayStr;
      end = todayStr;
    } else if (timeRange === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      start = formatDate(monday);
      end = formatDate(new Date());
    } else if (timeRange === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      start = formatDate(firstDay);
      end = formatDate(new Date());
    } else if (timeRange === "year") {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      start = formatDate(firstDay);
      end = formatDate(new Date());
    } else if (timeRange === "custom") {
      start = customStartDate;
      end = customEndDate;
    }

    return { start, end };
  }, [timeRange, customStartDate, customEndDate]);

  useEffect(() => {
    async function fetchOverall() {
      setLoadingOverall(true);
      try {
        let url = "/purchase/analytics/overall";
        const params = new URLSearchParams();
        if (dates.start) params.append("startDate", dates.start);
        if (dates.end) params.append("endDate", dates.end);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        const { data } = await api.get(url);
        setOverallStats(data || null);
      } catch (err) {
        console.error("Failed to load overall analytics data", err);
      } finally {
        setLoadingOverall(false);
      }
    }
    fetchOverall();
  }, [dates]);

  const handleSaveAccount = async (formData: any) => {
    try {
      const { data } = await api.post("/customers", formData);
      addToast(`Account created successfully for ${data.name}`, "success");
      setIsAccountModalOpen(false);
    } catch (err: any) {
      console.error(err);
      addToast(err?.response?.data?.error || "Failed to create account", "error");
    }
  };

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

  const sections = [
    { id: "Primary", label: "Primary", items: centerItems },
    { id: "Secondary", label: "Secondary", items: quickItems },
    { id: "Tertiary", label: "Tertiary", items: rightItems },
  ] as const;

  const dataEntryCards = [
    { label: "Delivery Challan Entry", icon: Truck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Account Generation", icon: UserPlus, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Dispatch Entry", icon: Package, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { label: "Purchase Bill", icon: ShoppingCart, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Journal Voucher", icon: ClipboardList, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { label: "Cheque Return Entry", icon: FileCheck, color: "text-green-600 bg-green-50 border-green-100" },
    { label: "Sales Patti Entry", icon: Receipt, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { label: "Vapasi Entry", icon: RefreshCw, color: "text-sky-600 bg-sky-50 border-sky-100" },
    { label: "Customer Expenses", icon: IndianRupee, color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
    { label: "Farmer Payment", icon: Wallet, color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
    { label: "Dalal Payment", icon: Coins, color: "text-orange-600 bg-orange-50 border-orange-100" },
    { label: "Opening Balance", icon: Landmark, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Stall Expenses Entry", icon: Store, color: "text-pink-600 bg-pink-50 border-pink-100" },
    { label: "Parcel Expense Entry", icon: Box, color: "text-violet-600 bg-violet-50 border-violet-100" },
    { label: "Multiple Bank address", icon: Landmark, color: "text-slate-600 bg-slate-50 border-slate-100" },
    { label: "Cash Deposit", icon: ArrowDownCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Bank Reconciliation", icon: CheckSquare, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Opening Stock Entry", icon: Layers, color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
    { label: "Cash withdrawal", icon: ArrowUpCircle, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { label: "Accounts Master", icon: UserPlus, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Product Master", icon: Package, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Railway Freight Entry", icon: Train, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Customer Receipt", icon: Banknote, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { label: "Release Records (LAN)", icon: FileLock2, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { label: "Dock Entry", icon: AppWindow, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Miscellaneous Receipt", icon: Coins, color: "text-orange-600 bg-orange-50 border-orange-100" },
    { label: "Contract Entry", icon: FileSignature, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Payment Voucher", icon: Banknote, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { label: "Update Stock", icon: RefreshCw, color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
    { label: "Grading", icon: Award, color: "text-teal-600 bg-teal-50 border-teal-100" }
  ];

  function routeFor(title: string): string | null {
    if (title === "Purchase Bill") return "/purchase";
    if (title === "Sales Patti Entry") return "/sales";
    if (title === "Opening Balance") return "/opening-balances";
    if (title === "Farmer Payment") return "/dalal-payment-1";
    if (title === "Dalal Payment") return "/dalal-payment";
    if (title === "Cash Deposit") return "/cash-deposit";
    if (title === "Cash withdrawal") return "/cash-withdrawal";
    if (title === "Customer Receipt") return "/customer-receipt";
    if (title === "Miscellaneous Receipt") return "/misc-receipt";
    if (title === "Payment Voucher") return "/payment-voucher";
    if (title === "Product Master") return "/product-entry";
    if (title === "Exit") return "/menu";
    return null;
  }

  function handleItemAction(label: string) {
    if (label === "Exit") {
      logout();
      navigate("/auth");
      return;
    }
    const route = routeFor(label);
    if (route) {
      navigate(route);
      return;
    }
    if (label === "Data Entry") {
      navigate("/data-entry");
      return;
    }
    // For other links in sidebar
    if (label === "Sync" || label === "Setup") {
      navigate("/menu");
      return;
    }
  }

  const filteredCards = dataEntryCards.filter((card) =>
    card.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] flex flex-col overflow-hidden" style={{ height: viewportHeight }}>
      {/* Premium Header */}
      <header className="h-16 shrink-0 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between px-8 z-30">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-extrabold tracking-tight text-[#1e3a8a] cursor-pointer" onClick={() => navigate("/menu")}>
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
            onClick={() => navigate("/menu")}
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
                  onClick={() => setExpandedSection(isExpanded ? "Primary" : section.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors ${isExpanded
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
                      const isSelected = item === "Data Entry";
                      return (
                        <div
                          key={item}
                          onClick={() => handleItemAction(item)}
                          className={`text-xs py-1.5 px-3 rounded cursor-pointer font-medium transition-colors ${isSelected
                            ? "bg-slate-200/60 text-[#1e3a8a] font-bold"
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
        <main className="flex-1 bg-[#f3f6fc] p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto flex flex-col space-y-6">

            {/* Title & Search bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                  Data Entry Menu
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select an option below to add or update records
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search Entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
                />
              </div>
            </div>

            {/* Quick Stats Dashboard */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-5 bg-[#1e3a8a] rounded-full" />
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Quick Stats
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Dropdown Selector */}
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/25 text-slate-700 cursor-pointer shadow-sm"
                  >
                    <option value="custom">Custom Range</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>

                  {/* Custom Date Pickers */}
                  {timeRange === "custom" && (
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 w-32 h-[30px] cursor-pointer">
                        <span className="text-[11px] font-semibold text-slate-700 pointer-events-none select-none">
                          {customStartDate ? new Date(customStartDate).toLocaleDateString() : "From Date"}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 pointer-events-none select-none shrink-0 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                      </div>

                      <span className="text-xs text-slate-400 font-bold">to</span>

                      <div className="relative flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 w-32 h-[30px] cursor-pointer">
                        <span className="text-[11px] font-semibold text-slate-700 pointer-events-none select-none">
                          {customEndDate ? new Date(customEndDate).toLocaleDateString() : "To Date"}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 pointer-events-none select-none shrink-0 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                      </div>

                      {(customStartDate || customEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomStartDate("");
                            setCustomEndDate("");
                          }}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/50 px-2 py-1 rounded-lg transition-colors h-[30px]"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] bg-[#1e3a8a]/10 text-[#1e3a8a] px-2.5 py-0.5 rounded-full font-bold">Firm Summary</span>
                </div>
              </div>

              {loadingOverall ? (
                <div className="flex items-center justify-center py-8">
                  <span className="h-6 w-6 rounded-full border-2 border-[#1e3a8a] border-t-transparent animate-spin" />
                </div>
              ) : overallStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Total Purchases Card */}
                  <div className="bg-gradient-to-br from-blue-50/60 to-white border border-blue-100 rounded-xl p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Purchases</span>
                      <span className="text-lg font-extrabold text-blue-700 block">
                        ₹ {(overallStats.totalPurchasesValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {overallStats.totalPurchasesCount || 0} Bills
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Total Sales Card */}
                  <div className="bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-100 rounded-xl p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
                      <span className="text-lg font-extrabold text-emerald-700 block">
                        ₹ {(overallStats.totalSalesValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {overallStats.totalSalesCount || 0} Patti Entries
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Total Farmers Card */}
                  <div className="bg-gradient-to-br from-teal-50/60 to-white border border-teal-100 rounded-xl p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Farmers</span>
                      <span className="text-lg font-extrabold text-teal-700 block">
                        {(overallStats.totalFarmersCount || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Registered customers
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal-100/50 flex items-center justify-center text-teal-600 shrink-0">
                      <UserPlus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Total Vehicles Card */}
                  <div className="bg-gradient-to-br from-sky-50/60 to-white border border-sky-100 rounded-xl p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Vehicles</span>
                      <span className="text-lg font-extrabold text-sky-700 block">
                        {(overallStats.totalVehiclesCount || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Active transport
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-sky-100/50 flex items-center justify-center text-sky-600 shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Combined Volume Card */}
                  <div className="bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-100 rounded-xl p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume</span>
                      <span className="text-lg font-extrabold text-indigo-700 block">
                        {(overallStats.totalBags || 0).toLocaleString("en-IN")} Bags
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Combined volume
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-100/50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Combined Weight Card */}
                  <div className="bg-gradient-to-br from-amber-50/60 to-white border border-amber-100 rounded-xl p-4 flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Weight</span>
                      <span className="text-lg font-extrabold text-amber-700 block">
                        {(overallStats.totalWeight || 0).toFixed(1)} Q
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Total net weight
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-100/50 flex items-center justify-center text-amber-600 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 italic">
                  Failed to load overall business parameters.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCards.map((card) => {
                const IconComponent = card.icon;
                const route = routeFor(card.label);

                const handleCardClick = () => {
                  if (card.label === "Account Generation" || card.label === "Accounts Master") {
                    setIsAccountModalOpen(true);
                  } else if (route) {
                    navigate(route);
                  } else {
                    addToast("This feature is not available yet.", "info");
                  }
                };

                return (
                  <div
                    key={card.label}
                    onClick={handleCardClick}
                    className={`bg-white border border-slate-200/60 rounded-xl p-4 flex items-center space-x-4 shadow-sm select-none transition-all duration-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50/10 hover:shadow-md`}
                  >
                    {/* Circle icon container */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border shrink-0 ${card.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {/* Text Label */}
                    <span className="text-sm font-bold text-slate-700 leading-snug">
                      {card.label}
                    </span>
                  </div>
                );
              })}
              {filteredCards.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-slate-400">
                  No matching entries found
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AccountGenerationModal
        open={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
      />
    </div>
  );
}

