import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AccountGenerationModal } from "../components/AccountGenerationModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";

interface AllocationRow {
  date: string;
  amount: string;
}

interface PaymentVoucher {
  id?: string;
  voucherNo: string;
  voucherSuffix: string;
  date: string;
  costCenter: string;
  accountType: string;
  ledgerAccount: string;
  customerId: number | null;
  balanceAmount: string;
  amount: string;
  interestPercent: string;
  bankCharges: string;
  discount: string;
  tdsAmount: string;
  paidFrom: string;
  paymentMode: string;
  paymentModeDetails: string;
  chqOfBank: string;
  narration: string;
  imageData: string;
  allocations: AllocationRow[];
}

function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function PaymentVoucherPage() {
  const navigate = useNavigate();

  // Form states
  const [voucherNoInput, setVoucherNoInput] = useState("00223");
  const [voucherSuffix, setVoucherSuffix] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [costCenter, setCostCenter] = useState("All");
  const [accountType, setAccountType] = useState("All");
  const [ledgerAccountSearch, setLedgerAccountSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [balanceAmount, setBalanceAmount] = useState("0.00");
  const [amount, setAmount] = useState("0.00");
  const [interestPercent, setInterestPercent] = useState("0.00");
  const [bankCharges, setBankCharges] = useState("0.00");
  const [discount, setDiscount] = useState("0.00");
  const [tdsAmount, setTdsAmount] = useState("0.00");
  const [paidFrom, setPaidFrom] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cheque");
  const [paymentModeDetails, setPaymentModeDetails] = useState("");
  const [chqOfBank, setChqOfBank] = useState("");
  const [narration, setNarration] = useState("");
  const [imageData, setImageData] = useState("");

  // Grid states (5 rows)
  const [allocations, setAllocations] = useState<AllocationRow[]>(
    Array.from({ length: 5 }, () => ({ date: "", amount: "0.00" }))
  );

  // Print checkboxes
  const [printCheckbox, setPrintCheckbox] = useState(false);

  // UI state
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNoImagePopup, setShowNoImagePopup] = useState(false);

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

  const loadVouchers = async () => {
    try {
      const { data } = await api.get("/payment-voucher");
      if (data) {
        const mapped = data.map((v: any) => ({
          id: v.id,
          voucherNo: v.voucherNo,
          voucherSuffix: v.voucherSuffix || "",
          date: fromIsoDate(v.businessDate),
          costCenter: v.costCenter || "All",
          accountType: v.accountType || "All",
          ledgerAccount: v.ledgerAccount || "",
          customerId: v.customerId,
          balanceAmount: String(v.balanceAmount || "0.00"),
          amount: String(v.amount || "0.00"),
          interestPercent: String(v.interestPercent || "0.00"),
          bankCharges: String(v.bankCharges || "0.00"),
          discount: String(v.discount || "0.00"),
          tdsAmount: String(v.tdsAmount || "0.00"),
          paidFrom: v.paidFrom || "",
          paymentMode: v.paymentMode || "Cheque",
          paymentModeDetails: v.paymentModeDetails || "",
          chqOfBank: v.chqOfBank || "",
          narration: v.narration || "",
          imageData: v.imageData || "",
          allocations: (v.allocations || []).map((a: any) => ({
            date: a.allocationDate || "",
            amount: String(a.amount || "0.00"),
          })),
        }));
        setVouchers(mapped);
      }
    } catch (err) {
      console.error("Failed to load vouchers", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    loadVouchers();
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

  const filteredVouchers = useMemo(() => {
    if (!voucherNoInput.trim()) return vouchers;
    return vouchers.filter((v) => v.voucherNo.includes(voucherNoInput.trim()));
  }, [vouchers, voucherNoInput]);

  const handleSelectCustomer = (cust: any) => {
    setSelectedCustomer(cust);
    setLedgerAccountSearch(cust.name);
    setBalanceAmount(cust.openingBalance ? String(cust.openingBalance) : "0.00");
    setShowCustomerDropdown(false);
  };

  const handleLoadVoucher = (v: PaymentVoucher) => {
    setVoucherNoInput(v.voucherNo);
    setVoucherSuffix(v.voucherSuffix);
    setDate(v.date);
    setCostCenter(v.costCenter);
    setAccountType(v.accountType);
    setLedgerAccountSearch(v.ledgerAccount);
    setBalanceAmount(v.balanceAmount);
    setAmount(v.amount);
    setInterestPercent(v.interestPercent);
    setBankCharges(v.bankCharges);
    setDiscount(v.discount);
    setTdsAmount(v.tdsAmount);
    setPaidFrom(v.paidFrom);
    setPaymentMode(v.paymentMode);
    setPaymentModeDetails(v.paymentModeDetails);
    setChqOfBank(v.chqOfBank);
    setNarration(v.narration);
    setImageData(v.imageData);
    setAllocations(
      v.allocations.length > 0
        ? v.allocations
        : Array.from({ length: 5 }, () => ({ date: "", amount: "0.00" }))
    );

    const foundCust = customers.find((c) => c.name === v.ledgerAccount || c.id === v.customerId);
    if (foundCust) {
      setSelectedCustomer(foundCust);
    }
    setShowVoucherList(false);
  };

  useEffect(() => {
    if (voucherNoInput) {
      const match = vouchers.find((v) => v.voucherNo === voucherNoInput.trim());
      if (match) {
        handleLoadVoucher(match);
      }
    }
  }, [voucherNoInput, vouchers]);

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
      costCenter,
      accountType,
      ledgerAccount: ledgerAccountSearch,
      customerId: selectedCustomer?.id || null,
      balanceAmount: parseFloat(balanceAmount) || 0,
      amount: parseFloat(amount) || 0,
      interestPercent: parseFloat(interestPercent) || 0,
      bankCharges: parseFloat(bankCharges) || 0,
      discount: parseFloat(discount) || 0,
      tdsAmount: parseFloat(tdsAmount) || 0,
      paidFrom,
      paymentMode,
      paymentModeDetails,
      chqOfBank,
      narration,
      imageData,
      allocations: allocations
        .filter((a) => a.date.trim() !== "")
        .map((a) => ({
          date: a.date.trim(),
          amount: parseFloat(a.amount) || 0,
        })),
    };

    try {
      const match = vouchers.find((v) => v.voucherNo === payload.voucherNo);
      if (match && (match as any).id) {
        await api.post("/payment-voucher", { ...payload, id: (match as any).id });
        setMessage(`Voucher ${payload.voucherNo} updated successfully.`);
      } else {
        await api.post("/payment-voucher", payload);
        setMessage(`Voucher ${payload.voucherNo} saved successfully.`);
      }
      loadVouchers();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save payment voucher.");
    }
  };

  const onDelete = async () => {
    setError("");
    setMessage("");
    const num = voucherNoInput.trim();
    if (!num) return;

    const match = vouchers.find((v) => v.voucherNo === num);
    if (!match || !(match as any).id) {
      setError("Cannot delete an unsaved voucher.");
      return;
    }

    try {
      await api.delete(`/payment-voucher/by-voucher-no/${num}`);
      setMessage(`Voucher ${num} deleted successfully.`);
      loadVouchers();

      // Reset
      setVoucherNoInput("");
      setVoucherSuffix("");
      setDate(getTodayDateString());
      setCostCenter("All");
      setAccountType("All");
      setLedgerAccountSearch("");
      setSelectedCustomer(null);
      setBalanceAmount("0.00");
      setAmount("0.00");
      setInterestPercent("0.00");
      setBankCharges("0.00");
      setDiscount("0.00");
      setTdsAmount("0.00");
      setPaidFrom("");
      setPaymentMode("Cheque");
      setPaymentModeDetails("");
      setChqOfBank("");
      setNarration("");
      setImageData("");
      setAllocations(Array.from({ length: 5 }, () => ({ date: "", amount: "0.00" })));
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete voucher.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewClick = () => {
    if (imageData) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<img src="${imageData}" style="max-width: 100%; max-height: 100%;" />`);
      }
    } else {
      setShowNoImagePopup(true);
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [voucherNoInput, voucherSuffix, date, costCenter, accountType, ledgerAccountSearch, selectedCustomer, amount, interestPercent, bankCharges, discount, tdsAmount, paidFrom, paymentMode, paymentModeDetails, chqOfBank, narration, imageData, allocations, vouchers]);

  const handleCreateAccount = async (formData: any) => {
    try {
      const { data } = await api.post("/customers", formData);
      setCustomers((prev) => [...prev, data]);
      setSelectedCustomer(data);
      setLedgerAccountSearch(data.name);
      setBalanceAmount(data.openingBalance ? String(data.openingBalance) : "0.00");
      setIsAccountModalOpen(false);
      setMessage(`Account created successfully for ${data.name}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create account");
    }
  };

  const voucherExists = useMemo(() => {
    return vouchers.some((v) => v.voucherNo === voucherNoInput.trim());
  }, [vouchers, voucherNoInput]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none pb-8">
      {/* Header */}
      <header className="border-b bg-card shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Payment Voucher</h1>
        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-muted text-xs font-semibold shadow-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Active Mode</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>BRT Trading Co.</span>
          <span>›</span>
          <span>Data Entry</span>
          <span>›</span>
          <span className="text-foreground font-bold">Payment Voucher</span>
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

        {/* Card 1: Top Voucher Info */}
        <Card className="shadow-xs border-border bg-card">
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
                  className="w-20 text-center font-mono font-bold text-primary bg-background border-x-0 rounded-none h-9"
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
                  {filteredVouchers.map((v) => (
                    <div
                      key={v.voucherNo}
                      onMouseDown={() => handleLoadVoucher(v)}
                      className="px-3 py-2 text-xs cursor-pointer hover:bg-accent flex justify-between font-mono border-b border-border"
                    >
                      <span className="font-semibold text-foreground">{v.voucherNo}</span>
                      <span className="text-muted-foreground">{v.date}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoucherList(!showVoucherList)}
                className="ml-1 bg-background text-muted-foreground border-border hover:bg-accent"
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

        {/* Split Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel (Form + Grid) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Cost Center</label>
                    <Select value={costCenter} onChange={(e) => setCostCenter(e.target.value)} className="bg-background">
                      <option value="All">All</option>
                      <option value="Center A">Center A</option>
                      <option value="Center B">Center B</option>
                    </Select>
                  </div>
                  <div className="md:col-span-8 space-y-1 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Ledger Account</label>
                      <Button variant="link" size="sm" onClick={() => setIsAccountModalOpen(true)} className="h-auto p-0 text-xs font-bold text-primary">
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
                        placeholder="Search Account..."
                        className="bg-background"
                      />
                      {showCustomerDropdown && (
                        <div className="absolute z-[100] w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto text-popover-foreground">
                          {customers
                            .filter((c) => c.name.toLowerCase().includes(ledgerAccountSearch.toLowerCase()))
                            .map((c) => (
                              <div key={c.id} onMouseDown={() => handleSelectCustomer(c)} className="px-3 py-2 text-xs font-semibold text-foreground cursor-pointer hover:bg-accent">
                                {c.name}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase w-20">Balance</label>
                      <Input readOnly disabled value={balanceAmount} className="bg-muted/50 font-mono text-sm text-right flex-1 border-border" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase w-20">Amount</label>
                      <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-background font-mono text-sm text-right flex-1" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase w-20">Bank Chrg.</label>
                      <Input value={bankCharges} onChange={(e) => setBankCharges(e.target.value)} className="bg-background font-mono text-sm text-right flex-1" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase w-20">Discount</label>
                      <Input value={discount} onChange={(e) => setDiscount(e.target.value)} className="bg-background font-mono text-sm text-right flex-1" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase w-20">TDS Amt.</label>
                      <Input value={tdsAmount} onChange={(e) => setTdsAmount(e.target.value)} className="bg-background font-mono text-sm text-right flex-1" />
                    </div>
                  </div>

                  <div className="border border-border rounded overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="h-8">
                          <TableHead className="text-2xs font-bold uppercase py-1 text-foreground">Date</TableHead>
                          <TableHead className="text-2xs font-bold uppercase text-right py-1 text-foreground">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allocations.map((row, idx) => (
                          <TableRow key={idx} className="h-8 border-border">
                            <TableCell className="p-1">
                              <input
                                value={row.date}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAllocations(prev => prev.map((r, i) => i === idx ? { ...r, date: val } : r));
                                }}
                                className="w-full bg-transparent border-0 text-xs font-mono px-2 text-foreground outline-none"
                                placeholder="dd.mm.yyyy"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={row.amount}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAllocations(prev => prev.map((r, i) => i === idx ? { ...r, amount: val } : r));
                                }}
                                className="w-full bg-transparent border-0 text-xs font-mono text-right px-2 text-foreground outline-none"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Paid From</label>
                  <Input value={paidFrom} onChange={(e) => setPaidFrom(e.target.value)} placeholder="Enter account name..." className="bg-background" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Payment Mode</label>
                    <Select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="bg-background">
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="RTGS">RTGS</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Mode Details</label>
                    <Input value={paymentModeDetails} onChange={(e) => setPaymentModeDetails(e.target.value)} placeholder="Ref no / Cheque no..." className="bg-background" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Narration</label>
                  <textarea
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    className="w-full border border-border rounded p-2 text-sm bg-background text-foreground outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                    placeholder="Enter narration notes..."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/10 border border-border rounded">
              <span className="text-xs font-bold text-muted-foreground uppercase px-2">Party Banks:</span>
              {["Chq. Bank1", "Chq. Bank2", "Chq. Bank3", "Chq. Bank4", "Chq. Bank5"].map((bankName) => (
                <Button key={bankName} variant="outline" size="sm" onClick={() => setChqOfBank(bankName)} className="text-2xs h-7 px-2 bg-background hover:bg-accent border-border">
                  {bankName}
                </Button>
              ))}
            </div>
          </div>

          {/* Right Area: Image Upload */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-card border-border shadow-sm p-5 flex flex-col items-center">
              <div className="w-full aspect-square bg-muted/20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden mb-4">
                {imageData ? (
                  <img src={imageData} alt="Voucher scan" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <span className="text-4xl block mb-2">📷</span>
                    <span className="text-xs font-semibold">Scan / Image Preview</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 text-xs border-border hover:bg-accent" onClick={handlePreviewClick}>👁 Preview</Button>
                <div className="relative flex-1">
                  <Button variant="outline" className="w-full text-xs border-border hover:bg-accent">📁 Upload</Button>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer controls bar */}
      <footer className="border-t bg-muted/20 py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <div className="flex items-center gap-6">
          <Button variant="outline" className="text-xs font-bold border-border hover:bg-accent">Print RTGS Form</Button>
          <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={printCheckbox} onChange={(e) => setPrintCheckbox(e.target.checked)} className="rounded border-border text-primary focus:ring-ring w-4 h-4" />
            <span>Print</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={!voucherExists}
            onClick={onDelete}
            className="text-destructive border-destructive/20 hover:bg-destructive/10 px-5"
          >
            Delete
          </Button>
          <Button
            onClick={onSave}
            className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-8 shadow-sm"
          >
            Save (F5)
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-border hover:bg-accent"
          >
            Close (ESC)
          </Button>
        </div>
      </footer>

      <AccountGenerationModal open={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSave={handleCreateAccount} />

      <Dialog open={showNoImagePopup} onOpenChange={setShowNoImagePopup}>
        <DialogContent className="max-w-md bg-popover border border-border text-popover-foreground">
          <DialogHeader className="border-b pb-2">
            <DialogTitle>No Image</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm font-semibold text-muted-foreground">No image uploaded yet to preview.</div>
          <DialogFooter className="border-t pt-4">
            <Button onClick={() => setShowNoImagePopup(false)} className="bg-primary text-primary-foreground hover:opacity-90">OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
