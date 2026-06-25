import { useEffect, useState, useMemo } from "react";
import api from "../api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";

interface Transaction {
  id: string;
  billNo: string;
  date: string;
  type: "PURCHASE" | "SALE";
  vehicleNo: string;
  bags: number;
  netWeight: number;
  amount: number;
  commodities: string[];
}

interface FarmerAnalytics {
  farmerId: number;
  farmerName: string;
  mobileNo: string;
  city: string;
  openingBalance: number;
  openingBalanceType: string;
  totalTransactions: number;
  totalBags: number;
  totalWeight: number;
  totalValue: number;
  transactions: Transaction[];
}

interface FarmerAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  farmerId: number | null;
}

export function FarmerAnalyticsModal({ open, onClose, farmerId }: FarmerAnalyticsModalProps) {
  const [data, setData] = useState<FarmerAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      if (!open || !farmerId) return;
      setLoading(true);
      setError("");
      setStartDate("");
      setEndDate("");
      try {
        const { data } = await api.get(`/purchase/analytics/farmer/${farmerId}`);
        setData(data);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load farmer analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [open, farmerId]);

  const filteredTransactions = useMemo(() => {
    if (!data) return [];
    return data.transactions.filter((tx) => {
      if (!tx.date) return true;
      const txDate = new Date(tx.date);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) return false;
      }
      return true;
    });
  }, [data, startDate, endDate]);

  const filteredMetrics = useMemo(() => {
    if (!data) return { transactions: 0, bags: 0, weight: 0, value: 0 };
    let bags = 0;
    let weight = 0;
    let value = 0;
    filteredTransactions.forEach((tx) => {
      bags += tx.bags || 0;
      weight += tx.netWeight || 0;
      value += tx.amount || 0;
    });
    return {
      transactions: filteredTransactions.length,
      bags,
      weight,
      value
    };
  }, [data, filteredTransactions]);

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-extrabold tracking-tight">Farmer Analytics Dashboard</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Farmer account profile and historical transactions.
              </DialogDescription>
            </div>
            {data && (
              <div className="bg-[#0f766e] text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mr-6">
                {data.farmerName}
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground font-semibold">Loading Farmer Analytics...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data ? (
          <div className="space-y-6">
            {/* Profile Info */}
            <Card className="bg-card shadow-sm border-slate-200">
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Farmer Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{data.farmerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Mobile Number</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{data.mobileNo || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">City / Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{data.city || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Opening Balance</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
                    ₹ {data.openingBalance.toFixed(2)} ({data.openingBalanceType === "D" ? "Debit" : "Credit"})
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Date Filters */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 p-4 rounded-xl flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">From Date</span>
                <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200 rounded-lg px-3 py-1.5 w-40 h-[38px] cursor-pointer">
                  <span className="text-sm text-slate-700 dark:text-slate-300 pointer-events-none select-none">
                    {startDate ? new Date(startDate).toLocaleDateString() : "Select Date"}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 pointer-events-none select-none shrink-0 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">To Date</span>
                <div className="relative flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200 rounded-lg px-3 py-1.5 w-40 h-[38px] cursor-pointer">
                  <span className="text-sm text-slate-700 dark:text-slate-300 pointer-events-none select-none">
                    {endDate ? new Date(endDate).toLocaleDateString() : "Select Date"}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 pointer-events-none select-none shrink-0 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/50 px-3 py-2 rounded-lg transition-colors h-[38px]"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-teal-50 to-white dark:from-slate-900 dark:to-card border-l-4 border-teal-500">
                <CardContent className="p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Bills</span>
                  <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{filteredMetrics.transactions}</span>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-card border-l-4 border-indigo-500">
                <CardContent className="p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Bags</span>
                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{filteredMetrics.bags}</span>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-card border-l-4 border-emerald-500">
                <CardContent className="p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Net Weight</span>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{filteredMetrics.weight.toFixed(1)} Q</span>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-card border-l-4 border-amber-500">
                <CardContent className="p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Value</span>
                  <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">₹ {filteredMetrics.value.toFixed(0)}</span>
                </CardContent>
              </Card>
            </div>

            {/* History Table */}
            <div className="border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Date</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead className="w-28">Bill No.</TableHead>
                      <TableHead className="w-32">Vehicle No.</TableHead>
                      <TableHead className="w-20 text-right">Bags</TableHead>
                      <TableHead className="w-24 text-right">Net Wt</TableHead>
                      <TableHead className="w-28 text-right">Amount</TableHead>
                      <TableHead>Commodities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap">
                          {tx.date ? new Date(tx.date).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === "PURCHASE" 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            {tx.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-xs text-slate-600 dark:text-slate-400">{tx.billNo}</TableCell>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">{tx.vehicleNo || "N/A"}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{tx.bags}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{tx.netWeight.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold">₹ {tx.amount.toFixed(0)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {tx.commodities.map((c, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-600 dark:text-slate-300">
                                {c}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground text-xs">
                          No transactions recorded for this farmer in this date range.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-xs">
            No farmer details provided.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
