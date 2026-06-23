import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
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

interface BillAllocationRow {
  date: string;
  actAmount: string;
  balAmount: string;
  no: string;
}

interface DalalVoucher {
  billNo: string;
  date: string;
  ledgerAccount: string;
  customerId: number | null;
  balanceAmount: string;
  amount: string;
  paidFrom: string;
  mode: string;
  refNo: string;
  discount: string;
  bankCharges: string;
  tdsAmount: string;
  comm: string;
  narration: string;
  selectedBank: string;
  allocations: BillAllocationRow[];
}

function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function DalalPaymentPage() {
  const navigate = useNavigate();
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  // Bill & General states
  const [billNo, setBillNo] = useState("001186");
  const [billNoInput, setBillNoInput] = useState("001186");
  const [date, setDate] = useState(getTodayDateString());
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [vouchers, setVouchers] = useState<DalalVoucher[]>([]);

  // Left form states
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [amount, setAmount] = useState("0.00");
  const [paidFrom, setPaidFrom] = useState("Bank / cash account");
  const [mode, setMode] = useState("Cheque");
  const [refNo, setRefNo] = useState("");
  const [discount, setDiscount] = useState("0.00");
  const [bankCharges, setBankCharges] = useState("0.00");
  const [tdsAmount, setTdsAmount] = useState("0.00");
  const [comm, setComm] = useState("0.00");
  const [narration, setNarration] = useState("");
  const [selectedBank, setSelectedBank] = useState("Bank 1");

  // Right allocation states
  const [allocations, setAllocations] = useState<BillAllocationRow[]>(
    Array.from({ length: 6 }, () => ({
      date: "",
      actAmount: "",
      balAmount: "",
      no: "",
    }))
  );

  // Account creation modal state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Info alert states
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [printChecked, setPrintChecked] = useState(false);

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

  // Load vouchers from API
  const loadVouchers = async () => {
    try {
      const { data } = await api.get("/dalal-payment");
      if (data) {
        const mapped = data.map((v: any) => ({
          id: v.id,
          billNo: v.billNo,
          date: fromIsoDate(v.businessDate),
          ledgerAccount: v.ledgerAccount,
          customerId: v.customerId,
          balanceAmount: String(v.balanceAmount || "0.00"),
          amount: String(v.amount || "0.00"),
          paidFrom: v.paidFrom,
          mode: v.mode,
          refNo: v.refNo,
          discount: String(v.discount || "0.00"),
          bankCharges: String(v.bankCharges || "0.00"),
          tdsAmount: String(v.tdsAmount || "0.00"),
          comm: String(v.comm || "0.00"),
          narration: v.narration,
          selectedBank: v.selectedBank,
          allocations: v.allocations || [],
        }));
        setVouchers(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch vouchers", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    loadVouchers();
  }, []);

  // Sync date input picker
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

  // Filter vouchers based on current text input
  const filteredVouchers = useMemo(() => {
    if (!billNoInput.trim()) return vouchers;
    return vouchers.filter((v) => v.billNo.includes(billNoInput.trim()));
  }, [vouchers, billNoInput]);

  // Calculate allocation total
  const billAllocationTotal = useMemo(() => {
    return allocations
      .reduce((sum, row) => sum + (parseFloat(row.actAmount) || 0), 0)
      .toFixed(2);
  }, [allocations]);

  // Handle selected customer selection
  const handleSelectCustomer = (cust: any) => {
    setSelectedCustomer(cust);
    setLedgerSearch(cust.name);
    setShowCustomerDropdown(false);
  };

  // Keyboard shortcut binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        onSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        navigate(-1);
      } else if (e.key === "F3") {
        e.preventDefault();
        setIsAccountModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [billNo, date, ledgerSearch, selectedCustomer, amount, paidFrom, mode, refNo, discount, bankCharges, tdsAmount, comm, narration, selectedBank, allocations]);

  // Calculate discount percent helper
  const handleCalculateDiscountPercent = () => {
    const amtNum = parseFloat(amount) || 0;
    if (amtNum > 0) {
      // Prompt/Modal to enter percent
      const percentStr = window.prompt("Enter discount percentage (%):", "2");
      if (percentStr) {
        const pct = parseFloat(percentStr) || 0;
        const calcVal = (amtNum * pct) / 100;
        setDiscount(calcVal.toFixed(2));
      }
    } else {
      setError("Please enter a valid Amount before calculating discount %.");
    }
  };

  // Reset form to blank / defaults
  const handleReset = (keepBillNo = "") => {
    setBillNo(keepBillNo);
    setBillNoInput(keepBillNo);
    setDate(getTodayDateString());
    setLedgerSearch("");
    setSelectedCustomer(null);
    setAmount("0.00");
    setPaidFrom("Bank / cash account");
    setMode("Cheque");
    setRefNo("");
    setDiscount("0.00");
    setBankCharges("0.00");
    setTdsAmount("0.00");
    setComm("0.00");
    setNarration("");
    setSelectedBank("Bank 1");
    setAllocations(
      Array.from({ length: 6 }, () => ({
        date: "",
        actAmount: "",
        balAmount: "",
        no: "",
      }))
    );
    setMessage("");
    setError("");
  };

  // Save voucher
  const onSave = async () => {
    setError("");
    setMessage("");

    if (!billNoInput.trim()) {
      setError("Bill number is required.");
      return;
    }

    if (!ledgerSearch.trim()) {
      setError("Ledger account is required.");
      return;
    }

    // Check if we have an existing voucher to get its ID, or generate a new UUID
    const existingVoucher = vouchers.find((v: any) => v.billNo === billNoInput.trim());
    const id = existingVoucher && (existingVoucher as any).id 
      ? (existingVoucher as any).id 
      : (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }));

    const payload = {
      id,
      billNo: billNoInput.trim(),
      date: toIsoDate(date),
      ledgerAccount: ledgerSearch,
      customerId: selectedCustomer?.id || null,
      balanceAmount: parseFloat(selectedCustomer?.openingBalance?.toString() || "0.00"),
      amount: parseFloat(amount) || 0.00,
      paidFrom,
      mode,
      refNo,
      discount: parseFloat(discount) || 0.00,
      bankCharges: parseFloat(bankCharges) || 0.00,
      tdsAmount: parseFloat(tdsAmount) || 0.00,
      comm: parseFloat(comm) || 0.00,
      narration,
      selectedBank,
      allocations: allocations
        .filter(row => row.date && row.date.trim())
        .map(row => ({
          date: row.date,
          actAmount: parseFloat(row.actAmount) || 0.00,
          balAmount: parseFloat(row.balAmount) || 0.00,
          no: row.no
        }))
    };

    try {
      await api.post("/dalal-payment", payload);
      setMessage(`Voucher ${payload.billNo} saved successfully.`);
      loadVouchers();
      if (printChecked) {
        window.print();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to save voucher.");
    }
  };

  // Delete voucher
  const onDelete = async () => {
    setError("");
    setMessage("");
    const num = billNoInput.trim();
    if (!num) return;

    try {
      await api.delete(`/dalal-payment/by-bill-no/${num}`);
      setMessage(`Voucher ${num} deleted successfully.`);
      loadVouchers();
      handleReset();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to delete voucher.");
    }
  };

  // Load existing voucher details
  const handleLoadVoucher = (v: DalalVoucher) => {
    setBillNo(v.billNo);
    setBillNoInput(v.billNo);
    setDate(v.date);
    setLedgerSearch(v.ledgerAccount);
    setAmount(v.amount);
    setPaidFrom(v.paidFrom);
    setMode(v.mode);
    setRefNo(v.refNo);
    setDiscount(v.discount);
    setBankCharges(v.bankCharges);
    setTdsAmount(v.tdsAmount);
    setComm(v.comm);
    setNarration(v.narration);
    setSelectedBank(v.selectedBank);
    setAllocations(v.allocations);

    // Try finding customer details locally
    const foundCust = customers.find((c) => c.name === v.ledgerAccount || c.id === v.customerId);
    if (foundCust) {
      setSelectedCustomer(foundCust);
    }
    setShowVoucherList(false);
  };

  // Fetch individual details if input changes and matches exactly
  useEffect(() => {
    if (billNoInput) {
      const match = vouchers.find((v) => v.billNo === billNoInput.trim());
      if (match) {
        handleLoadVoucher(match);
      }
    }
  }, [billNoInput]);

  // Handle Account Generation Modal save callback
  const handleCreateCustomerAccount = async (formData: any) => {
    try {
      const { data } = await api.post("/customers", formData);
      setCustomers((prev) => [...prev, data]);
      setSelectedCustomer(data);
      setLedgerSearch(data.name);
      setIsAccountModalOpen(false);
      setMessage(`Account created successfully for ${data.name}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create customer account");
    }
  };

  // Check if voucher exists for Delete enablement
  const voucherExists = useMemo(() => {
    return vouchers.some((v) => v.billNo === billNoInput.trim());
  }, [vouchers, billNoInput]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none">
      {/* Header bar */}
      <header className="border-b bg-card shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Dalal Payment Voucher Entry</h1>
        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-muted text-xs font-semibold shadow-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Online Mode</span>
        </div>
      </header>

      {/* Breadcrumb */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 space-y-4">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>{selectedFirm?.name || "BRT Trading Co."}</span>
          <span>›</span>
          <span>Data Entry</span>
          <span>›</span>
          <span className="text-foreground font-bold">Dalal payment voucher</span>
        </div>

        {/* Message and error alerts */}
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

        {/* Top Bill info card */}
        <Card className="shadow-xs border-border">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Bill No input */}
            <div className="flex items-center gap-2 relative flex-1 max-w-sm">
              <label className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Bill no.</label>
              <div className="relative flex-1 flex items-center">
                <Input
                  value={billNoInput}
                  onChange={(e) => {
                    setBillNoInput(e.target.value);
                    setShowVoucherList(true);
                  }}
                  onFocus={() => setShowVoucherList(true)}
                  onBlur={() => {
                    setTimeout(() => setShowVoucherList(false), 200);
                  }}
                  className="w-full pr-10 font-mono text-sm tracking-wide bg-background"
                  placeholder="000000"
                />
                <button
                  type="button"
                  onClick={() => setShowVoucherList(!showVoucherList)}
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3.75 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </button>
              </div>

              {/* List Vouchers dropdown */}
              {showVoucherList && (
                <div className="absolute top-full left-[60px] z-50 w-full min-w-[200px] mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto text-popover-foreground">
                  {filteredVouchers.map((v) => (
                    <div
                      key={v.billNo}
                      onMouseDown={() => handleLoadVoucher(v)}
                      className="px-3 py-2 text-xs cursor-pointer hover:bg-accent flex justify-between font-mono border-b border-border"
                    >
                      <span className="font-semibold text-foreground">{v.billNo}</span>
                      <span className="text-muted-foreground">{v.date}</span>
                    </div>
                  ))}
                  {filteredVouchers.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">No stored vouchers</div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoucherList(!showVoucherList)}
                className="flex items-center gap-1 text-muted-foreground bg-background border-border hover:bg-accent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3.75 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                List
              </Button>
            </div>

            {/* Date Input */}
            <div className="flex items-center gap-2 relative max-w-xs w-full">
              <label className="text-sm font-semibold text-muted-foreground">Date</label>
              <div className="relative flex-1 flex items-center">
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="DD.MM.YYYY"
                  className="pr-10 w-full text-sm font-mono tracking-wider bg-background"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-muted-foreground">
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
          </CardContent>
        </Card>

        {/* Split Form & Allocation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Dark themed panel */}
          <Card className="lg:col-span-5 bg-muted/30 border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              {/* Ledger account */}
              <div className="space-y-1 relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Ledger account</label>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsAccountModalOpen(true)}
                    className="h-auto p-0 text-xs font-bold text-primary hover:underline"
                  >
                    + Add Account
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={ledgerSearch}
                      onChange={(e) => {
                        setLedgerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowCustomerDropdown(false), 200);
                      }}
                      className="bg-background"
                      placeholder="Search ledger"
                    />
                    {showCustomerDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto text-popover-foreground">
                        {customers
                          .filter((c) => c.name.toLowerCase().includes(ledgerSearch.toLowerCase()))
                          .map((c) => (
                            <div
                              key={c.id}
                              onMouseDown={() => handleSelectCustomer(c)}
                              className="px-3 py-2 text-xs font-semibold text-foreground cursor-pointer hover:bg-accent"
                            >
                              {c.name}
                            </div>
                          ))}
                        <div
                          onMouseDown={() => {
                            setIsAccountModalOpen(true);
                            setShowCustomerDropdown(false);
                          }}
                          className="px-3 py-2 text-xs font-bold text-primary cursor-pointer hover:bg-accent border-t text-left"
                        >
                          + Add New Account
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => setIsAccountModalOpen(true)}
                    className="bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm px-4"
                  >
                    Ledger
                  </Button>
                </div>
              </div>

              {/* Balance Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Balance amount</label>
                <Input
                  readOnly
                  disabled
                  value={selectedCustomer ? `${selectedCustomer.openingBalance || 0} (${selectedCustomer.openingBalanceType || "D"})` : "0.00"}
                  className="bg-muted/50 font-mono font-bold text-foreground border-border"
                />
              </div>

              {/* Amount & Bill Allocation label next to it */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Amount</label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background font-mono text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Bill allocation</label>
                  <Input
                    readOnly
                    disabled
                    value={billAllocationTotal}
                    className="bg-muted/50 font-mono font-bold text-foreground border-border"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Paid From */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Paid from</label>
                <Input
                  value={paidFrom}
                  onChange={(e) => setPaidFrom(e.target.value)}
                  className="bg-background"
                  placeholder="Bank / cash account"
                />
              </div>

              {/* Mode & Ref No */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Mode</label>
                  <Select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-background">
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="RTGS">RTGS</option>
                    <option value="NEFT">NEFT</option>
                    <option value="Draft">Draft</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Cheque/ ref. no.</label>
                  <Input
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    className="bg-background font-mono"
                    placeholder="Cheque/ ref. no."
                  />
                </div>
              </div>

              <hr className="border-border" />

              {/* Discount & Button */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Discount</label>
                <div className="flex gap-2">
                  <Input
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="bg-background font-mono flex-1"
                    placeholder="0.00"
                  />
                  <Button
                    onClick={handleCalculateDiscountPercent}
                    className="bg-accent hover:opacity-90 text-accent-foreground font-semibold text-xs px-3"
                  >
                    F5 calculate %
                  </Button>
                </div>
              </div>

              {/* Bank Charges */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Bank charges</label>
                <Input
                  value={bankCharges}
                  onChange={(e) => setBankCharges(e.target.value)}
                  className="bg-background font-mono"
                  placeholder="0.00"
                />
              </div>

              {/* T.D.S. & Comm. */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">T.D.S. amount</label>
                  <Input
                    value={tdsAmount}
                    onChange={(e) => setTdsAmount(e.target.value)}
                    className="bg-background font-mono"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Comm.</label>
                  <Input
                    value={comm}
                    onChange={(e) => setComm(e.target.value)}
                    className="bg-background font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Narration */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Narration</label>
                <Input
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="bg-background"
                  placeholder="Enter narration"
                />
              </div>

              <hr className="border-border" />

              {/* Banks buttons selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Banks</label>
                <div className="flex flex-wrap gap-2">
                  {["Bank 1", "Bank 2", "Bank 3", "Bank 4", "Bank 5"].map((bk) => (
                    <button
                      key={bk}
                      type="button"
                      onClick={() => setSelectedBank(bk)}
                      className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors shadow-xs ${
                        selectedBank === bk
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {bk}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Area: Bill Allocation Card */}
          <Card className="lg:col-span-7 bg-card border-border shadow-sm">
            <CardHeader className="p-4 border-b border-border">
              <CardTitle className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                BILL ALLOCATION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-1/3 text-xs font-bold text-foreground uppercase">Date</TableHead>
                    <TableHead className="w-1/4 text-xs font-bold text-foreground uppercase">Act. amount</TableHead>
                    <TableHead className="w-1/4 text-xs font-bold text-foreground uppercase">Bal. amount</TableHead>
                    <TableHead className="text-xs font-bold text-foreground uppercase">No.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-accent/50 border-border">
                      {/* Allocation Date */}
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
                          className="h-8 font-mono text-xs py-1 px-2 border-border focus:ring-1 focus:ring-primary bg-background"
                        />
                      </TableCell>
                      {/* Actual Amount */}
                      <TableCell className="p-2">
                        <Input
                          value={row.actAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, actAmount: val } : r))
                            );
                          }}
                          placeholder="0.00"
                          className="h-8 font-mono text-xs py-1 px-2 border-border focus:ring-1 focus:ring-primary bg-background"
                        />
                      </TableCell>
                      {/* Balance Amount */}
                      <TableCell className="p-2">
                        <Input
                          value={row.balAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, balAmount: val } : r))
                            );
                          }}
                          placeholder="0.00"
                          className="h-8 font-mono text-xs py-1 px-2 border-border focus:ring-1 focus:ring-primary bg-background"
                        />
                      </TableCell>
                      {/* Number/Id */}
                      <TableCell className="p-2">
                        <Input
                          value={row.no}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAllocations((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, no: val } : r))
                            );
                          }}
                          placeholder="--"
                          className="h-8 font-mono text-xs py-1 px-2 border-border focus:ring-1 focus:ring-primary bg-background"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer controls bar */}
      <footer className="border-t bg-muted/20 py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            className="flex items-center gap-1 font-bold border-border text-foreground bg-background hover:bg-accent"
            onClick={() => window.print()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.567-1.12-1.227L6.34 18m11.318 0h-11.32m11.32 0a49.255 49.255 0 0 0-11.32 0M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
            </svg>
            Print RTGS form
          </Button>

          <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={printChecked}
              onChange={(e) => setPrintChecked(e.target.checked)}
              className="rounded border-border text-primary focus:ring-ring w-4 h-4"
            />
            <span>Print</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={!voucherExists}
            onClick={onDelete}
            className="flex items-center gap-1 font-bold border-destructive/20 text-destructive bg-background hover:bg-destructive/10 disabled:opacity-50 disabled:pointer-events-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            Delete
          </Button>

          <Button
            onClick={onSave}
            className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 flex items-center gap-1 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Save (F5)
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="font-bold border-border text-foreground bg-background hover:bg-accent"
          >
            Close (ESC)
          </Button>
        </div>
      </footer>
    </div>
  );
}
