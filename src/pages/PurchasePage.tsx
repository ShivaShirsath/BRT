import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNetwork } from "../hooks/useNetwork";
import { z } from "zod";
import { ValidationErrorsDialog } from "../components/ValidationErrorsDialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Select } from "../components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

type PurchaseItemRow = {
  commodity: string;
  mark: string;
  brand: string;
  bags: string;
  avgWt: string;
  purWt: string;
  packingWeight: string;
  netWt: string;
  rate: string;
};

const mkRow = (): PurchaseItemRow => ({
  commodity: "",
  mark: "",
  brand: "",
  bags: "",
  avgWt: "",
  purWt: "",
  packingWeight: "",
  netWt: "",
  rate: "",
});

const chargeFields = [
  "Purchase amt.", "M. Tax", "Commission", "Pur. Comm", "Freight", "Packing", "Loading", "Leivy",
  "Tolai", "Hamali", "Discount", "IGST", "SGST", "CGST", "TDS", "Khandani",
  "Our expenses", "Exp. 2", "Exp. 3", "Exp. 4",
];

function isValidDate(dateStr: string): boolean {
  const parts = dateStr.trim().split(".");
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  const dateObj = new Date(year, month, day);
  return dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === day;
}

const purchaseSchema = z.object({
  voucherNo: z.string().trim().min(1, "Voucher No. is required"),
  date: z.string()
    .trim()
    .min(1, "Date is required")
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, "Date must be in DD.MM.YYYY format")
    .refine(isValidDate, "Date must be a valid calendar date"),
  entryType: z.string()
    .trim()
    .min(1, "Please select a market entry type")
    .refine(val => val !== "Select market" && val.trim() !== "", "Please select a market entry type"),
  activeRows: z.array(
    z.object({
      index: z.number(),
      commodity: z.string().trim().min(1, "Commodity is required"),
    })
  ).min(1, "Add at least one item row"),
  netTotal: z.number().nonnegative("Net Total cannot be negative. Please adjust Discount, TDS, or other charges."),
});

