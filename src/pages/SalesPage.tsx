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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

type SalesRow = {
  bookDate: string;
  pattiNo: string;
  pattiDate: string;
  bags: string;
  pattiWt: string;
  pattiFreight: string;
  commission: string;
  tdsPercent: string;
};

const mkRow = (): SalesRow => ({
  bookDate: "",
  pattiNo: "",
  pattiDate: "",
  bags: "",
  pattiWt: "",
  pattiFreight: "",
  commission: "",
  tdsPercent: "",
});

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

const salesSchema = z.object({
  voucherNo: z.string().trim().min(1, "Voucher No. is required"),
  customer: z.string().trim().min(1, "Customer is required"),
  date: z.string()
    .trim()
    .min(1, "Date is required")
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, "Date must be in DD.MM.YYYY format")
    .refine(isValidDate, "Date must be a valid calendar date"),
  activeRows: z.array(
    z.object({
      index: z.number(),
      pattiNo: z.string().trim().min(1, "Patti No. is required"),
      net: z.number().nonnegative("Net amount cannot be negative. Deductions exceed Gross Weight/Value."),
    })
  ).min(1, "Add at least one patti row"),
  totalQty: z.number().gt(0, "Total bags must be greater than zero"),
  avgRate: z.number().nonnegative("Calculated average rate cannot be negative. Please check patti weight, freight, and commission inputs."),
});

