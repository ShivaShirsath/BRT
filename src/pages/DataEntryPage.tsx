import { useState } from "react";
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