export function PurchasePage() {
  const selectedFirm = useAuthStore((s) => s.selectedFirm);
  const isOnline = useNetwork();
  const [purchaseId, setPurchaseId] = useState<string>(() => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });

  const [billNo, setBillNo] = useState("001186");
  const [billNoInput, setBillNoInput] = useState("001186");
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingBillNo, setPendingBillNo] = useState("");

  const [date, setDate] = useState("08.11.2025");
  const [entryType, setEntryType] = useState("Select market");
  const [cessCondition, setCessCondition] = useState("Order");
  const [seller, setSeller] = useState("");
  const [vehicleNo, setVehicleNo] = useState("--");
  const [partyBillNo, setPartyBillNo] = useState("--");
  const [rows, setRows] = useState<PurchaseItemRow[]>(Array.from({ length: 6 }, () => mkRow()));
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [note, setNote] = useState("");
  const [print, setPrint] = useState(false);
  const [billReceived, setBillReceived] = useState("No");
  const [lockState, setLockState] = useState("No");
  const [charges, setCharges] = useState<Record<string, string>>(() => Object.fromEntries(chargeFields.map((f) => [f, "0.00"])));

  const setDateDirty = (val: string) => {
    setDate(val);
    setIsDirty(true);
  };
  const setEntryTypeDirty = (val: string) => {
    setEntryType(val);
    setIsDirty(true);
  };
  const setCessConditionDirty = (val: string) => {
    setCessCondition(val);
    setIsDirty(true);
  };
  const setSellerDirty = (val: string) => {
    setSeller(val);
    setIsDirty(true);
  };
  const setVehicleNoDirty = (val: string) => {
    setVehicleNo(val);
    setIsDirty(true);
  };
  const setPartyBillNoDirty = (val: string) => {
    setPartyBillNo(val);
    setIsDirty(true);
  };
  const setNoteDirty = (val: string) => {
    setNote(val);
    setIsDirty(true);
  };
  const setChargesDirty = (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    setCharges(val);
    setIsDirty(true);
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  function setCell(rowIndex: number, key: keyof PurchaseItemRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, [key]: value } : r)));
    setIsDirty(true);
  }

  function addRow() {
    setRows((prev) => [...prev, mkRow()]);
    setSelectedRowIndex(rows.length);
    setIsDirty(true);
  }

  function removeSelectedRow() {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== selectedRowIndex);
    });
    setSelectedRowIndex((i) => Math.max(0, i - 1));
    setIsDirty(true);
  }

  function toIsoDate(ddmmyyyy: string) {
    const p = ddmmyyyy.split(".");
    if (p.length !== 3) return new Date().toISOString().slice(0, 10);
    return `${p[2]}-${p[1]}-${p[0]}`;
  }

  function parseNumber(val: any): number {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  }

  function sanitizeNumeric(val: string): string {
    let cleaned = val.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  }

  function sanitizeInteger(val: string): string {
    return val.replace(/[^0-9]/g, "");
  }

  const total = useMemo(() => {
    return rows.reduce((sum, r) => sum + parseNumber(r.netWt) * parseNumber(r.rate), 0);
  }, [rows]);

  const netTotal = useMemo(() => {
    let sum = total;
    const additionFields = [
      "M. Tax", "Commission", "Pur. Comm", "Freight", "Packing", "Loading", "Leivy",
      "Tolai", "Hamali", "Discount", "IGST", "SGST", "CGST", "Khandani", "Our expenses", "Exp. 2", "Exp. 3", "Exp. 4"
    ];
    additionFields.forEach((f) => {
      sum += parseNumber(charges[f]);
    });
    sum -= parseNumber(charges["Discount"]);
    sum -= parseNumber(charges["TDS"]);
    return sum;
  }, [total, charges]);

  async function onSave() {
    setError("");
    setMessage("");

    const activeRows = rows.filter((r) => r.commodity.trim() || parseNumber(r.netWt) > 0 || parseNumber(r.rate) > 0);
    const dataToValidate = {
      voucherNo: billNoInput,
      date,
      entryType,
      activeRows: activeRows.map((r, i) => ({
        index: i + 1,
        commodity: r.commodity,
      })),
      netTotal,
    };

    const validationResult = purchaseSchema.safeParse(dataToValidate);
    if (!validationResult.success) {
      const errMsgs = validationResult.error.issues.map((err) => {
        if (err.path[0] === "activeRows" && typeof err.path[1] === "number") {
          const rowIndex = dataToValidate.activeRows[err.path[1]].index;
          const fieldName = err.path[2];
          if (fieldName === "commodity") {
            return `Row ${rowIndex}: Commodity is required for all entered item rows`;
          }
        }
        return err.message;
      });
      setValidationErrors(errMsgs);
      setValidationDialogOpen(true);
      return;
    }

    const items = activeRows.map((r) => ({
      commodity: r.commodity.trim(),
      mark: r.mark.trim(),
      brand: r.brand.trim(),
      bags: r.bags.trim(),
      avgWeight: parseNumber(r.avgWt),
      purchaseWeight: parseNumber(r.purWt),
      packingWeight: parseNumber(r.packingWeight),
      netWeight: parseNumber(r.netWt),
      rate: parseNumber(r.rate),
      amount: parseNumber(r.netWt) * parseNumber(r.rate),
    }));

    const parsedSellerId = /^\d+$/.test(seller.trim()) ? Number(seller.trim()) : null;

    const chargesMap: Record<string, string> = {
      "Purchase amt.": "purchaseAmount",
      "M. Tax": "mTax",
      "Commission": "commission",
      "Pur. Comm": "purchaseCommission",
      "Freight": "freight",
      "Packing": "packing",
      "Loading": "loading",
      "Leivy": "levy",
      "Tolai": "tolai",
      "Hamali": "hamali",
      "Discount": "discount",
      "IGST": "igst",
      "SGST": "sgst",
      "CGST": "cgst",
      "TDS": "tds",
      "Khandani": "khandani",
      "Our expenses": "ourExpenses",
      "Exp. 2": "exp2",
      "Exp. 3": "exp3",
      "Exp. 4": "exp4",
    };

    const chargesPayload: Record<string, number> = {};
    for (const [uiField, apiField] of Object.entries(chargesMap)) {
      chargesPayload[apiField] = uiField === "Purchase amt." ? total : parseNumber(charges[uiField]);
    }

    setLoading(true);
    try {
      const payload = {
        id: purchaseId,
        voucherNo: billNo,
        businessDate: toIsoDate(date),
        entryType,
        cessCondition,
        sellerId: parsedSellerId,
        vehicleNo: vehicleNo.trim(),
        partyBillNo: partyBillNo.trim(),
        note: note.trim(),
        items,
        charges: {
          ...chargesPayload,
          total,
          netTotal,
        },
      };
      const { data } = await api.post("/purchase", payload);
      if (data.offline) {
        setMessage(`Purchase saved offline (pending sync). ID: ${data.id}`);
      } else {
        setMessage(`Purchase saved successfully. ID: ${data.id}`);
      }
      setIsDirty(false);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to save purchase");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setPurchaseId(
      typeof window !== "undefined" && window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          })
    );
    setBillNoInput("");
    setBillNo("");
    setDate("08.11.2025");
    setEntryType("Select market");
    setCessCondition("Order");
    setSeller("");
    setVehicleNo("--");
    setPartyBillNo("--");
    setRows(Array.from({ length: 6 }, () => mkRow()));
    setNote("");
    setCharges(Object.fromEntries(chargeFields.map((f) => [f, "0.00"])));
    setIsDirty(false);
    setMessage("");
    setError("");
  }

  const handleBillNoChange = (newVal: string) => {
    if (isDirty) {
      setPendingBillNo(newVal);
      setConfirmDialogOpen(true);
    } else {
      setBillNo(newVal.trim());
      setBillNoInput(newVal.trim());
    }
  };

  const handleConfirmSave = async () => {
    setConfirmDialogOpen(false);
    await onSave();
    if (pendingBillNo) {
      setBillNo(pendingBillNo.trim());
      setBillNoInput(pendingBillNo.trim());
      setPendingBillNo("");
    }
  };

  const handleConfirmDiscard = () => {
    setConfirmDialogOpen(false);
    setIsDirty(false);
    if (pendingBillNo) {
      setBillNo(pendingBillNo.trim());
      setBillNoInput(pendingBillNo.trim());
      setPendingBillNo("");
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialogOpen(false);
    setBillNoInput(billNo);
    setPendingBillNo("");
  };

  async function checkExistingBill(num: string) {
    if (!num.trim()) {
      resetForm();
      return;
    }
    try {
      const { data } = await api.get(`/purchase/by-bill-no/${num.trim()}`);
      if (data && data.id) {
        setPurchaseId(data.id);
        setBillNo(data.voucherNo || "");
        setBillNoInput(data.voucherNo || "");
        setEntryType(data.entryType || "Select market");
        setCessCondition(data.cessCondition || "Order");
        setSeller(data.sellerId ? String(data.sellerId) : "");
        setVehicleNo(data.vehicleNo || "--");
        setPartyBillNo(data.partyBillNo || "--");
        setNote(data.note || "");

        if (data.businessDate) {
          const parts = data.businessDate.split("-");
          if (parts.length === 3) {
            setDate(`${parts[2]}.${parts[1]}.${parts[0]}`);
          } else {
            setDate(data.businessDate);
          }
        }

        if (data.items && data.items.length > 0) {
          const mappedRows = data.items.map((it: any) => ({
            commodity: it.commodity || "",
            mark: it.mark || "",
            brand: it.brand || "",
            bags: it.bags || "",
            avgWt: it.avgWeight ? String(it.avgWeight) : "",
            purWt: it.purchaseWeight ? String(it.purchaseWeight) : "",
            packingWeight: it.packingWeight ? String(it.packingWeight) : "",
            netWt: it.netWeight ? String(it.netWeight) : "",
            rate: it.rate ? String(it.rate) : "",
          }));
          while (mappedRows.length < 6) {
            mappedRows.push(mkRow());
          }
          setRows(mappedRows);
        } else {
          setRows(Array.from({ length: 6 }, () => mkRow()));
        }

        if (data.charges) {
          const loadedCharges: Record<string, string> = {};
          const chargesMapReverse: Record<string, string> = {
            mTax: "M. Tax",
            commission: "Commission",
            purchaseCommission: "Pur. Comm",
            freight: "Freight",
            packing: "Packing",
            loading: "Loading",
            levy: "Leivy",
            tolai: "Tolai",
            hamali: "Hamali",
            discount: "Discount",
            igst: "IGST",
            sgst: "SGST",
            cgst: "CGST",
            tds: "TDS",
            khandani: "Khandani",
            ourExpenses: "Our expenses",
            exp2: "Exp. 2",
            exp3: "Exp. 3",
            exp4: "Exp. 4",
          };
          for (const [apiField, uiField] of Object.entries(chargesMapReverse)) {
            loadedCharges[uiField] = data.charges[apiField] !== undefined ? String(data.charges[apiField]) : "0.00";
          }
          setCharges(loadedCharges);
        } else {
          setCharges(Object.fromEntries(chargeFields.map((f) => [f, "0.00"])));
        }

        setMessage(`Loaded details for Bill no. ${data.voucherNo}`);
        setError("");
        setIsDirty(false);
      } else {
        resetForm();
      }
    } catch (e: any) {
      console.error("Failed to fetch existing bill details", e);
      resetForm();
    }
  }

  useEffect(() => {
    if (billNo) {
      checkExistingBill(billNo);
    }
  }, [billNo]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card text-card-foreground shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Purchase Bill Entry</h1>
        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-background text-xs font-semibold shadow-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-destructive animate-pulse"}`} />
          <span className="text-muted-foreground">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-semibold">
          <span>{selectedFirm?.name || "BRT Trading Co."}</span>
          <span>›</span>
          <span>Data Entry</span>
          <span>›</span>
          <span>Purchase Bill Entry</span>
        </div>

        {message && (
          <Alert variant="success">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">Bill Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Bill no.</label>
              <Input
                value={billNoInput}
                onChange={(e) => setBillNoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBillNoChange(billNoInput);
                  }
                }}
                onBlur={() => {
                  handleBillNoChange(billNoInput);
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <Input value={date} onChange={(e) => setDateDirty(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Entry Type</label>
              <Select value={entryType} onChange={(e) => setEntryTypeDirty(e.target.value)}>
                <option value="Select market">Select market</option>
                <option value="Market A">Market A</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Cess Condition</label>
              <Select value={cessCondition} onChange={(e) => setCessConditionDirty(e.target.value)}>
                <option value="Order">Order</option>
                <option value="Direct">Direct</option>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Seller</label>
              <Input value={seller} onChange={(e) => setSellerDirty(e.target.value)} placeholder="Search Customer" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Vehicle No.</label>
              <Input value={vehicleNo} onChange={(e) => setVehicleNoDirty(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Party Bill No.</label>
              <Input value={partyBillNo} onChange={(e) => setPartyBillNoDirty(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">Items</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={addRow}>+ Add row</Button>
              <Button variant="outline" size="sm" onClick={removeSelectedRow}>Remove</Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Commodity</TableHead>
                    <TableHead>Mark</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="w-20">Bags</TableHead>
                    <TableHead className="w-24">Avg. Wt.</TableHead>
                    <TableHead className="w-24">Pur. Wt.</TableHead>
                    <TableHead className="w-32">Packing Weight</TableHead>
                    <TableHead className="w-24">Net Wt.</TableHead>
                    <TableHead className="w-24">Rate</TableHead>
                    <TableHead className="w-32 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, rowIndex) => {
                    const amount = (parseNumber(r.netWt) * parseNumber(r.rate)).toFixed(2);
                    const active = selectedRowIndex === rowIndex;
                    return (
                      <TableRow
                        key={rowIndex}
                        onClick={() => setSelectedRowIndex(rowIndex)}
                        className={active ? "bg-muted/50" : ""}
                      >
                        <TableCell className="text-center font-medium">{rowIndex + 1}</TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.commodity}
                            onChange={(e) => setCell(rowIndex, "commodity", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.mark}
                            onChange={(e) => setCell(rowIndex, "mark", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.brand}
                            onChange={(e) => setCell(rowIndex, "brand", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.bags}
                            onChange={(e) => setCell(rowIndex, "bags", sanitizeInteger(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.avgWt}
                            onChange={(e) => setCell(rowIndex, "avgWt", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.purWt}
                            onChange={(e) => setCell(rowIndex, "purWt", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.packingWeight}
                            onChange={(e) => setCell(rowIndex, "packingWeight", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.netWt}
                            onChange={(e) => setCell(rowIndex, "netWt", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.rate}
                            onChange={(e) => setCell(rowIndex, "rate", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">{amount}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <Input
              value={note}
              onChange={(e) => setNoteDirty(e.target.value)}
              placeholder="Add details/note..."
              className="bg-slate-100 dark:bg-slate-900 border-0"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">Charges & Taxes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {chargeFields.map((f) => (
                <div key={f} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block truncate" title={f}>{f}</label>
                  <Input
                    value={f === "Purchase amt." ? total.toFixed(2) : charges[f]}
                    onChange={(e) => setChargesDirty((c) => ({ ...c, [f]: sanitizeNumeric(e.target.value) }))}
                    disabled={f === "Purchase amt."}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-6 text-sm font-semibold border-t pt-4">
              <span>Total: <span className="font-mono text-base">₹ {total.toFixed(2)}</span></span>
              <span className="text-slate-400">|</span>
              <span className="text-primary">Net Total: <span className="font-mono text-base">₹ {netTotal.toFixed(2)}</span></span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t pt-4 pb-12">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
              <Checkbox checked={print} onChange={(e) => setPrint(e.target.checked)} />
              <span>Print</span>
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Bill received?</span>
              <Select value={billReceived} onChange={(e) => setBillReceived(e.target.value)} className="w-24 h-9">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Lock?</span>
              <Select value={lockState} onChange={(e) => setLockState(e.target.value)} className="w-24 h-9">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">Delete</Button>
            <Button onClick={onSave} disabled={loading} className="flex-1 sm:flex-none">
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => history.back()} className="flex-1 sm:flex-none">Close</Button>
          </div>
        </div>
      </main>

      <Dialog open={confirmDialogOpen} onOpenChange={(val) => { if (!val) handleConfirmCancel(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">Unsaved Changes</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              You have unsaved changes in this purchase entry. Would you like to save them before changing the bill number?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={handleConfirmCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDiscard}>
              Discard Changes
            </Button>
            <Button onClick={handleConfirmSave}>
              Save & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ValidationErrorsDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        errors={validationErrors}
      />
    </div>
  );
}
