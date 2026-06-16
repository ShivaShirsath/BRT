import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";

import api from "../api/client";

interface Denominations {
  "2000": number;
  "500": number;
  "200": number;
  "100": number;
  "50": number;
  "20": number;
  "10": number;
  "5": number;
  "2": number;
  "1": number;
}

interface CashWithdrawal {
  id?: number;
  voucherNo: string;
  date: string;
  createdBy: string;
  bankAccount: string;
  currentBalance: string;
  amount: string;
  refNo: string;
  narration: string;
  denominations: Denominations;
  quickBank: string;
}

function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

const defaultDenominations = (): Denominations => ({
  "2000": 0,
  "500": 0,
  "200": 0,
  "100": 0,
  "50": 0,
  "20": 0,
  "10": 0,
  "5": 0,
  "2": 0,
  "1": 0,
});

export function CashWithdrawalPage() {
  const navigate = useNavigate();
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  // Top header states
  const [voucherNoInput, setVoucherNoInput] = useState("00024");
  const [date, setDate] = useState(getTodayDateString());
  const [createdBy, setCreatedBy] = useState("System Admin");
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [withdrawals, setWithdrawals] = useState<CashWithdrawal[]>([]);

  // Main details states
  const [bankAccount, setBankAccount] = useState("Select bank account...");
  const [currentBalance, setCurrentBalance] = useState("0.00");
  const [amount, setAmount] = useState("0.00");
  const [refNo, setRefNo] = useState("");
  const [narration, setNarration] = useState("");
  const [quickBank, setQuickBank] = useState("Bank 1");

  // Cash Details Dialog states
  const [isCashDetailsOpen, setIsCashDetailsOpen] = useState(false);
  const [denominations, setDenominations] = useState<Denominations>(defaultDenominations());

  // Alerts
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toIsoDate(ddmmyyyy: string) {
    const p = ddmmyyyy.split(".");
    if (p.length !== 3) return new Date().toISOString().slice(0, 10);
    return `${p[2]}-${p[1]}-${p[0]}`;
  }

  function fromIsoDate(yyyyMMdd: string) {
    if (!yyyyMMdd) return "";
    const p = yyyyMMdd.split("-");
    if (p.length !== 3) return yyyyMMdd;
    return `${p[2]}.${p[1]}.${p[0]}`;
  }

  // Fetch withdrawals from API
  const loadWithdrawals = async () => {
    try {
      const { data } = await api.get("/cash-withdrawal");
      if (data) {
        const mapped = data.map((w: any) => {
          let denoms = defaultDenominations();
          if (w.denominationsJson) {
            try {
              denoms = JSON.parse(w.denominationsJson);
            } catch (e) {
              console.error(e);
            }
          }
          return {
            id: w.id,
            voucherNo: w.voucherNo,
            date: fromIsoDate(w.businessDate),
            createdBy: w.createdBy,
            bankAccount: w.bankAccount,
            currentBalance: String(w.currentBalance || "0.00"),
            amount: String(w.amount || "0.00"),
            refNo: w.refNo || "",
            narration: w.narration,
            denominations: denoms,
            quickBank: w.quickBank || "Bank 1"
          };
        });
        setWithdrawals(mapped);
      }
    } catch (err) {
      console.error("Failed to load cash withdrawals", err);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  // Picker value calculation
  const pickerValue = (() => {
    const parts = date.split(".");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      if (year.length === 4 && !isNaN(Number(day)) && !isNaN(Number(month)) && !isNaN(Number(year))) {
        return `${year}-${month}-${day}`;
      }
    }
    return "";
  })();

  // Filter list
  const filteredWithdrawals = useMemo(() => {
    if (!voucherNoInput.trim()) return withdrawals;
    return withdrawals.filter((w) => w.voucherNo.includes(voucherNoInput.trim()));
  }, [withdrawals, voucherNoInput]);

  // Denominations total calculator
  const calculatedTotal = useMemo(() => {
    return Object.entries(denominations).reduce(
      (sum, [key, count]) => sum + parseInt(key) * (count || 0),
      0
    );
  }, [denominations]);

  // Check if denominations have values
  const hasDenominations = useMemo(() => {
    return Object.values(denominations).some((count) => count > 0);
  }, [denominations]);

  // Load selected voucher
  const handleLoadWithdrawal = (w: CashWithdrawal) => {
    setVoucherNoInput(w.voucherNo);
    setDate(w.date);
    setCreatedBy(w.createdBy);
    setBankAccount(w.bankAccount);
    setCurrentBalance(w.currentBalance);
    setAmount(w.amount);
    setRefNo(w.refNo || "");
    setNarration(w.narration);
    setDenominations(w.denominations || defaultDenominations());
    setQuickBank(w.quickBank || "Bank 1");
    setShowVoucherList(false);
  };

  // Auto load if exact matches
  useEffect(() => {
    if (voucherNoInput) {
      const match = withdrawals.find((w) => w.voucherNo === voucherNoInput.trim());
      if (match) {
        handleLoadWithdrawal(match);
      }
    }
  }, [voucherNoInput, withdrawals]);

  // Save withdrawal
  const onSave = async () => {
    setError("");
    setMessage("");

    if (!voucherNoInput.trim()) {
      setError("Voucher number is required.");
      return;
    }

    if (bankAccount === "Select bank account...") {
      setError("Please select a bank account.");
      return;
    }

    const payload = {
      voucherNo: voucherNoInput.trim(),
      businessDate: toIsoDate(date),
      createdBy,
      bankAccount,
      currentBalance: parseFloat(currentBalance) || 0,
      amount: parseFloat(amount) || 0,
      refNo,
      narration,
      denominationsJson: JSON.stringify(denominations),
      quickBank,
    };

    try {
      const match = withdrawals.find((w) => w.voucherNo === payload.voucherNo);
      if (match && match.id) {
        await api.put(`/cash-withdrawal/${match.id}`, payload);
        setMessage(`Voucher ${payload.voucherNo} updated successfully.`);
      } else {
        await api.post("/cash-withdrawal", payload);
        setMessage(`Voucher ${payload.voucherNo} saved successfully.`);
      }
      loadWithdrawals();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save withdrawal.");
    }
  };

  // Delete withdrawal
  const onDelete = async () => {
    setError("");
    setMessage("");
    const num = voucherNoInput.trim();
    if (!num) return;

    const match = withdrawals.find((w) => w.voucherNo === num);
    if (!match || !match.id) {
      setError("Cannot delete an unsaved voucher.");
      return;
    }

    try {
      await api.delete(`/cash-withdrawal/${match.id}`);
      setMessage(`Voucher ${num} deleted successfully.`);
      loadWithdrawals();

      // Reset Form
      setVoucherNoInput("");
      setDate(getTodayDateString());
      setCreatedBy("System Admin");
      setBankAccount("Select bank account...");
      setCurrentBalance("0.00");
      setAmount("0.00");
      setRefNo("");
      setNarration("");
      setDenominations(defaultDenominations());
      setQuickBank("Bank 1");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete withdrawal.");
    }
  };

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        onSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [voucherNoInput, date, createdBy, bankAccount, currentBalance, amount, refNo, narration, denominations, quickBank, withdrawals]);

  // Handle count change
  const handleCountChange = (denom: keyof Denominations, val: string) => {
    const count = parseInt(val) || 0;
    setDenominations((prev) => ({
      ...prev,
      [denom]: count,
    }));
  };

  // Apply denomination totals to denomination field
  const handleApplyCashDetails = () => {
    setIsCashDetailsOpen(false);
  };

  // Reset/New Voucher helper
  const handleNewVoucher = () => {
    const nextNo = withdrawals.length > 0 
      ? String(Math.max(...withdrawals.map(w => parseInt(w.voucherNo) || 0)) + 1).padStart(5, "0")
      : "00025";
    
    setVoucherNoInput(nextNo);
    setDate(getTodayDateString());
    setCreatedBy("System Admin");
    setBankAccount("Select bank account...");
    setCurrentBalance("0.00");
    setAmount("0.00");
    setRefNo("");
    setNarration("");
    setDenominations(defaultDenominations());
    setQuickBank("Bank 1");
    setMessage("New voucher initialized.");
  };

  const withdrawalExists = useMemo(() => {
    return withdrawals.some((w) => w.voucherNo === voucherNoInput.trim());
  }, [withdrawals, voucherNoInput]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none pb-8">
      {/* Header */}
      <header className="border-b bg-white shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Cash Withdrawal From Bank</h1>
        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-slate-50 text-xs font-semibold shadow-xs">
          <span className="text-slate-500">FY 2025-26</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1300px] w-full mx-auto p-6 space-y-4">
        {/* Title row with + New Voucher */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-700 tracking-wide uppercase">CASH WITHDRAWL FROM BANK</h2>
          <Button
            onClick={handleNewVoucher}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 flex items-center gap-1.5"
          >
            + New Voucher
          </Button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>{selectedFirm?.name || "BRT Trading Co."}</span>
          <span>›</span>
          <span>Data Entry</span>
          <span>›</span>
          <span className="text-slate-900 font-bold">Cash Withdrawl From Bank</span>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Card 1: Voucher Details */}
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Voucher No. with navigation arrows */}
            <div className="md:col-span-4 flex items-center gap-2 relative">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Voucher No.</span>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseInt(voucherNoInput) || 0;
                    if (parsed > 1) {
                      const nextVal = String(parsed - 1).padStart(5, "0");
                      setVoucherNoInput(nextVal);
                    }
                  }}
                  className="px-2 py-1.5 border border-slate-200 rounded-l hover:bg-slate-50 bg-white"
                >
                  &lt;
                </button>
                <Input
                  value={voucherNoInput}
                  onChange={(e) => {
                    setVoucherNoInput(e.target.value);
                    setShowVoucherList(true);
                  }}
                  onFocus={() => setShowVoucherList(true)}
                  onBlur={() => {
                    setTimeout(() => setShowVoucherList(false), 200);
                  }}
                  className="w-24 text-center font-mono rounded-none border-x-0 bg-white text-emerald-600 font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseInt(voucherNoInput) || 0;
                    const nextVal = String(parsed + 1).padStart(5, "0");
                    setVoucherNoInput(nextVal);
                  }}
                  className="px-2 py-1.5 border border-slate-200 rounded-r hover:bg-slate-50 bg-white"
                >
                  &gt;
                </button>
              </div>

              {/* List Vouchers dropdown */}
              {showVoucherList && (
                <div className="absolute top-full left-[95px] z-50 w-48 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredWithdrawals.map((w) => (
                    <div
                      key={w.voucherNo}
                      onMouseDown={() => handleLoadWithdrawal(w)}
                      className="px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 flex justify-between font-mono border-b border-slate-100"
                    >
                      <span className="font-semibold text-slate-800">{w.voucherNo}</span>
                      <span className="text-slate-400">{w.date}</span>
                    </div>
                  ))}
                  {filteredWithdrawals.length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400 text-center">No saved vouchers</div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoucherList(!showVoucherList)}
                className="flex items-center gap-1 text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
              >
                List
              </Button>
            </div>

            {/* Date */}
            <div className="md:col-span-4 flex items-center gap-2 relative">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</span>
              <div className="relative flex-1 flex items-center">
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pr-10 w-full text-xs font-mono tracking-wider bg-white"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <input
                    type="date"
                    value={pickerValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const parts = val.split("-");
                        if (parts.length === 3) {
                          setDate(`${parts[2]}.${parts[1]}.${parts[0]}`);
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Created By */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Created by</span>
              <Input
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full text-xs font-mono bg-white text-slate-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Main Details & Transaction Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left details entry */}
          <Card className="lg:col-span-8 bg-sky-50/20 border-slate-200 shadow-sm">
            <CardContent className="p-5 space-y-4">
              {/* Bank Account dropdown and Current Balance row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bank Account</label>
                  <Select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}>
                    <option value="Select bank account...">Select bank account...</option>
                    <option value="Bank 1">Bank 1</option>
                    <option value="Bank 2">Bank 2</option>
                    <option value="Bank 3">Bank 3</option>
                    <option value="Bank 4">Bank 4</option>
                    <option value="Bank 5">Bank 5</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Current Balance</label>
                  <Input
                    readOnly
                    disabled
                    value={currentBalance}
                    className="bg-slate-100 font-mono text-sm font-bold text-slate-700 text-right"
                  />
                </div>
              </div>

              {/* Withdrawal Amount and Denomination row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Withdrawal Amount</label>
                  <div className="relative">
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-white font-mono text-sm text-right pr-8"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">₹</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Denomination Total</label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsCashDetailsOpen(true)}
                      className="bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-semibold text-xs h-9 px-3"
                    >
                      Cash Details
                    </Button>
                    <Input
                      readOnly
                      disabled
                      value={calculatedTotal.toFixed(2)}
                      className="bg-slate-100 font-mono text-sm font-bold text-red-600 text-right flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* CHQ no / Ref no */}
              <div className="space-y-1 max-w-sm">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">CHQ No. / Ref No.</label>
                <Input
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="Enter reference..."
                  className="bg-white text-sm"
                />
              </div>

              {/* Narration */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Narration</label>
                <textarea
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Enter transaction details..."
                  rows={4}
                  className="w-full bg-white rounded-md border border-slate-200 p-3 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Area: Transaction Preview */}
          <Card className="lg:col-span-4 bg-white border-slate-200 shadow-sm border-dashed border-2 p-5 min-h-[300px] flex flex-col justify-center items-center">
            {hasDenominations ? (
              <div className="w-full space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-2">
                  WITHDRAWAL DENOMINATIONS
                </h3>
                <div className="space-y-2 font-mono text-xs text-slate-600 max-h-48 overflow-y-auto">
                  {Object.entries(denominations)
                    .filter(([_, count]) => count > 0)
                    .map(([denom, count]) => (
                      <div key={denom} className="flex justify-between border-b border-slate-50 pb-1">
                        <span>{denom} Rs. × {count}</span>
                        <span className="font-bold text-slate-900">{(parseInt(denom) * count).toFixed(2)}</span>
                      </div>
                    ))}
                </div>
                <div className="flex justify-between font-mono text-sm font-bold border-t pt-2 border-slate-200 text-red-600">
                  <span>TOTAL DENOMINATIONS</span>
                  <span>{calculatedTotal.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.879M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">TRANSACTION PREVIEW</h3>
                <p className="text-xs text-slate-500 mt-1 text-center">Details will appear here as you fill the form.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Banks */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Banks:</span>
          <div className="flex gap-2">
            {["Bank 1", "Bank 2", "Bank 3", "Bank 4", "Bank 5"].map((bk) => (
              <button
                key={bk}
                type="button"
                onClick={() => {
                  setQuickBank(bk);
                  setBankAccount(bk);
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors shadow-xs ${
                  quickBank === bk
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {bk}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer controls bar */}
      <footer className="border-t bg-slate-50 py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <div>
          <Button
            variant="outline"
            className="flex items-center gap-1 font-bold border-slate-200 text-slate-700 bg-white"
            onClick={() => window.print()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.567-1.12-1.227L6.34 18m11.318 0h-11.32m11.32 0a49.255 49.255 0 0 0-11.32 0M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
            </svg>
            Print
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={!withdrawalExists}
            onClick={onDelete}
            className="flex items-center gap-1 font-bold border-red-200 text-red-600 bg-white hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            Delete
          </Button>

          <Button
            onClick={onSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 flex items-center gap-1.5 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Save F5
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="font-bold border-slate-200 text-slate-700 bg-white"
          >
            Close ESC
          </Button>
        </div>
      </footer>

      {/* Cash Details Denominations Dialog */}
      <Dialog open={isCashDetailsOpen} onOpenChange={setIsCashDetailsOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader className="border-b pb-2 bg-slate-50 -mx-6 -mt-6 p-4 rounded-t-lg">
            <DialogTitle className="text-base font-bold text-slate-800">
              Cash Denomination Calculator
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {Object.keys(denominations)
              .reverse()
              .map((denom) => {
                const count = denominations[denom as keyof Denominations] || "";
                const rowTotal = parseInt(denom) * (Number(count) || 0);
                return (
                  <div key={denom} className="flex items-center justify-between gap-4">
                    <span className="font-mono text-sm text-slate-600 w-16 text-right">
                      {denom} Rs.
                    </span>
                    <span className="text-slate-400">×</span>
                    <Input
                      type="number"
                      value={count}
                      onChange={(e) => handleCountChange(denom as keyof Denominations, e.target.value)}
                      placeholder="0"
                      className="w-24 text-center font-mono h-8"
                    />
                    <span className="text-slate-400">=</span>
                    <span className="font-mono text-sm font-bold text-slate-800 w-28 text-right pr-2">
                      {rowTotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
          </div>

          <DialogFooter className="border-t pt-3 flex items-center justify-between bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-lg">
            <div className="text-sm font-mono font-bold text-red-600">
              Total: {calculatedTotal.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCashDetailsOpen(false)}
                className="bg-white border-slate-200 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyCashDetails}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4"
              >
                Apply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
