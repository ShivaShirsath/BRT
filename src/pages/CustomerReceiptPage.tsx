import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AccountGenerationModal } from "../components/AccountGenerationModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface AllocationRow {
  date: string;
  billNo: string;
  amount: string;
  settled: string;
}

interface CustomerReceipt {
  voucherNo: string;
  date: string;
  receivedAsDeposit: boolean;
  customerName: string;
  customerId: number | null;
  balance: string;
  amount: string;
  discount: string;
  billDifference: string;
  tdsAmount: string;
  tcsPercent: string;
  tcsTotal: string;
  depositedIn: string;
  bankChqDetails: string;
  bankCharges: string;
  narration: string;
  allocations: AllocationRow[];
}

function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function CustomerReceiptPage() {
  const navigate = useNavigate();
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  // Top header states
  const [voucherNoInput, setVoucherNoInput] = useState("00062");
  const [date, setDate] = useState(getTodayDateString());
  const [receivedAsDeposit, setReceivedAsDeposit] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [receipts, setReceipts] = useState<CustomerReceipt[]>([]);

  // Left form details
  const [amount, setAmount] = useState("0.00");
  const [discount, setDiscount] = useState("0.00");
  const [billDifference, setBillDifference] = useState("0.00");
  const [tdsAmount, setTdsAmount] = useState("0.00");
  const [tcsPercent, setTcsPercent] = useState("0.000");
  const [depositedIn, setDepositedIn] = useState("Cash");
  const [bankChqDetails, setBankChqDetails] = useState("");
  const [bankCharges, setBankCharges] = useState("0.00");
  const [narration, setNarration] = useState("");

  // Right allocation list
  const [allocations, setAllocations] = useState<AllocationRow[]>(
    Array.from({ length: 5 }, () => ({
      date: "",
      billNo: "",
      amount: "0.00",
      settled: "0.00",
    }))
  );

  // Modal Account state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const { data } = await api.get("/customers");
      setCustomers(data || []);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

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

  // Load receipts from API
  const loadReceipts = async () => {
    try {
      const { data } = await api.get("/customer-receipt");
      if (data) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          voucherNo: r.voucherNo,
          date: fromIsoDate(r.businessDate),
          receivedAsDeposit: r.receivedAsDeposit,
          customerName: r.customerName,
          customerId: r.customerId,
          balance: String(r.balance || "0.00"),
          amount: String(r.amount || "0.00"),
          discount: String(r.discount || "0.00"),
          billDifference: String(r.billDifference || "0.00"),
          tdsAmount: String(r.tdsAmount || "0.00"),
          tcsPercent: String(r.tcsPercent || "0.000"),
          tcsTotal: String(r.tcsTotal || "0.00"),
          depositedIn: r.depositedIn,
          bankChqDetails: r.bankChqDetails || "",
          bankCharges: String(r.bankCharges || "0.00"),
          narration: r.narration || "",
          allocations: (r.allocations || []).map((a: any) => ({
            date: fromIsoDate(a.billDate),
            billNo: a.billNo,
            amount: String(a.amount || "0.00"),
            settled: String(a.settled || "0.00")
          }))
        }));
        setReceipts(mapped);
      }
    } catch (err) {
      console.error("Failed to load customer receipts", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    loadReceipts();
  }, []);

  // Picker date value
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

  // Filter receipt list
  const filteredReceipts = useMemo(() => {
    if (!voucherNoInput.trim()) return receipts;
    return receipts.filter((r) => r.voucherNo.includes(voucherNoInput.trim()));
  }, [receipts, voucherNoInput]);

  // Calculate TCS Total amount
  const tcsTotal = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const pct = parseFloat(tcsPercent) || 0;
    return ((amt * pct) / 100).toFixed(2);
  }, [amount, tcsPercent]);

  // Calculate total allocated settled sum
  const totalAllocated = useMemo(() => {
    return allocations
      .reduce((sum, row) => sum + (parseFloat(row.settled) || 0), 0)
      .toFixed(2);
  }, [allocations]);

  // Selected customer handler
  const handleSelectCustomer = (cust: any) => {
    setSelectedCustomer(cust);
    setCustomerSearch(cust.name);
    setShowCustomerDropdown(false);
  };

  // Auto Allocate handler (divides amount into settlements)
  const handleAutoAllocate = () => {
    let remaining = parseFloat(amount) || 0;
    if (remaining <= 0) {
      setError("Please enter a valid Receipt Amount before auto allocating.");
      return;
    }
    const updated = allocations.map((row) => {
      const billAmt = parseFloat(row.amount) || 0;
      if (billAmt <= 0) return row;
      const settleAmt = Math.min(remaining, billAmt);
      remaining -= settleAmt;
      return {
        ...row,
        settled: settleAmt.toFixed(2),
      };
    });
    setAllocations(updated);
    setMessage("Auto allocated settlements based on receipt amount.");
  };

  // Load existing receipt
  const handleLoadReceipt = (r: CustomerReceipt) => {
    setVoucherNoInput(r.voucherNo);
    setDate(r.date);
    setReceivedAsDeposit(r.receivedAsDeposit || false);
    setCustomerSearch(r.customerName);
    setAmount(r.amount);
    setDiscount(r.discount);
    setBillDifference(r.billDifference);
    setTdsAmount(r.tdsAmount);
    setTcsPercent(r.tcsPercent);
    setDepositedIn(r.depositedIn);
    setBankChqDetails(r.bankChqDetails);
    setBankCharges(r.bankCharges);
    setNarration(r.narration);
    setAllocations(r.allocations || Array.from({ length: 5 }, () => ({
      date: "",
      billNo: "",
      amount: "0.00",
      settled: "0.00",
    })));

    const foundCust = customers.find((c) => c.name === r.customerName || c.id === r.customerId);
    if (foundCust) {
      setSelectedCustomer(foundCust);
    }
    setShowVoucherList(false);
  };

  // Auto load matches
  useEffect(() => {
    if (voucherNoInput) {
      const match = receipts.find((r) => r.voucherNo === voucherNoInput.trim());
      if (match) {
        handleLoadReceipt(match);
      }
    }
  }, [voucherNoInput, receipts]);

  // Save receipt
  const onSave = async () => {
    setError("");
    setMessage("");

    if (!voucherNoInput.trim()) {
      setError("Voucher number is required.");
      return;
    }

    if (!customerSearch.trim()) {
      setError("Customer selection is required.");
      return;
    }

    const payload = {
      voucherNo: voucherNoInput.trim(),
      businessDate: toIsoDate(date),
      receivedAsDeposit,
      customerName: customerSearch,
      customerId: selectedCustomer?.id || null,
      balance: parseFloat(selectedCustomer?.openingBalance?.toString() || "0.00"),
      amount: parseFloat(amount) || 0,
      discount: parseFloat(discount) || 0,
      billDifference: parseFloat(billDifference) || 0,
      tdsAmount: parseFloat(tdsAmount) || 0,
      tcsPercent: parseFloat(tcsPercent) || 0,
      tcsTotal: parseFloat(tcsTotal) || 0,
      depositedIn,
      bankChqDetails,
      bankCharges: parseFloat(bankCharges) || 0,
      narration,
      allocations: allocations.map((a) => ({
        billDate: toIsoDate(a.date),
        billNo: a.billNo,
        amount: parseFloat(a.amount) || 0,
        settled: parseFloat(a.settled) || 0
      })),
    };

    try {
      const match = receipts.find((r) => r.voucherNo === payload.voucherNo);
      if (match && (match as any).id) {
        await api.put(`/customer-receipt/${(match as any).id}`, payload);
        setMessage(`Voucher ${payload.voucherNo} updated successfully.`);
      } else {
        await api.post("/customer-receipt", payload);
        setMessage(`Voucher ${payload.voucherNo} saved successfully.`);
      }
      loadReceipts();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save receipt.");
    }
  };

  // Delete receipt
  const onDelete = async () => {
    setError("");
    setMessage("");
    const num = voucherNoInput.trim();
    if (!num) return;

    const match = receipts.find((r) => r.voucherNo === num);
    if (!match || !(match as any).id) {
      setError("Cannot delete an unsaved voucher.");
      return;
    }

    try {
      await api.delete(`/customer-receipt/${(match as any).id}`);
      setMessage(`Voucher ${num} deleted successfully.`);
      loadReceipts();

      // Reset Form
      setVoucherNoInput("");
      setDate(getTodayDateString());
      setReceivedAsDeposit(false);
      setCustomerSearch("");
      setSelectedCustomer(null);
      setAmount("0.00");
      setDiscount("0.00");
      setBillDifference("0.00");
      setTdsAmount("0.00");
      setTcsPercent("0.000");
      setDepositedIn("Cash");
      setBankChqDetails("");
      setBankCharges("0.00");
      setNarration("");
      setAllocations(
        Array.from({ length: 5 }, () => ({
          date: "",
          billNo: "",
          amount: "0.00",
          settled: "0.00",
        }))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete receipt.");
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
  }, [voucherNoInput, date, receivedAsDeposit, customerSearch, selectedCustomer, amount, discount, billDifference, tdsAmount, tcsPercent, depositedIn, bankChqDetails, bankCharges, narration, allocations, receipts]);

  // Handle Account Generation Modal save callback
  const handleCreateCustomerAccount = async (formData: any) => {
    try {
      const { data } = await api.post("/customers", formData);
      setCustomers((prev) => [...prev, data]);
      setSelectedCustomer(data);
      setCustomerSearch(data.name);
      setIsAccountModalOpen(false);
      setMessage(`Account created successfully for ${data.name}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create customer account");
    }
  };

  const receiptExists = useMemo(() => {
    return receipts.some((r) => r.voucherNo === voucherNoInput.trim());
  }, [receipts, voucherNoInput]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none pb-8">
      {/* Header */}
      <header className="border-b bg-white shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Customer Receipt Voucher</h1>
        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-slate-50 text-xs font-semibold shadow-xs">
          <span className="text-slate-500">Active Mode</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>{selectedFirm?.name || "BRT Trading Co."}</span>
          <span>›</span>
          <span>Data Entry</span>
          <span>›</span>
          <span className="text-slate-900 font-bold">Customer Receipt</span>
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

        {/* Top Details Card */}
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Voucher No with arrows */}
            <div className="md:col-span-3 flex items-center gap-2 relative">
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
                  className="w-20 text-center font-mono rounded-none border-x-0 bg-white text-blue-600 font-bold"
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
                <div className="absolute top-full left-[90px] z-50 w-48 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredReceipts.map((r) => (
                    <div
                      key={r.voucherNo}
                      onMouseDown={() => handleLoadReceipt(r)}
                      className="px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 flex justify-between font-mono border-b border-slate-100"
                    >
                      <span className="font-semibold text-slate-800">{r.voucherNo}</span>
                      <span className="text-slate-400">{r.date}</span>
                    </div>
                  ))}
                  {filteredReceipts.length === 0 && (
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
            <div className="md:col-span-3 flex items-center gap-2 relative">
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

            {/* Received as deposit check */}
            <div className="md:col-span-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={receivedAsDeposit}
                  onChange={(e) => setReceivedAsDeposit(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Received as deposit</span>
              </label>
            </div>

            {/* Customer input & Balance display */}
            <div className="md:col-span-12 flex flex-col md:flex-row items-center gap-4 border-t border-slate-100 pt-3 mt-1">
              <div className="flex-1 flex items-center gap-2 relative w-full">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</span>
                <div className="relative flex-1">
                  <Input
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowCustomerDropdown(false), 200);
                    }}
                    placeholder="Search customer name..."
                    className="bg-white text-sm"
                  />
                  {showCustomerDropdown && (
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {customers
                        .filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                        .map((c) => (
                          <div
                            key={c.id}
                            onMouseDown={() => handleSelectCustomer(c)}
                            className="px-3 py-2 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50"
                          >
                            {c.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</span>
                <Input
                  readOnly
                  disabled
                  value={selectedCustomer ? `${selectedCustomer.openingBalance || 0} (${selectedCustomer.openingBalanceType || "D"})` : "0.00"}
                  className="w-40 font-mono text-sm font-bold text-red-600 text-right bg-slate-100 border-slate-200"
                />
                <Button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border-slate-200 text-xs px-4"
                >
                  Ledger
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Split grid for Receipt Details & Bill Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: RECEIPT DETAILS */}
          <Card className="lg:col-span-5 bg-white border-slate-200 shadow-sm">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-sm font-bold tracking-wider text-slate-700 uppercase">
                RECEIPT DETAILS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Amount */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28">Amount</label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono text-sm text-right bg-white max-w-xs"
                />
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28">Discount</label>
                <Input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="font-mono text-sm text-right bg-white max-w-xs"
                />
              </div>

              {/* Bill Difference */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28">Bill Difference</label>
                <Input
                  value={billDifference}
                  onChange={(e) => setBillDifference(e.target.value)}
                  className="font-mono text-sm text-right bg-white max-w-xs"
                />
              </div>

              <hr className="border-slate-100" />

              {/* TDS Amount */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28">TDS Amount</label>
                <Input
                  value={tdsAmount}
                  onChange={(e) => setTdsAmount(e.target.value)}
                  className="font-mono text-sm text-right bg-white max-w-xs"
                />
              </div>

              {/* TCS % and calculated total */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28">TCS %</label>
                <div className="flex items-center gap-2 max-w-xs w-full">
                  <Input
                    value={tcsPercent}
                    onChange={(e) => setTcsPercent(e.target.value)}
                    className="font-mono text-xs w-20 text-center bg-white"
                  />
                  <Input
                    readOnly
                    disabled
                    value={tcsTotal}
                    className="font-mono text-xs text-right bg-slate-100 border-slate-200 flex-1"
                  />
                  <span className="text-2xs font-bold text-slate-400">TOTAL</span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Deposited In */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28">Deposited In</label>
                <Select value={depositedIn} onChange={(e) => setDepositedIn(e.target.value)} className="max-w-xs">
                  <option value="Cash">Cash</option>
                  <option value="Bank 1">Bank 1</option>
                  <option value="Bank 2">Bank 2</option>
                  <option value="Bank 3">Bank 3</option>
                  <option value="Bank 4">Bank 4</option>
                  <option value="Bank 5">Bank 5</option>
                </Select>
              </div>

              {/* Bank / Chq Details */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28">Bank / Chq Details</label>
                <Input
                  value={bankChqDetails}
                  onChange={(e) => setBankChqDetails(e.target.value)}
                  placeholder="Enter bank info..."
                  className="text-xs bg-white max-w-xs"
                />
              </div>

              {/* Bank Charges */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28">Bank Charges</label>
                <Input
                  value={bankCharges}
                  onChange={(e) => setBankCharges(e.target.value)}
                  className="font-mono text-sm text-right bg-white max-w-xs"
                />
              </div>

              {/* Narration */}
              <div className="flex items-start justify-between gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider w-28 pt-1">Narration</label>
                <textarea
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Enter notes..."
                  rows={2}
                  className="w-full max-w-xs bg-white rounded border border-slate-200 p-2 text-xs outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel: BILL ALLOCATION */}
          <Card className="lg:col-span-7 bg-white border-slate-200 shadow-sm">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold tracking-wider text-slate-700 uppercase">
                BILL ALLOCATION
              </CardTitle>
              <Button
                onClick={handleAutoAllocate}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs h-8 px-4"
              >
                Auto Allocate
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-bold text-slate-700 uppercase">#</TableHead>
                    <TableHead className="w-1/4 text-xs font-bold text-slate-700 uppercase">Date</TableHead>
                    <TableHead className="w-1/4 text-xs font-bold text-slate-700 uppercase">Bill No</TableHead>
                    <TableHead className="w-1/4 text-xs font-bold text-slate-700 uppercase text-right">Amount</TableHead>
                    <TableHead className="w-1/4 text-xs font-bold text-slate-700 uppercase text-right">Settled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="text-center font-mono text-xs text-slate-400 p-2">
                        {idx + 1}
                      </TableCell>
                      {/* Date */}
                      <TableCell className="p-2">
                        <Input
                          value={row.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, date: val } : r))
                            );
                          }}
                          placeholder="dd.mm.yyyy"
                          className="h-8 font-mono text-xs py-1 px-2 border-slate-200"
                        />
                      </TableCell>
                      {/* Bill No */}
                      <TableCell className="p-2">
                        <Input
                          value={row.billNo}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, billNo: val } : r))
                            );
                          }}
                          placeholder="--"
                          className="h-8 font-mono text-xs py-1 px-2 border-slate-200"
                        />
                      </TableCell>
                      {/* Amount */}
                      <TableCell className="p-2">
                        <Input
                          value={row.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, amount: val } : r))
                            );
                          }}
                          className="h-8 font-mono text-xs py-1 px-2 border-slate-200 text-right"
                        />
                      </TableCell>
                      {/* Settled */}
                      <TableCell className="p-2">
                        <Input
                          value={row.settled}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, settled: val } : r))
                            );
                          }}
                          className="h-8 font-mono text-xs py-1 px-2 border-slate-200 text-right font-semibold text-slate-950"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Total allocated display bar */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL ALLOCATED</span>
                <Input
                  readOnly
                  disabled
                  value={totalAllocated}
                  className="w-32 font-mono text-sm font-extrabold text-teal-600 text-right bg-white border-slate-200"
                />
              </div>
            </CardContent>
          </Card>
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
            disabled={!receiptExists}
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

      {/* Account creation popup modal */}
      <AccountGenerationModal
        open={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleCreateCustomerAccount}
      />
    </div>
  );
}
