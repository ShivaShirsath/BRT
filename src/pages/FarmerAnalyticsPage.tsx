import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Alert, AlertDescription } from "../components/ui/alert";

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

export function FarmerAnalyticsPage() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FarmerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      if (!farmerId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/purchase/analytics/farmer/${farmerId}`);
        setData(data);
        setError("");
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load farmer analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [farmerId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <span className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-semibold">Loading Farmer Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center justify-center space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || "Farmer ID is missing."}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 shrink-0 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 text-card-foreground shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="h-8">
            ← Back
          </Button>
          <h1 className="text-xl font-extrabold tracking-tight">Farmer Analytics Dashboard</h1>
        </div>
        <div className="bg-[#0f766e] text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wider">
          {data.farmerName}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Farmer Metadata Card */}
        <Card className="bg-card shadow-sm">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Farmer Account Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-bold">Farmer Name</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-base mt-0.5 block">{data.farmerName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block uppercase font-bold">Mobile Number</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-base mt-0.5 block">{data.mobileNo || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block uppercase font-bold">City / Location</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-base mt-0.5 block">{data.city || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block uppercase font-bold">Opening Balance</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-base mt-0.5 block">
                ₹ {data.openingBalance.toFixed(2)} ({data.openingBalanceType === "D" ? "Debit" : "Credit"})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Date Filters */}
        <div className="bg-card border p-4 rounded-xl flex flex-wrap gap-4 items-end shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">From Date</span>
            <div className="relative flex items-center bg-background border rounded-lg px-3 py-1.5 w-40 h-[38px] cursor-pointer">
              <span className="text-sm text-slate-700 dark:text-slate-300 pointer-events-none select-none">
                {startDate ? new Date(startDate).toLocaleDateString() : "Select Date"}
              </span>
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
            <div className="relative flex items-center bg-background border rounded-lg px-3 py-1.5 w-40 h-[38px] cursor-pointer">
              <span className="text-sm text-slate-700 dark:text-slate-300 pointer-events-none select-none">
                {endDate ? new Date(endDate).toLocaleDateString() : "Select Date"}
              </span>
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
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100/50 px-3 py-2 rounded-lg transition-colors h-[38px]"
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
              <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-2">{filteredMetrics.transactions}</span>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-card border-l-4 border-indigo-500">
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Bags Sold/Purchased</span>
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{filteredMetrics.bags}</span>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-card border-l-4 border-emerald-500">
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Net Weight</span>
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{filteredMetrics.weight.toFixed(2)} Qty</span>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-card border-l-4 border-amber-500">
            <CardContent className="p-4 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Transaction Value</span>
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">₹ {filteredMetrics.value.toFixed(2)}</span>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Date</TableHead>
                    <TableHead className="w-28">Type</TableHead>
                    <TableHead className="w-32">Bill / Patti No.</TableHead>
                    <TableHead className="w-32">Vehicle No.</TableHead>
                    <TableHead className="w-24 text-right">Bags</TableHead>
                    <TableHead className="w-32 text-right">Net Wt</TableHead>
                    <TableHead className="w-32 text-right">Amount</TableHead>
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          tx.type === "PURCHASE" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-slate-600 dark:text-slate-400">{tx.billNo}</TableCell>
                      <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{tx.vehicleNo || "N/A"}</TableCell>
                      <TableCell className="text-right font-mono">{tx.bags}</TableCell>
                      <TableCell className="text-right font-mono">{tx.netWeight.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">₹ {tx.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tx.commodities.map((c, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs rounded text-slate-600 dark:text-slate-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No transactions recorded for this farmer in this date range.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
