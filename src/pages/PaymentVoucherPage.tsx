import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card } from "../components/ui/card";
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none items-center justify-center p-4">
      {/* Outer Card mimicking window look */}
      <Card className="w-full max-w-6xl shadow-2xl border border-slate-300 overflow-hidden rounded-lg">
        {/* Header bar */}
        <div className="bg-[#e2e8f0] border-b border-slate-300 text-slate-800 py-3 text-center text-2xl font-extrabold select-none tracking-wide relative">
          Payment Voucher
        </div>

        {/* Voucher No & Date Section */}
        <div className="bg-[#f1f5f9] px-6 py-3 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-700">Voucher No.:</span>
            <div className="flex items-center">
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
                className="w-20 text-center font-mono font-bold text-blue-700 bg-white border-slate-300 h-9"
              />
              <button
                type="button"
                onClick={() => {
                  const parsed = parseInt(voucherNoInput) || 0;
                  if (parsed > 1) {
                    setVoucherNoInput(String(parsed - 1).padStart(5, "0"));
                  }
                }}
                className="px-2 py-1 bg-white border border-l-0 border-slate-300 hover:bg-slate-50 h-9"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => {
                  const parsed = parseInt(voucherNoInput) || 0;
                  setVoucherNoInput(String(parsed + 1).padStart(5, "0"));
                }}
                className="px-2 py-1 bg-white border border-l-0 border-slate-300 hover:bg-slate-50 h-9 rounded-r"
              >
                &gt;
              </button>
              <Button
                variant="outline"
                onClick={() => setShowVoucherList(!showVoucherList)}
                className="ml-1 bg-white text-slate-700 border-slate-300 hover:bg-slate-50 h-9 px-3"
              >
                List
              </Button>
              <Input
                value={voucherSuffix}
                onChange={(e) => setVoucherSuffix(e.target.value)}
                className="w-16 ml-1 bg-white border-slate-300 text-center font-mono h-9"
              />
            </div>

            {showVoucherList && (
              <div className="absolute z-50 w-48 mt-10 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredVouchers.map((v) => (
                  <div
                    key={v.voucherNo}
                    onMouseDown={() => handleLoadVoucher(v)}
                    className="px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 flex justify-between font-mono border-b border-slate-100"
                  >
                    <span className="font-semibold text-slate-800">{v.voucherNo}</span>
                    <span className="text-slate-400">{v.date}</span>
                  </div>
                ))}
                {filteredVouchers.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-400 text-center">No matching vouchers</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 relative">
            <span className="text-sm font-bold text-slate-700">Date:</span>
            <div className="relative w-36 flex items-center">
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white border-slate-300 font-mono pr-8 text-center h-9 text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                <span className="text-xs text-slate-500">▼</span>
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
        </div>

        {/* Content body split: Form/Grid on left, Preview sidebar on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#f8fafc] p-6 gap-6">
          {message && (
            <div className="col-span-12">
              <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            </div>
          )}
          {error && (
            <div className="col-span-12">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Left panel (Form + Grid) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Cost Center / Account Type / Ledger Account Row */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <span className="col-span-3 text-sm font-bold text-slate-600">Cost Center / A/c Type:</span>
              <div className="col-span-9 flex space-x-2">
                <Select
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  className="bg-white border-slate-300 w-32 h-9"
                >
                  <option value="All">All</option>
                  <option value="Center A">Center A</option>
                  <option value="Center B">Center B</option>
                </Select>
                <Button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 h-9 text-xs whitespace-nowrap"
                >
                  F3 - New A/c
                </Button>
                <div className="relative flex-1">
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
                    className="bg-white border-slate-300 w-full h-9"
                  />
                  {showCustomerDropdown && (
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {customers
                        .filter((c) => c.name.toLowerCase().includes(ledgerAccountSearch.toLowerCase()))
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
            </div>

            {/* Split row for Balance Amount and Allocations Grid */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left values (Balance, Amount, Charges, Discount, TDS) */}
              <div className="md:col-span-6 space-y-3">
                {/* Balance amount */}
                <div className="flex items-center space-x-2">
                  <span className="w-28 text-sm font-semibold text-slate-700">Balance:</span>
                  <Input
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="w-32 font-mono text-sm text-right bg-white border-slate-300 h-9"
                  />
                  <Button className="bg-[#e2e8f0] text-slate-700 hover:bg-[#cbd5e1] border border-slate-300 h-9 px-3 text-xs">
                    Ledger
                  </Button>
                </div>

                {/* Amount */}
                <div className="flex items-center space-x-2">
                  <span className="w-28 text-sm font-semibold text-slate-700">Amount:</span>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-32 font-mono text-sm text-right bg-white border-slate-300 h-9"
                  />
                  <Button className="bg-[#e2e8f0] text-slate-700 hover:bg-[#cbd5e1] border border-slate-300 h-9 px-3 text-xs whitespace-nowrap">
                    Cash Details
                  </Button>
                  <span className="font-bold text-sm text-slate-800">{parseFloat(amount || "0").toFixed(2)}</span>
                </div>

                {/* Bank Charges */}
                <div className="flex items-center space-x-2">
                  <span className="w-28 text-sm font-semibold text-slate-700">Bank Chrages:</span>
                  <Input
                    value={bankCharges}
                    onChange={(e) => setBankCharges(e.target.value)}
                    className="w-32 font-mono text-sm text-right bg-white border-slate-300 h-9"
                  />
                  <span className="text-xs font-semibold text-slate-600">Interest %: {interestPercent}</span>
                </div>

                {/* Discount */}
                <div className="flex items-center space-x-2">
                  <span className="w-28 text-sm font-semibold text-slate-700">Discount:</span>
                  <Input
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-32 font-mono text-sm text-right bg-white border-slate-300 h-9"
                  />
                  <span className="text-xs font-bold text-slate-800">Total: {parseFloat(amount || "0").toFixed(2)}</span>
                </div>

                {/* TDS Amount */}
                <div className="flex items-center space-x-2">
                  <span className="w-28 text-sm font-semibold text-slate-700">T.D.S. Amount:</span>
                  <Input
                    value={tdsAmount}
                    onChange={(e) => setTdsAmount(e.target.value)}
                    className="w-32 font-mono text-sm text-right bg-white border-slate-300 h-9"
                  />
                </div>
              </div>

              {/* Right Allocation Grid */}
              <div className="md:col-span-6 bg-white border border-slate-200 rounded overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="h-8">
                      <TableHead className="text-xs font-bold text-slate-700 uppercase h-8 py-1">Date</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase text-right h-8 py-1">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50 h-8">
                        <TableCell className="p-1">
                          <input
                            type="text"
                            value={row.date}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAllocations((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, date: val } : r))
                              );
                            }}
                            placeholder="dd.mm.yyyy"
                            className="w-full bg-transparent border-0 outline-none px-2 text-xs font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            type="text"
                            value={row.amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAllocations((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, amount: val } : r))
                              );
                            }}
                            className="w-full bg-transparent border-0 outline-none px-2 text-xs font-mono text-right"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Paid from */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <span className="col-span-3 text-sm font-bold text-slate-600">Paid from:</span>
              <div className="col-span-9 flex items-center space-x-3">
                <Input
                  value={paidFrom}
                  onChange={(e) => setPaidFrom(e.target.value)}
                  placeholder="Account name..."
                  className="bg-white border-slate-300 flex-1 h-9"
                />
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Balance Rs. : 0.00</span>
              </div>
            </div>

            {/* Cheque / Mode dropdown & Details */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <div className="col-span-3">
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="bg-white border-slate-300 w-full h-9"
                >
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="RTGS">RTGS</option>
                </Select>
              </div>
              <div className="col-span-9">
                <Input
                  value={paymentModeDetails}
                  onChange={(e) => setPaymentModeDetails(e.target.value)}
                  placeholder="Details..."
                  className="bg-white border-slate-300 w-44 h-9"
                />
              </div>
            </div>

            {/* Narration */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
              <span className="col-span-3 text-sm font-bold text-slate-600">Narration:</span>
              <div className="col-span-9 relative">
                <Input
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Enter narration..."
                  className="bg-white border-slate-300 w-full h-9"
                />
                <span className="absolute right-2 top-2.5 text-xs text-slate-500">▼</span>
              </div>
            </div>

            {/* Quick banks section */}
            <div className="col-span-12 border-t border-slate-200 pt-4 mt-2 flex flex-wrap items-center gap-2">
              <Button className="bg-[#e2e8f0] text-slate-800 hover:bg-[#cbd5e1] border border-slate-300 h-9 px-4 text-xs font-bold">
                Party Bank
              </Button>
              <span className="text-xs font-bold text-slate-700">Party Bank :</span>
              {["Chq. Bank1", "Chq. Bank2", "Chq. Bank3", "Chq. Bank4", "Chq. Bank5"].map((bankName) => (
                <Button
                  key={bankName}
                  onClick={() => setChqOfBank(bankName)}
                  className="bg-[#e2e8f0] hover:bg-[#cbd5e1] text-slate-700 border border-slate-300 h-8 px-3 text-2xs"
                >
                  {bankName}
                </Button>
              ))}
            </div>
          </div>

          {/* Right panel (Image Upload/Preview) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-between border-l border-slate-200 pl-6 space-y-4">
            <div className="w-full max-w-[280px] aspect-square bg-white border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group select-none">
              {imageData ? (
                <img src={imageData} alt="Voucher scan" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-4xl text-slate-300 block mb-2">✕</span>
                  <span className="text-xs font-semibold text-slate-400">Image Preview</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            <div className="flex gap-2 w-full max-w-[280px]">
              <Button
                onClick={handlePreviewClick}
                className="flex-1 bg-[#e2e8f0] text-slate-800 hover:bg-[#cbd5e1] border border-slate-300 h-9 text-xs font-bold"
              >
                Preview
              </Button>
              <div className="relative flex-1">
                <Button className="w-full bg-[#cbd5e1] text-slate-800 hover:bg-[#b8c5d6] border border-slate-300 h-9 text-xs font-bold">
                  Upload
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#cbd5e1] px-6 py-3.5 flex justify-between items-center border-t border-slate-300">
          <div className="flex items-center space-x-6">
            <Button className="bg-[#94a3b8] text-white hover:bg-[#64748b] px-4 h-9 font-semibold text-xs">
              Print RTGS Form
            </Button>
            <span className="font-extrabold text-slate-700 tracking-wider text-sm italic">SUP</span>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={printCheckbox}
                onChange={(e) => setPrintCheckbox(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Print</span>
            </label>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={onDelete}
              className="bg-white text-rose-600 hover:bg-slate-50 border border-slate-300 shadow-sm px-5 h-9 font-semibold text-sm"
            >
              Delete
            </Button>
            <Button
              onClick={onSave}
              className="bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-sm px-6 h-9 font-semibold text-sm"
            >
              Save
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="bg-white text-purple-600 hover:bg-slate-50 border border-purple-300 shadow-sm px-5 h-9 font-semibold text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Generation Modal */}
      <AccountGenerationModal
        open={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleCreateAccount}
      />

      {/* No Image Popup Dialog */}
      <Dialog open={showNoImagePopup} onOpenChange={setShowNoImagePopup}>
        <DialogContent className="max-w-md bg-white border border-slate-300 text-slate-800 rounded-lg p-6 shadow-xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-lg font-bold text-slate-900">
              Preview
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm font-semibold text-slate-700">
            No image uploaded yet to preview.
          </div>
          <DialogFooter className="border-t pt-4 flex justify-end">
            <Button
              onClick={() => setShowNoImagePopup(false)}
              className="bg-[#285482] hover:bg-[#1e3f62] text-white px-5 h-9 font-semibold text-sm"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
