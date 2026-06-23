import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AccountGenerationModal } from "../components/AccountGenerationModal";

interface MiscReceipt {
  id?: string;
  voucherNo: string;
  voucherSuffix: string;
  date: string;
  accountType: string;
  ledgerAccount: string;
  customerId: number | null;
  balance: string;
  amount: string;
  interestPercent: string;
  discount: string;
  tdsAmount: string;
  depositedIn: string;
  paymentMode: string;
  paymentModeDetails: string;
  chqOfBank: string;
  narration: string;
}

function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function MiscReceiptPage() {
  const navigate = useNavigate();

  // Form states
  const [voucherNoInput, setVoucherNoInput] = useState("00044");
  const [voucherSuffix, setVoucherSuffix] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [accountType, setAccountType] = useState("All");
  const [ledgerAccountSearch, setLedgerAccountSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [amount, setAmount] = useState("0.00");
  const [interestPercent, setInterestPercent] = useState("0.00");
  const [discount, setDiscount] = useState("0.00");
  const [tdsAmount, setTdsAmount] = useState("0.00");
  const [depositedIn, setDepositedIn] = useState("Cash");
  const [paymentMode, setPaymentMode] = useState("Cheque");
  const [paymentModeDetails, setPaymentModeDetails] = useState("");
  const [chqOfBank, setChqOfBank] = useState("");
  const [narration, setNarration] = useState("");

  // Footer / printing states
  const [printCheckbox, setPrintCheckbox] = useState(false);
  const [duplicateCheckbox, setDuplicateCheckbox] = useState(false);

  // UI state
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [receipts, setReceipts] = useState<MiscReceipt[]>([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const loadReceipts = async () => {
    try {
      const { data } = await api.get("/misc-receipt");
      if (data) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          voucherNo: r.voucherNo,
          voucherSuffix: r.voucherSuffix || "",
          date: fromIsoDate(r.businessDate),
          accountType: r.accountType || "All",
          ledgerAccount: r.ledgerAccount || "",
          customerId: r.customerId,
          balance: String(r.balance || "0.00"),
          amount: String(r.amount || "0.00"),
          interestPercent: String(r.interestPercent || "0.00"),
          discount: String(r.discount || "0.00"),
          tdsAmount: String(r.tdsAmount || "0.00"),
          depositedIn: r.depositedIn || "Cash",
          paymentMode: r.paymentMode || "Cheque",
          paymentModeDetails: r.paymentModeDetails || "",
          chqOfBank: r.chqOfBank || "",
          narration: r.narration || "",
        }));
        setReceipts(mapped);
      }
    } catch (err) {
      console.error("Failed to load receipts", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    loadReceipts();
  }, []);

  const pickerValue = useMemo(() => {
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
  }, [date]);

  const filteredReceipts = useMemo(() => {
    if (!voucherNoInput.trim()) return receipts;
    return receipts.filter((r) => r.voucherNo.includes(voucherNoInput.trim()));
  }, [receipts, voucherNoInput]);

  const handleSelectCustomer = (cust: any) => {
    setSelectedCustomer(cust);
    setLedgerAccountSearch(cust.name);
    setShowCustomerDropdown(false);
  };

  const handleLoadReceipt = (r: MiscReceipt) => {
    setVoucherNoInput(r.voucherNo);
    setVoucherSuffix(r.voucherSuffix);
    setDate(r.date);
    setAccountType(r.accountType);
    setLedgerAccountSearch(r.ledgerAccount);
    setAmount(r.amount);
    setInterestPercent(r.interestPercent);
    setDiscount(r.discount);
    setTdsAmount(r.tdsAmount);
    setDepositedIn(r.depositedIn);
    setPaymentMode(r.paymentMode);
    setPaymentModeDetails(r.paymentModeDetails);
    setChqOfBank(r.chqOfBank);
    setNarration(r.narration);

    const foundCust = customers.find((c) => c.name === r.ledgerAccount || c.id === r.customerId);
    if (foundCust) {
      setSelectedCustomer(foundCust);
    }
    setShowVoucherList(false);
  };

  useEffect(() => {
    if (voucherNoInput) {
      const match = receipts.find((r) => r.voucherNo === voucherNoInput.trim());
      if (match) {
        handleLoadReceipt(match);
      }
    }
  }, [voucherNoInput, receipts]);

  const onSave = async () => {
    setError("");
    setMessage("");

    if (!voucherNoInput.trim()) {
      setError("Voucher number is required.");
      return;
    }

    const payload = {
      voucherNo: voucherNoInput.trim(),
      voucherSuffix: voucherSuffix.trim(),
      date: toIsoDate(date),
      accountType,
      ledgerAccount: ledgerAccountSearch,
      customerId: selectedCustomer?.id || null,
      balance: parseFloat(selectedCustomer?.openingBalance?.toString() || "0.00"),
      amount: parseFloat(amount) || 0,
      interestPercent: parseFloat(interestPercent) || 0,
      discount: parseFloat(discount) || 0,
      tdsAmount: parseFloat(tdsAmount) || 0,
      depositedIn,
      paymentMode,
      paymentModeDetails,
      chqOfBank,
      narration,
    };

    try {
      const match = receipts.find((r) => r.voucherNo === payload.voucherNo);
      if (match && (match as any).id) {
        await api.post("/misc-receipt", { ...payload, id: (match as any).id });
        setMessage(`Voucher ${payload.voucherNo} updated successfully.`);
      } else {
        await api.post("/misc-receipt", payload);
        setMessage(`Voucher ${payload.voucherNo} saved successfully.`);
      }
      loadReceipts();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save receipt.");
    }
  };

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
      await api.delete(`/misc-receipt/by-voucher-no/${num}`);
      setMessage(`Voucher ${num} deleted successfully.`);
      loadReceipts();

      // Reset
      setVoucherNoInput("");
      setVoucherSuffix("");
      setDate(getTodayDateString());
      setAccountType("All");
      setLedgerAccountSearch("");
      setSelectedCustomer(null);
      setAmount("0.00");
      setInterestPercent("0.00");
      setDiscount("0.00");
      setTdsAmount("0.00");
      setDepositedIn("Cash");
      setPaymentMode("Cheque");
      setPaymentModeDetails("");
      setChqOfBank("");
      setNarration("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete receipt.");
    }
  };

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
  }, [voucherNoInput, voucherSuffix, date, accountType, ledgerAccountSearch, selectedCustomer, amount, interestPercent, discount, tdsAmount, depositedIn, paymentMode, paymentModeDetails, chqOfBank, narration, receipts]);

  const handleCreateAccount = async (formData: any) => {
    try {
      const { data } = await api.post("/customers", formData);
      setCustomers((prev) => [...prev, data]);
      setSelectedCustomer(data);
      setLedgerAccountSearch(data.name);
      setIsAccountModalOpen(false);
      setMessage(`Account created successfully for ${data.name}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create account");
    }
  };

  const receiptExists = useMemo(() => {
    return receipts.some((r) => r.voucherNo === voucherNoInput.trim());
  }, [receipts, voucherNoInput]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none pb-8">
      {/* Header */}
      <header className="border-b bg-card shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Miscellaneous Receipt Voucher</h1>
        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-muted text-xs font-semibold shadow-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Active Mode</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>BRT Trading Co.</span>
          <span>›</span>
          <span>Data Entry</span>
          <span>›</span>
          <span className="text-foreground font-bold">Miscellaneous Receipt</span>
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
        <Card className="shadow-xs border-border">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 relative flex-1 max-w-md">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Voucher No.</span>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseInt(voucherNoInput) || 0;
                    if (parsed > 1) {
                      setVoucherNoInput(String(parsed - 1).padStart(5, "0"));
                    }
                  }}
                  className="px-2 py-1.5 border border-border rounded-l hover:bg-accent bg-background"
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
                  className="w-20 text-center font-mono rounded-none border-x-0 bg-background text-primary font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseInt(voucherNoInput) || 0;
                    setVoucherNoInput(String(parsed + 1).padStart(5, "0"));
                  }}
                  className="px-2 py-1.5 border border-border rounded-r hover:bg-accent bg-background"
                >
                  &gt;
                </button>
              </div>
              <Input
                value={voucherSuffix}
                onChange={(e) => setVoucherSuffix(e.target.value)}
                className="w-16 ml-1 bg-background border-border text-center font-mono"
                placeholder="Suff"
              />

              {showVoucherList && (
                <div className="absolute top-full left-[90px] z-50 w-48 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto text-popover-foreground">
                  {filteredReceipts.map((r) => (
                    <div
                      key={r.voucherNo}
                      onMouseDown={() => handleLoadReceipt(r)}
                      className="px-3 py-2 text-xs cursor-pointer hover:bg-accent flex justify-between font-mono border-b border-border"
                    >
                      <span className="font-semibold text-foreground">{r.voucherNo}</span>
                      <span className="text-muted-foreground">{r.date}</span>
                    </div>
                  ))}
                  {filteredReceipts.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">No matching vouchers</div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoucherList(!showVoucherList)}
                className="flex items-center gap-1 text-muted-foreground bg-background border-border hover:bg-accent"
              >
                List
              </Button>
            </div>

            <div className="flex items-center gap-2 relative max-w-xs w-full">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</span>
              <div className="relative flex-1 flex items-center">
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pr-10 w-full text-xs font-mono tracking-wider bg-background"
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
                        setDate(`${parts[2]}.${parts[1]}.${parts[0]}`);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Card */}
        <Card className="shadow-xs border-border bg-card">
          <CardContent className="p-6 space-y-5">
            {/* Account Type & Ledger Account */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Account Type</label>
                <Select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="bg-background">
                  <option value="All">All</option>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                </Select>
              </div>

              <div className="md:col-span-8 space-y-1 relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Ledger Account</label>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsAccountModalOpen(true)}
                    className="h-auto p-0 text-xs font-bold text-primary"
                  >
                    + New Account (F3)
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    value={ledgerAccountSearch}
                    onChange={(e) => {
                      setLedgerAccountSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowCustomerDropdown(false), 200);
                    }}
                    placeholder="Search ledger account..."
                    className="bg-background"
                  />
                  {showCustomerDropdown && (
                    <div className="absolute z-[100] w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto text-popover-foreground">
                      {customers
                        .filter((c) => c.name.toLowerCase().includes(ledgerAccountSearch.toLowerCase()))
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
              </div>
            </div>

            {/* Financial row 1: Balance, Amount, Interest */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Balance</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    disabled
                    value={selectedCustomer ? `${selectedCustomer.openingBalance || "0.00"} (${selectedCustomer.openingBalanceType || "D"})` : "0.00"}
                    className="bg-muted/50 font-mono text-sm font-bold text-primary text-right flex-1 border-border"
                  />
                  <Button variant="outline" size="sm" className="bg-background border-border text-xs font-semibold hover:bg-accent">
                    Ledger
                  </Button>
                </div>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Amount</label>
                <div className="flex gap-2">
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background font-mono text-sm text-right flex-1"
                    placeholder="0.00"
                  />
                  <Button variant="outline" size="sm" className="bg-background border-border text-xs font-semibold hover:bg-accent">
                    Cash Details
                  </Button>
                </div>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Interest %</label>
                <Input
                  value={interestPercent}
                  onChange={(e) => setInterestPercent(e.target.value)}
                  className="bg-background font-mono text-sm text-right"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Financial row 2: Discount, TDS, Deposited In */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Discount</label>
                <Input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="bg-background font-mono text-sm text-right"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">TDS Amount</label>
                <Input
                  value={tdsAmount}
                  onChange={(e) => setTdsAmount(e.target.value)}
                  className="bg-background font-mono text-sm text-right"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Deposited In</label>
                <Select value={depositedIn} onChange={(e) => setDepositedIn(e.target.value)} className="bg-background">
                  <option value="Cash">Cash</option>
                  <option value="Bank 1">Bank 1</option>
                  <option value="Bank 2">Bank 2</option>
                  <option value="Bank 3">Bank 3</option>
                  <option value="Bank 4">Bank 4</option>
                  <option value="Bank 5">Bank 5</option>
                </Select>
              </div>
            </div>

            <hr className="border-border" />

            {/* Payment row: Mode, Details, Bank */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Payment Mode</label>
                <Select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="bg-background">
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="RTGS">RTGS</option>
                  <option value="NEFT">NEFT</option>
                </Select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Mode Details</label>
                <Input
                  value={paymentModeDetails}
                  onChange={(e) => setPaymentModeDetails(e.target.value)}
                  placeholder="Ref no / Cheque no..."
                  className="bg-background"
                />
              </div>

              <div className="md:col-span-6 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Chq of Bank</label>
                <Input
                  value={chqOfBank}
                  onChange={(e) => setChqOfBank(e.target.value)}
                  placeholder="Bank name..."
                  className="bg-background"
                />
              </div>
            </div>

            {/* Narration */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Narration</label>
              <textarea
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter transaction details..."
                rows={3}
                className="w-full bg-background rounded-md border border-border p-3 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer controls bar */}
      <footer className="border-t bg-muted/20 py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            className="flex items-center gap-1 font-bold border-border text-foreground bg-background hover:bg-accent"
            onClick={() => window.print()}
          >
            Print
          </Button>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={duplicateCheckbox}
                onChange={(e) => setDuplicateCheckbox(e.target.checked)}
                className="rounded border-border text-primary focus:ring-ring w-4 h-4"
              />
              <span>Duplicate</span>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={printCheckbox}
                onChange={(e) => setPrintCheckbox(e.target.checked)}
                className="rounded border-border text-primary focus:ring-ring w-4 h-4"
              />
              <span>Print</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={!receiptExists}
            onClick={onDelete}
            className="flex items-center gap-1 font-bold border-destructive/20 text-destructive bg-background hover:bg-destructive/10 disabled:opacity-50 disabled:pointer-events-none"
          >
            Delete
          </Button>

          <Button
            onClick={onSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 flex items-center gap-1.5 shadow-sm"
          >
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

      {/* Account Generation Modal */}
      <AccountGenerationModal
        open={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleCreateAccount}
      />
    </div>
  );
}