export function SalesPage() {
  const selectedFirm = useAuthStore((s) => s.selectedFirm);
  const isOnline = useNetwork();
  const [salesId, setSalesId] = useState<string>(() => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });

  const [title] = useState("BRT Flow - Sale Patti Entry");
  const [customer, setCustomer] = useState("");
  const [deliveredTo, setDeliveredTo] = useState("Delivery address");
  const [vehicleNo, setVehicleNo] = useState("--");
  const [partyBillNo, setPartyBillNo] = useState("--");
  const [date, setDate] = useState("08.11.2025");
  const [voucherNo, setVoucherNo] = useState("001186");
  const [voucherNoInput, setVoucherNoInput] = useState("001186");

  const [rows, setRows] = useState<SalesRow[]>(Array.from({ length: 6 }, () => mkRow()));
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);

  const [transport, setTransport] = useState(false);
  const [remark, setRemark] = useState(false);
  const [salesComplete, setSalesComplete] = useState("Yes");
  const [print, setPrint] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  function setCell(rowIndex: number, key: keyof SalesRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, mkRow()]);
    setSelectedRowIndex(rows.length);
  }

  function removeSelectedRow() {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== selectedRowIndex);
    });
    setSelectedRowIndex((i) => Math.max(0, i - 1));
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

  function rowTdsAmount(r: SalesRow) {
    const wt = parseNumber(r.pattiWt);
    const tdsPct = parseNumber(r.tdsPercent);
    return (wt * tdsPct) / 100;
  }

  function rowNet(r: SalesRow) {
    const wt = parseNumber(r.pattiWt);
    const freight = parseNumber(r.pattiFreight);
    const commissionVal = parseNumber(r.commission);
    return wt - freight - commissionVal - rowTdsAmount(r);
  }

  const pattiNetTotal = useMemo(() => rows.reduce((sum, r) => sum + rowNet(r), 0), [rows]);

  function resetForm() {
    setSalesId(
      typeof window !== "undefined" && window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          })
    );
    setCustomer("");
    setDeliveredTo("Delivery address");
    setVehicleNo("--");
    setPartyBillNo("--");
    setDate("08.11.2025");
    setRows(Array.from({ length: 6 }, () => mkRow()));
    setSalesComplete("Yes");
    setRemark(false);
    setMessage("");
    setError("");
  }

  async function checkExistingSale(num: string) {
    if (!num.trim()) {
      resetForm();
      return;
    }
    try {
      const { data } = await api.get(`/sales/by-patti-no/${num.trim()}`);
      if (data && data.id) {
        setSalesId(data.id);
        setCustomer(data.customerAcno || "");
        setDeliveredTo(data.deliveredTo || "Delivery address");
        setVehicleNo(data.vehicleNo || "--");
        setPartyBillNo(data.partyBillNo || "--");
        setSalesComplete(data.salesComplete ? "Yes" : "No");
        setRemark(!!data.remark);
        
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
            bookDate: it.bookDate ? (() => {
              const parts = it.bookDate.split("-");
              return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : it.bookDate;
            })() : "",
            pattiNo: it.pattiNo || "",
            pattiDate: it.pattiDate ? (() => {
              const parts = it.pattiDate.split("-");
              return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : it.pattiDate;
            })() : "",
            bags: it.bags || "",
            pattiWt: it.pattiWt || "",
            pattiFreight: it.pattiFreight || "",
            commission: it.commission || "",
            tdsPercent: it.tdsPercent || "",
          }));
          while (mappedRows.length < 6) {
            mappedRows.push(mkRow());
          }
          setRows(mappedRows);
        } else {
          setRows(Array.from({ length: 6 }, () => mkRow()));
        }
        setMessage(`Loaded details for Voucher no. ${data.voucherNo}`);
        setError("");
      } else {
        resetForm();
      }
    } catch (e: any) {
      resetForm();
    }
  }

  useEffect(() => {
    if (voucherNo) {
      checkExistingSale(voucherNo);
    }
  }, [voucherNo]);

  async function handleSave() {
    setMessage("");
    setError("");

    const activeRows = rows.filter((r) => r.pattiNo.trim() || parseNumber(r.bags) > 0 || parseNumber(r.pattiWt) > 0);
    const totalQty = activeRows.reduce((s, r) => s + parseNumber(r.bags), 0);
    const totalNet = activeRows.reduce((s, r) => s + rowNet(r), 0);
    const avgRate = totalQty > 0 ? totalNet / totalQty : 0;

    const dataToValidate = {
      voucherNo: voucherNoInput,
      customer,
      date,
      activeRows: activeRows.map((r, i) => ({
        index: i + 1,
        pattiNo: r.pattiNo,
        net: rowNet(r),
      })),
      totalQty,
      avgRate,
    };

    const validationResult = salesSchema.safeParse(dataToValidate);
    if (!validationResult.success) {
      const errMsgs = validationResult.error.issues.map((err) => {
        if (err.path[0] === "activeRows" && typeof err.path[1] === "number") {
          const rowIndex = dataToValidate.activeRows[err.path[1]].index;
          const fieldName = err.path[2];
          if (fieldName === "pattiNo") {
            return `Row ${rowIndex}: Patti No. is required`;
          }
          if (fieldName === "net") {
            return `Row ${rowIndex}: Net amount cannot be negative. Deductions (Freight + Commission + TDS) exceed the Gross Weight/Value.`;
          }
        }
        return err.message;
      });
      setValidationErrors(errMsgs);
      setValidationDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: salesId,
        voucherNo,
        businessDate: toIsoDate(date),
        customerAcno: customer.trim().toUpperCase(),
        deliveredTo: deliveredTo.trim(),
        vehicleNo: vehicleNo.trim(),
        partyBillNo: partyBillNo.trim(),
        remark: remark ? "Remark enabled" : "",
        salesCompleted: salesComplete === "Yes",
        items: activeRows.map((r) => ({
          bookDate: r.bookDate ? toIsoDate(r.bookDate) : null,
          pattiNo: r.pattiNo.trim(),
          pattiDate: r.pattiDate ? toIsoDate(r.pattiDate) : null,
          bags: parseNumber(r.bags),
          pattiWt: parseNumber(r.pattiWt),
          pattiFreight: parseNumber(r.pattiFreight),
          commission: parseNumber(r.commission),
          tdsPercent: parseNumber(r.tdsPercent),
          tdsAmount: rowTdsAmount(r),
          pattiNet: rowNet(r),
        })),
      };
      const { data } = await api.post("/sales", payload);
      if (data.offline) {
        setMessage(`Sale saved offline (pending sync). ID: ${data.id}`);
      } else {
        setMessage(`Sale saved successfully. ID: ${data.id}`);
      }
      
      const num = parseInt(voucherNo, 10);
      let nextVoucher = voucherNo;
      if (!isNaN(num)) {
        nextVoucher = String(num + 1).padStart(voucherNo.length, "0");
      }

      resetForm();
      
      setVoucherNo(nextVoucher);
      setVoucherNoInput(nextVoucher);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to save sale");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card text-card-foreground shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
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
          <span>Sale patti Entry</span>
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
            <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">Patti Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Voucher No.</label>
              <Input
                value={voucherNoInput}
                onChange={(e) => setVoucherNoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setVoucherNo(voucherNoInput.trim());
                  }
                }}
                onBlur={() => {
                  setVoucherNo(voucherNoInput.trim());
                }}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Customer</label>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Search Customer" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Delivered to</label>
              <Input value={deliveredTo} onChange={(e) => setDeliveredTo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Vehicle No.</label>
              <Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Party Bill No.</label>
              <Input value={partyBillNo} onChange={(e) => setPartyBillNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <Input value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">Patti Items</CardTitle>
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
                    <TableHead>Book date</TableHead>
                    <TableHead>Patti no.</TableHead>
                    <TableHead>Patti date</TableHead>
                    <TableHead className="w-20">Bags</TableHead>
                    <TableHead className="w-24">Patti wt.</TableHead>
                    <TableHead className="w-24">Patti freight</TableHead>
                    <TableHead className="w-24">Commission</TableHead>
                    <TableHead className="w-20">TDS %</TableHead>
                    <TableHead className="w-24 text-right">TDS amt.</TableHead>
                    <TableHead className="w-32 text-right">Patti net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, rowIndex) => {
                    const tds = rowTdsAmount(r).toFixed(2);
                    const net = rowNet(r).toFixed(2);
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
                            value={r.bookDate}
                            onChange={(e) => setCell(rowIndex, "bookDate", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.pattiNo}
                            onChange={(e) => setCell(rowIndex, "pattiNo", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.pattiDate}
                            onChange={(e) => setCell(rowIndex, "pattiDate", e.target.value)}
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
                            value={r.pattiWt}
                            onChange={(e) => setCell(rowIndex, "pattiWt", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.pattiFreight}
                            onChange={(e) => setCell(rowIndex, "pattiFreight", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.commission}
                            onChange={(e) => setCell(rowIndex, "commission", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.tdsPercent}
                            onChange={(e) => setCell(rowIndex, "tdsPercent", sanitizeNumeric(e.target.value))}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{tds}</TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">{net}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end space-x-6 text-sm font-semibold border-t pt-4">
              <span className="text-primary font-bold">Patti Net Total: <span className="font-mono text-base">₹ {pattiNetTotal.toFixed(2)}</span></span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t pt-4 pb-12">
          <div className="flex items-center space-x-6">
            <Button
              variant={transport ? "default" : "outline"}
              onClick={() => setTransport((v) => !v)}
              className="h-9"
            >
              Transporter
            </Button>
            <Button
              variant={remark ? "default" : "outline"}
              onClick={() => setRemark((v) => !v)}
              className="h-9"
            >
              Remark
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Sales Complete?</span>
              <Select value={salesComplete} onChange={(e) => setSalesComplete(e.target.value)} className="w-24 h-9">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <label className="flex items-center space-x-2 text-sm font-semibold cursor-pointer mr-4">
              <Checkbox checked={print} onChange={(e) => setPrint(e.target.checked)} />
              <span>Print</span>
            </label>
            <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none">
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => history.back()} className="flex-1 sm:flex-none">Close</Button>
          </div>
        </div>
      </main>

      <ValidationErrorsDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        errors={validationErrors}
      />
    </div>
  );
}
