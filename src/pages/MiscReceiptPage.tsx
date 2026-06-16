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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none items-center justify-center p-4">
      {/* Modal/Window Frame resembling the screenshot */}
      <Card className="w-full max-w-3xl shadow-2xl border border-slate-300 overflow-hidden rounded-lg">
        {/* Header */}
        <div className="bg-[#285482] text-white px-4 py-2.5 flex justify-between items-center select-none font-semibold">
          <span>Miscellaneous Receipt</span>
          <div className="flex items-center space-x-3 text-sm opacity-90">
            <button className="hover:bg-slate-700/50 w-6 h-6 flex items-center justify-center rounded">—</button>
            <button className="hover:bg-slate-700/50 w-6 h-6 flex items-center justify-center rounded">?</button>
          </div>
        </div>

        {/* Form Body */}
        <CardContent className="bg-[#f0f5fa] p-6 space-y-3.5">
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

          {/* Row 1: Voucher No & Date */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Voucher No.:</span>
              <div className="flex items-center flex-1">
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
                  className="w-24 text-center font-mono font-bold text-blue-700 bg-white border border-slate-300 h-9"
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
                    <div className="px-3 py-2 text-xs text-slate-400 text-center">No matching vouchers</div>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-6 flex items-center space-x-2 justify-end relative">
              <span className="text-sm font-semibold text-slate-700">Date:</span>
              <div className="relative w-40 flex items-center">
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white border-slate-300 font-mono pr-8 text-center h-9"
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

          {/* Row 2: Account Type */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Account Type :</span>
              <div className="flex items-center space-x-2 flex-1">
                <Select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="bg-white border-slate-300 w-48 h-9"
                >
                  <option value="All">All</option>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                </Select>
                <Button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 h-9 text-xs"
                >
                  F3 - New A/c
                </Button>
              </div>
            </div>
          </div>

          {/* Row 3: Ledger Account */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Ledger Account:</span>
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
                  placeholder="Search ledger account name..."
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

          {/* Row 4: Balance */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Balance:</span>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  disabled
                  value={selectedCustomer ? `${selectedCustomer.openingBalance || "0.00"} (${selectedCustomer.openingBalanceType || "D"})` : "0.00"}
                  className="w-40 font-mono text-sm font-semibold text-purple-700 text-right bg-[#e9eff5] border border-slate-300 h-9"
                />
                <Button className="bg-[#cbd5e1] hover:bg-[#b8c5d6] text-slate-700 border border-slate-300 h-9 px-4 text-xs font-semibold">
                  Ledger
                </Button>
              </div>
            </div>
          </div>

          {/* Row 5: Amount */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Amount:</span>
              <div className="flex items-center space-x-2">
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-40 font-mono text-sm text-right bg-white border-slate-300 h-9"
                />
                <Button className="bg-[#cbd5e1] hover:bg-[#b8c5d6] text-slate-700 border border-slate-300 h-9 px-4 text-xs font-semibold">
                  Cash Details
                </Button>
                <div className="w-32 bg-white border border-slate-300 h-9 rounded flex items-center justify-end px-3 font-mono font-bold text-slate-900 text-sm">
                  {parseFloat(amount || "0").toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Row 6: Interest % */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Interest %:</span>
              <Input
                value={interestPercent}
                onChange={(e) => setInterestPercent(e.target.value)}
                className="w-40 font-mono text-sm text-right bg-white border-slate-300 h-9"
              />
            </div>
          </div>

          {/* Row 7: Discount */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Discount:</span>
              <Input
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-40 font-mono text-sm text-right bg-white border-slate-300 h-9"
              />
            </div>
          </div>

          {/* Row 8: TDS Amount */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">T.D.S. Amount:</span>
              <Input
                value={tdsAmount}
                onChange={(e) => setTdsAmount(e.target.value)}
                className="w-40 font-mono text-sm text-right bg-white border-slate-300 h-9"
              />
            </div>
          </div>

          {/* Row 9: Deposited In */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Deposited in:</span>
              <Select
                value={depositedIn}
                onChange={(e) => setDepositedIn(e.target.value)}
                className="bg-white border-slate-300 w-80 h-9"
              >
                <option value="Cash">Cash</option>
                <option value="Bank 1">Bank 1</option>
                <option value="Bank 2">Bank 2</option>
                <option value="Bank 3">Bank 3</option>
                <option value="Bank 4">Bank 4</option>
                <option value="Bank 5">Bank 5</option>
              </Select>
            </div>
          </div>

          {/* Row 10: Mode & Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Payment Mode:</span>
              <div className="flex space-x-2 flex-1">
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="bg-white border-slate-300 w-32 h-9"
                >
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="RTGS">RTGS</option>
                  <option value="NEFT">NEFT</option>
                </Select>
                <Input
                  value={paymentModeDetails}
                  onChange={(e) => setPaymentModeDetails(e.target.value)}
                  placeholder="Details..."
                  className="bg-white border-slate-300 w-44 h-9"
                />
              </div>
            </div>
          </div>

          {/* Row 11: Chq of Bank */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Chq of Bank:</span>
              <Input
                value={chqOfBank}
                onChange={(e) => setChqOfBank(e.target.value)}
                className="bg-white border-slate-300 flex-1 h-9"
              />
            </div>
          </div>

          {/* Row 12: Narration */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-12 flex items-center space-x-2">
              <span className="w-28 text-sm font-semibold text-slate-700">Narration:</span>
              <div className="relative flex-1">
                <Input
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Enter narration notes..."
                  className="bg-white border-slate-300 w-full h-9"
                />
                <span className="absolute right-2 top-2 text-xs text-slate-500">▼</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="bg-[#86efac] dark:bg-emerald-950 px-6 py-3 flex justify-between items-center border-t border-slate-300">
          <Button className="bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-sm px-5 h-9 font-semibold">
            Print
          </Button>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={duplicateCheckbox}
                onChange={(e) => setDuplicateCheckbox(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Duplicate</span>
            </label>

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
              className="bg-white text-rose-600 hover:bg-slate-50 border border-slate-300 shadow-sm px-5 h-9 font-semibold"
            >
              Delete
            </Button>
            <Button
              onClick={onSave}
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] border border-[#15803d] shadow-sm px-6 h-9 font-semibold"
            >
              Save
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="bg-[#c084fc] hover:bg-[#a855f7] text-slate-900 border border-[#a855f7] shadow-sm px-5 h-9 font-semibold"
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
    </div>
  );
}
