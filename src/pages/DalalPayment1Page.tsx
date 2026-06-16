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

interface PaymentDetailRow {
  farmer: string;
  pattiNo: string;
  amount: string;
  tdsRs: string;
  chequeNo: string;
  narration: string;
  farmerId: number | null;
}

interface DalalVoucher1 {
  voucherNo: string;
  date: string;
  tokenNo: string;
  rtgsAfter1PM: boolean;
  createdBy: string;
  byHand: string;
  paymentDetails: PaymentDetailRow[];
  partyAddress: string;
  balance: string;
  crateAmt: string;
  rtgsCharges: string;
  partyBank: string;
  mode: string;
  bankAccount: string;
  chequeDdNo: string;
  rtgsDate: string;
  cashAmount: string;
  ddCommission: string;
  selectedQuickBank: string;
}

function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function DalalPayment1Page() {
  const navigate = useNavigate();
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  // Top header states
  const [voucherNoInput, setVoucherNoInput] = useState("00001");
  const [date, setDate] = useState(getTodayDateString());
  const [tokenNo, setTokenNo] = useState("--");
  const [rtgsAfter1PM, setRtgsAfter1PM] = useState(false);
  const [createdBy, setCreatedBy] = useState("--");
  const [byHand, setByHand] = useState("");
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [vouchers, setVouchers] = useState<DalalVoucher1[]>([]);

  // Middle Payment Details states
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailRow[]>(
    Array.from({ length: 7 }, () => ({
      farmer: "Farmer [F2]",
      pattiNo: "--",
      amount: "0.00",
      tdsRs: "0.00",
      chequeNo: "--",
      narration: "--",
      farmerId: null,
    }))
  );
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(0);
  const [partyAddress, setPartyAddress] = useState("");

  // Customer search states inside rows
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerDropdownRowIdx, setShowCustomerDropdownRowIdx] = useState<number | null>(null);
  const [farmerSearchText, setFarmerSearchText] = useState("");

  // Bottom states
  const [balance, setBalance] = useState("0.00");
  const [crateAmt, setCrateAmt] = useState("0.00");
  const [rtgsCharges, setRtgsCharges] = useState("0.00");
  const [partyBank, setPartyBank] = useState("0");
  const [mode, setMode] = useState("Cheque");
  const [bankAccount, setBankAccount] = useState("");
  const [chequeDdNo, setChequeDdNo] = useState("--");
  const [rtgsDate, setRtgsDate] = useState("dd.mm.yyyy");
  const [cashAmount, setCashAmount] = useState("0.00");
  const [ddCommission, setDdCommission] = useState("0.00");
  const [selectedQuickBank, setSelectedQuickBank] = useState("Bank 1");

  // Account Modal state
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

  // Load vouchers from API
  const loadVouchers = async () => {
    try {
      const { data } = await api.get("/dalal-payment-1");
      if (data) {
        const mapped = data.map((v: any) => ({
          id: v.id,
          voucherNo: v.voucherNo,
          date: fromIsoDate(v.businessDate),
          tokenNo: v.tokenNo,
          rtgsAfter1PM: v.rtgsAfter1PM,
          createdBy: v.createdBy,
          byHand: v.byHand,
          paymentDetails: (v.paymentDetails || []).map((det: any) => ({
            farmer: det.farmerName,
            pattiNo: det.pattiNo,
            amount: String(det.amount || "0.00"),
            tdsRs: String(det.tdsRs || "0.00"),
            chequeNo: det.chequeNo,
            narration: det.narration,
            farmerId: det.farmerId
          })),
          partyAddress: v.partyAddress,
          balance: String(v.balance || "0.00"),
          crateAmt: String(v.crateAmt || "0.00"),
          rtgsCharges: String(v.rtgsCharges || "0.00"),
          partyBank: v.partyBank,
          mode: v.mode,
          bankAccount: v.bankAccount,
          chequeDdNo: v.chequeDdNo,
          rtgsDate: v.rtgsDate,
          cashAmount: String(v.cashAmount || "0.00"),
          ddCommission: String(v.ddCommission || "0.00"),
          selectedQuickBank: v.selectedQuickBank
        }));
        setVouchers(mapped);
      }
    } catch (err) {
      console.error("Failed to load vouchers from API", err);
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

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    if (!voucherNoInput.trim()) return vouchers;
    return vouchers.filter((v) => v.voucherNo.includes(voucherNoInput.trim()));
  }, [vouchers, voucherNoInput]);

  // Calculate sum total of rows amount
  const totalAmount = useMemo(() => {
    return paymentDetails
      .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
      .toFixed(2);
  }, [paymentDetails]);

  // Row selection handler
  const handleSelectRow = (idx: number) => {
    setSelectedRowIdx(idx);
    const row = paymentDetails[idx];
    setFarmerSearchText(row.farmer === "Farmer [F2]" ? "" : row.farmer);
  };

  // Add row
  const handleAddRow = () => {
    setPaymentDetails((prev) => [
      ...prev,
      {
        farmer: "Farmer [F2]",
        pattiNo: "--",
        amount: "0.00",
        tdsRs: "0.00",
        chequeNo: "--",
        narration: "--",
        farmerId: null,
      },
    ]);
  };

  // Remove selected row
  const handleRemoveRow = () => {
    if (selectedRowIdx !== null && paymentDetails.length > 1) {
      setPaymentDetails((prev) => prev.filter((_, i) => i !== selectedRowIdx));
      setSelectedRowIdx(Math.max(0, selectedRowIdx - 1));
    }
  };

  // Farmer selection inside cell dropdown
  const handleSelectFarmerInRow = (idx: number, cust: any) => {
    setPaymentDetails((prev) =>
      prev.map((r, i) =>
        i === idx
          ? {
              ...r,
              farmer: cust.name,
              farmerId: cust.id,
            }
          : r
      )
    );
    setShowCustomerDropdownRowIdx(null);
    // Auto update address if available
    if (cust.address) {
      setPartyAddress(cust.address);
    }
  };

  // Handle Account Generation Modal save callback
  const handleCreateCustomerAccount = async (formData: any) => {
    try {
      const { data } = await api.post("/customers", formData);
      setCustomers((prev) => [...prev, data]);
      if (selectedRowIdx !== null) {
        handleSelectFarmerInRow(selectedRowIdx, data);
      }
      setIsAccountModalOpen(false);
      setMessage(`Account created successfully for ${data.name}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create customer account");
    }
  };

  // Hotkey bindings
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
  }, [
    voucherNoInput,
    date,
    tokenNo,
    rtgsAfter1PM,
    createdBy,
    byHand,
    paymentDetails,
    partyAddress,
    balance,
    crateAmt,
    rtgsCharges,
    partyBank,
    mode,
    bankAccount,
    chequeDdNo,
    rtgsDate,
    cashAmount,
    ddCommission,
    selectedQuickBank,
    vouchers,
  ]);

  // Load existing voucher
  const handleLoadVoucher = (v: DalalVoucher1) => {
    setVoucherNoInput(v.voucherNo);
    setDate(v.date);
    setTokenNo(v.tokenNo);
    setRtgsAfter1PM(v.rtgsAfter1PM);
    setCreatedBy(v.createdBy);
    setByHand(v.byHand);
    setPaymentDetails(v.paymentDetails);
    setPartyAddress(v.partyAddress);
    setBalance(v.balance);
    setCrateAmt(v.crateAmt);
    setRtgsCharges(v.rtgsCharges);
    setPartyBank(v.partyBank);
    setMode(v.mode);
    setBankAccount(v.bankAccount);
    setChequeDdNo(v.chequeDdNo);
    setRtgsDate(v.rtgsDate);
    setCashAmount(v.cashAmount);
    setDdCommission(v.ddCommission);
    setSelectedQuickBank(v.selectedQuickBank);
    setShowVoucherList(false);
  };

  // Auto load voucher if typed matches
  useEffect(() => {
    if (voucherNoInput) {
      const match = vouchers.find((v) => v.voucherNo === voucherNoInput.trim());
      if (match) {
        handleLoadVoucher(match);
      }
    }
  }, [voucherNoInput]);

  // Save voucher
  const onSave = async () => {
    setError("");
    setMessage("");

    if (!voucherNoInput.trim()) {
      setError("Voucher number is required.");
      return;
    }

    const payload = {
      voucherNo: voucherNoInput.trim(),
      businessDate: toIsoDate(date),
      tokenNo,
      rtgsAfter1PM,
      createdBy,
      byHand,
      paymentDetails: paymentDetails.map((det) => ({
        farmerId: det.farmerId,
        farmerName: det.farmer,
        pattiNo: det.pattiNo,
        amount: parseFloat(det.amount) || 0,
        tdsRs: parseFloat(det.tdsRs) || 0,
        chequeNo: det.chequeNo,
        narration: det.narration
      })),
      partyAddress,
      balance: parseFloat(balance) || 0,
      crateAmt: parseFloat(crateAmt) || 0,
      rtgsCharges: parseFloat(rtgsCharges) || 0,
      partyBank,
      mode,
      bankAccount,
      chequeDdNo,
      rtgsDate,
      cashAmount: parseFloat(cashAmount) || 0,
      ddCommission: parseFloat(ddCommission) || 0,
      selectedQuickBank,
    };

    try {
      const match = vouchers.find((v) => v.voucherNo === payload.voucherNo);
      if (match && (match as any).id) {
        await api.put(`/dalal-payment-1/${(match as any).id}`, payload);
        setMessage(`Voucher ${payload.voucherNo} updated successfully.`);
      } else {
        await api.post("/dalal-payment-1", payload);
        setMessage(`Voucher ${payload.voucherNo} saved successfully.`);
      }
      loadVouchers();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save voucher.");
    }
  };

  // Delete voucher
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
      await api.delete(`/dalal-payment-1/${(match as any).id}`);
      setMessage(`Voucher ${num} deleted successfully.`);
      loadVouchers();
      
      // Reset Form
      setVoucherNoInput("");
      setDate(getTodayDateString());
      setTokenNo("--");
      setRtgsAfter1PM(false);
      setCreatedBy("--");
      setByHand("");
      setPaymentDetails(
        Array.from({ length: 7 }, () => ({
          farmer: "Farmer [F2]",
          pattiNo: "--",
          amount: "0.00",
          tdsRs: "0.00",
          chequeNo: "--",
          narration: "--",
          farmerId: null,
        }))
      );
      setPartyAddress("");
      setBalance("0.00");
      setCrateAmt("0.00");
      setRtgsCharges("0.00");
      setPartyBank("0");
      setMode("Cheque");
      setBankAccount("");
      setChequeDdNo("--");
      setRtgsDate("dd.mm.yyyy");
      setCashAmount("0.00");
      setDdCommission("0.00");
      setSelectedQuickBank("Bank 1");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete voucher.");
    }
  };

  // Check if voucher exists
  const voucherExists = useMemo(() => {
    return vouchers.some((v) => v.voucherNo === voucherNoInput.trim());
  }, [vouchers, voucherNoInput]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none pb-8">
      {/* Header */}
      <header className="border-b bg-white shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Dalal Payment 1 / 2</h1>
        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-slate-50 text-xs font-semibold shadow-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-500">Active Mode</span>
        </div>
      </header>

      {/* Main container */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>{selectedFirm?.name || "BRT Trading Co."}</span>
          <span>›</span>
          <span>Data Entry</span>
          <span>›</span>
          <span className="text-slate-900 font-bold">Dalal payment voucher 1 / 2</span>
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

        {/* Top Controls Card */}
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Voucher No with navigation arrows */}
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

            {/* Token no & checkbox */}
            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Token no.</span>
              <Input
                value={tokenNo}
                onChange={(e) => setTokenNo(e.target.value)}
                className="w-20 font-mono text-xs bg-white"
              />
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rtgsAfter1PM}
                  onChange={(e) => setRtgsAfter1PM(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>RTGS after 1 PM</span>
              </label>
            </div>

            {/* Created By */}
            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Created by</span>
              <Input
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full text-xs font-mono bg-white"
              />
            </div>

            {/* By hand field */}
            <div className="md:col-span-12 flex flex-col md:flex-row items-center gap-3 border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">By hand</span>
              <Input
                value={byHand}
                onChange={(e) => setByHand(e.target.value)}
                placeholder="Enter name..."
                className="flex-1 bg-white text-sm"
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="font-semibold text-xs text-slate-700 bg-white border-slate-200">
                  Paid memo
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3">
                  RTGS
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-3">
                  ✓ Paid all
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Split grid for Payment Details & Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Payment details Table */}
          <Card className="lg:col-span-8 bg-white border-slate-200 shadow-sm">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold tracking-wider text-slate-700 uppercase">
                PAYMENT DETAILS
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-3 flex items-center gap-1"
                >
                  + Add row
                </Button>
                <Button
                  onClick={handleRemoveRow}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-8 px-3 flex items-center gap-1"
                >
                  Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto relative">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-bold text-slate-700 uppercase">#</TableHead>
                    <TableHead className="w-48 text-xs font-bold text-slate-700 uppercase">Farmer</TableHead>
                    <TableHead className="w-24 text-xs font-bold text-slate-700 uppercase">Patti no.</TableHead>
                    <TableHead className="w-28 text-xs font-bold text-slate-700 uppercase">Amount</TableHead>
                    <TableHead className="w-24 text-xs font-bold text-slate-700 uppercase">TDS Rs.</TableHead>
                    <TableHead className="w-28 text-xs font-bold text-slate-700 uppercase">Cheque #</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 uppercase">Narration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentDetails.map((row, idx) => (
                    <TableRow
                      key={idx}
                      onClick={() => handleSelectRow(idx)}
                      className={`hover:bg-slate-50/50 cursor-pointer ${
                        selectedRowIdx === idx ? "bg-blue-50/60" : ""
                      }`}
                    >
                      <TableCell className="text-center font-mono text-xs text-slate-400 p-2">
                        {idx + 1}
                      </TableCell>
                      {/* Farmer Cell with interactive dropdown search */}
                      <TableCell className="p-2 relative">
                        {selectedRowIdx === idx ? (
                          <div className="relative">
                            <Input
                              value={farmerSearchText}
                              onChange={(e) => {
                                setFarmerSearchText(e.target.value);
                                setShowCustomerDropdownRowIdx(idx);
                              }}
                              onFocus={() => setShowCustomerDropdownRowIdx(idx)}
                              className="h-8 text-xs font-semibold"
                            />
                            {showCustomerDropdownRowIdx === idx && (
                              <div className="absolute left-0 top-full z-[100] w-64 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {customers
                                  .filter((c) => c.name.toLowerCase().includes(farmerSearchText.toLowerCase()))
                                  .map((c) => (
                                    <div
                                      key={c.id}
                                      onMouseDown={() => handleSelectFarmerInRow(idx, c)}
                                      className="px-3 py-2 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50"
                                    >
                                      {c.name}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-700">{row.farmer}</span>
                        )}
                      </TableCell>
                      {/* Patti No */}
                      <TableCell className="p-2">
                        <Input
                          value={row.pattiNo}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPaymentDetails((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, pattiNo: val } : r))
                            );
                          }}
                          className="h-8 font-mono text-xs py-1 px-2 border-slate-200"
                        />
                      </TableCell>
                      {/* Amount */}
                      <TableCell className="p-2">
                        <Input
                          value={row.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPaymentDetails((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, amount: val } : r))
                            );
                          }}
                          className="h-8 font-mono text-xs py-1 px-2 border-slate-200 font-bold text-slate-950 text-right"
                        />
                      </TableCell>
                      {/* TDS Rs */}
                      <TableCell className="p-2">
                        <Input
                          value={row.tdsRs}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPaymentDetails((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, tdsRs: val } : r))
                            );
                          }}
                          className="h-8 font-mono text-xs py-1 px-2 border-slate-200 text-right"
                        />
                      </TableCell>
                      {/* Cheque # */}
                      <TableCell className="p-2">
                        <Input
                          value={row.chequeNo}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPaymentDetails((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, chequeNo: val } : r))
                            );
                          }}
                          className="h-8 font-mono text-xs py-1 px-2 border-slate-200"
                        />
                      </TableCell>
                      {/* Narration */}
                      <TableCell className="p-2">
                        <Input
                          value={row.narration}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPaymentDetails((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, narration: val } : r))
                            );
                          }}
                          className="h-8 text-xs py-1 px-2 border-slate-200"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Table actions bar */}
              <div className="p-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      if (selectedRowIdx !== null) {
                        const row = paymentDetails[selectedRowIdx];
                        const found = customers.find((c) => c.name === row.farmer || c.id === row.farmerId);
                        if (found) {
                          // Display name prompt
                          const newName = window.prompt("Edit farmer account name:", found.name);
                          if (newName) {
                            api.put(`/customers/${found.id}`, { ...found, name: newName }).then(({ data }) => {
                              setCustomers((prev) => prev.map((c) => (c.id === data.id ? data : c)));
                              setPaymentDetails((prev) =>
                                prev.map((r, i) => (i === selectedRowIdx ? { ...r, farmer: data.name } : r))
                              );
                            });
                          }
                        }
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-white border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setIsAccountModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Ledger
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
                  <span className="font-mono text-base font-extrabold text-red-600 bg-white border border-slate-200 rounded px-3 py-1 min-w-28 text-right">
                    {totalAmount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Separate cheque for all
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel: Previews */}
          <div className="lg:col-span-4 space-y-6">
            {/* Preview Card */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  PREVIEW
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-slate-50/50 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mb-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span className="text-xs font-semibold">Cheque / document preview</span>
                </div>
                <Button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs">
                  👁 Preview
                </Button>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  ADDRESS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <textarea
                  value={partyAddress}
                  onChange={(e) => setPartyAddress(e.target.value)}
                  placeholder="Party address..."
                  rows={3}
                  className="w-full bg-slate-50/50 rounded-md border border-slate-200 p-2 text-xs focus:bg-white outline-none focus:ring-1 focus:ring-blue-400"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Financial Properties Panel */}
        <Card className="shadow-sm border-slate-200 bg-slate-50/60 p-4">
          <CardContent className="p-0 space-y-4">
            {/* Figures Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Balance</label>
                <Input
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="bg-white text-right font-mono font-bold text-red-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Crate amt.</label>
                <Input
                  value={crateAmt}
                  onChange={(e) => setCrateAmt(e.target.value)}
                  className="bg-white text-right font-mono"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">RTGS charges</label>
                <Input
                  value={rtgsCharges}
                  onChange={(e) => setRtgsCharges(e.target.value)}
                  className="bg-white text-right font-mono"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1 flex flex-col justify-end">
                <Button className="bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs h-9">
                  Select party bank
                </Button>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Party bank</label>
                <Input
                  value={partyBank}
                  onChange={(e) => setPartyBank(e.target.value)}
                  className="bg-white font-mono"
                />
              </div>
            </div>

            {/* Mode & Bank Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mode</label>
                <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="RTGS">RTGS</option>
                  <option value="NEFT">NEFT</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bank account...</label>
                <Input
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Select bank..."
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cheque / DD no.</label>
                <Input
                  value={chequeDdNo}
                  onChange={(e) => setChequeDdNo(e.target.value)}
                  className="bg-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">RTGS date</label>
                <Input
                  value={rtgsDate}
                  onChange={(e) => setRtgsDate(e.target.value)}
                  className="bg-white font-mono text-center"
                />
              </div>
            </div>

            {/* Cash & Commissions row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs text-slate-700 font-semibold flex items-center gap-1">
                💵 Cash details
              </Button>
              <Input
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-28 font-mono text-xs bg-white text-right h-8"
              />

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">DD commission</span>
                <Input
                  value={ddCommission}
                  onChange={(e) => setDdCommission(e.target.value)}
                  className="w-28 font-mono text-xs bg-white text-right h-8"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs h-8">
                  RTGS form
                </Button>
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-8">
                  Cover letter
                </Button>
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-8">
                  RTGS to transporter
                </Button>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Quick Banks */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Banks:</span>
              <div className="flex gap-2">
                {["Bank 1", "Bank 2", "Bank 3", "Bank 4", "Bank 5"].map((bk) => (
                  <button
                    key={bk}
                    type="button"
                    onClick={() => setSelectedQuickBank(bk)}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors shadow-xs ${
                      selectedQuickBank === bk
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {bk}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer controls bar */}
      <footer className="border-t bg-slate-50 py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <div className="flex items-center gap-6">
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
            disabled={!voucherExists}
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
            className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

      {/* Account Modal for Farmer Account Creation */}
      <AccountGenerationModal
        open={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleCreateCustomerAccount}
      />
    </div>
  );
}
