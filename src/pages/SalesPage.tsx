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
import { db } from "../lib/db";
import { AccountGenerationModal } from "../components/AccountGenerationModal";

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

function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

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
  const [date, setDate] = useState(getTodayDateString());
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

  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingVoucherNo, setPendingVoucherNo] = useState("");

  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);
  const [allSales, setAllSales] = useState<any[]>([]);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const fetchAllSales = async () => {
    try {
      if (isOnline) {
        const { data } = await api.get("/sales/all");
        if (data && data.rows) {
          setAllSales(data.rows.map((r: any) => ({ ...r, synced: true })));
        }
      } else {
        const offlineSales = await db.sales.toArray();
        setAllSales(offlineSales.map((p) => {
          let dateStr = "";
          let amountVal = 0;
          if (p.payload) {
            if (p.payload.businessDate) {
              const parts = p.payload.businessDate.split("-");
              dateStr = parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : p.payload.businessDate;
            }
            if (p.payload.items) {
              amountVal = p.payload.items.reduce((sum: number, it: any) => sum + (it.pattiNet || 0), 0);
            }
          }
          return {
            id: p.id,
            salePattiNo: p.billNo,
            date: dateStr,
            amount: amountVal,
            synced: p.synced
          };
        }));
      }
    } catch (err) {
      console.error("Failed to load sale pattis", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get("/customers");
      setCustomers(data || []);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => {
    fetchAllSales();
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      fetchCustomers();
    }
  }, [isOnline]);

  useEffect(() => {
    if (customer && customers.length > 0 && !selectedCustomerId) {
      const idNum = Number(customer);
      if (!isNaN(idNum)) {
        const found = customers.find(c => c.id === idNum);
        if (found) {
          setCustomer(found.name);
          setSelectedCustomerId(found.id);
        }
      }
    }
  }, [customer, customers, selectedCustomerId]);

  const filteredSales = useMemo(() => {
    if (!voucherNoInput.trim()) return allSales;
    const q = voucherNoInput.toLowerCase();
    return allSales.filter(b =>
      (b.salePattiNo && b.salePattiNo.toLowerCase().includes(q)) ||
      (b.date && b.date.toLowerCase().includes(q))
    );
  }, [allSales, voucherNoInput]);

  const setDateDirty = (val: string) => {
    setDate(val);
    setIsDirty(true);
  };
  const setCustomerDirty = (val: string) => {
    setCustomer(val);
    setIsDirty(true);
  };
  const setDeliveredToDirty = (val: string) => {
    setDeliveredTo(val);
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

  function setCell(rowIndex: number, key: keyof SalesRow, value: string) {
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

  function resetForm(keepVoucherNo: string = "") {
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
    setSelectedCustomerId(null);
    setDeliveredTo("Delivery address");
    setVehicleNo("--");
    setPartyBillNo("--");
    setDate(getTodayDateString());
    setRows(Array.from({ length: 6 }, () => mkRow()));
    setSalesComplete("Yes");
    setRemark(false);
    setMessage("");
    setError("");
    setVoucherNoInput(keepVoucherNo);
    setVoucherNo(keepVoucherNo);
    setIsDirty(false);
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
        setSelectedCustomerId(data.customerAcno ? Number(data.customerAcno) : null);
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
        setIsDirty(false);
      } else {
        resetForm(num);
      }
    } catch (e: any) {
      resetForm(num);
    }
  }

  useEffect(() => {
    if (voucherNo) {
      checkExistingSale(voucherNo);
    }
  }, [voucherNo]);

  const handleVoucherNoChange = (newVal: string) => {
    if (isDirty) {
      setPendingVoucherNo(newVal);
      setConfirmDialogOpen(true);
    } else {
      setVoucherNo(newVal.trim());
      setVoucherNoInput(newVal.trim());
    }
  };

  const handleConfirmSave = async () => {
    setConfirmDialogOpen(false);
    await handleSave();
    if (pendingVoucherNo) {
      setVoucherNo(pendingVoucherNo.trim());
      setVoucherNoInput(pendingVoucherNo.trim());
      setPendingVoucherNo("");
    }
  };

  const handleConfirmDiscard = () => {
    setConfirmDialogOpen(false);
    setIsDirty(false);
    if (pendingVoucherNo) {
      setVoucherNo(pendingVoucherNo.trim());
      setVoucherNoInput(pendingVoucherNo.trim());
      setPendingVoucherNo("");
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialogOpen(false);
    setVoucherNoInput(voucherNo);
    setPendingVoucherNo("");
  };

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

    const parsedCustomerAcno = selectedCustomerId ? String(selectedCustomerId) : (customer.trim() ? customer.trim() : null);

    setLoading(true);
    try {
      const payload = {
        id: salesId,
        voucherNo: voucherNoInput,
        businessDate: toIsoDate(date),
        customerAcno: parsedCustomerAcno,
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
      setIsDirty(false);
      fetchAllSales();
      
      const num = parseInt(voucherNo, 10);
      let nextVoucher = voucherNo;
      if (!isNaN(num)) {
        nextVoucher = String(num + 1).padStart(voucherNo.length, "0");
      }

      resetForm(nextVoucher);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to save sale");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCustomer = async (formData: any) => {
    try {
      const { data } = await api.post("/customers", formData);
      setCustomers((prev) => [...prev, data]);
      setCustomer(data.name);
      setSelectedCustomerId(data.id);
      setIsDirty(true);
      setIsCustomerModalOpen(false);
      setMessage(`Account created successfully for ${data.name}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create customer account");
    }
  };

  const pickerValue = (() => {
    const parts = date.split(".");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      if (year.length === 4 && !isNaN(Number(day)) && !isNaN(Number(month)) && !isNaN(Number(year))) {
        return `${year}-${month}-${day}`;
      }
    }
    return "";
  })();

  const rowPickerValue = (val: string) => {
    const parts = val.split(".");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      if (year.length === 4 && !isNaN(Number(day)) && !isNaN(Number(month)) && !isNaN(Number(year))) {
        return `${year}-${month}-${day}`;
      }
    }
    return "";
  };

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
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-slate-500">Voucher No.</label>
              <Input
                value={voucherNoInput}
                onChange={(e) => {
                  setVoucherNoInput(e.target.value);
                  setShowVoucherDropdown(true);
                }}
                onFocus={() => setShowVoucherDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowVoucherDropdown(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleVoucherNoChange(voucherNoInput);
                    setShowVoucherDropdown(false);
                  }
                }}
                className="w-full"
              />
              {showVoucherDropdown && (
                <div className="absolute z-[100] w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {filteredSales.map((b) => (
                    <div
                      key={b.id}
                      onMouseDown={() => {
                        handleVoucherNoChange(b.salePattiNo);
                        setShowVoucherDropdown(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex justify-between items-center"
                    >
                      <span className="font-semibold">{b.salePattiNo}</span>
                      <span className="text-xs text-muted-foreground">{b.date}</span>
                    </div>
                  ))}
                  {filteredSales.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                      No matching vouchers found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1 md:col-span-2 relative">
              <label className="text-xs font-semibold text-slate-500">Customer</label>
              <Input
                value={customer}
                onChange={(e) => {
                  setCustomerDirty(e.target.value);
                  setSelectedCustomerId(null);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowCustomerDropdown(false), 200);
                }}
                placeholder="Search Customer"
              />
              {showCustomerDropdown && (
                <div className="absolute z-[100] w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {customers
                    .filter((c) =>
                      c.name && c.name.toLowerCase().includes(customer.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        onMouseDown={() => {
                          setCustomer(c.name);
                          setSelectedCustomerId(c.id);
                          setIsDirty(true);
                          setShowCustomerDropdown(false);
                        }}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        {c.name}
                      </div>
                    ))}
                  <div
                    onMouseDown={() => {
                      setIsCustomerModalOpen(true);
                      setShowCustomerDropdown(false);
                    }}
                    className="px-3 py-2 text-sm font-semibold text-primary cursor-pointer hover:bg-accent border-t"
                  >
                    + Add New Customer
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Delivered to</label>
              <Input value={deliveredTo} onChange={(e) => setDeliveredToDirty(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Vehicle No.</label>
              <Input value={vehicleNo} onChange={(e) => setVehicleNoDirty(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Party Bill No.</label>
              <Input value={partyBillNo} onChange={(e) => setPartyBillNoDirty(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <div className="relative flex items-center">
                <Input
                  value={date}
                  onChange={(e) => setDateDirty(e.target.value)}
                  placeholder="DD.MM.YYYY"
                  className="pr-10"
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
                          setDateDirty(`${parts[2]}.${parts[1]}.${parts[0]}`);
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
                        <TableCell className="p-1 min-w-[140px]">
                          <div className="relative flex items-center">
                            <input
                              value={r.bookDate}
                              onChange={(e) => setCell(rowIndex, "bookDate", e.target.value)}
                              placeholder="DD.MM.YYYY"
                              className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none pr-6"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer w-4 h-4 flex items-center justify-center opacity-60 hover:opacity-100">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                              </svg>
                              <input
                                type="date"
                                value={rowPickerValue(r.bookDate)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    const parts = val.split("-");
                                    if (parts.length === 3) {
                                      setCell(rowIndex, "bookDate", `${parts[2]}.${parts[1]}.${parts[0]}`);
                                    }
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-1">
                          <input
                            value={r.pattiNo}
                            onChange={(e) => setCell(rowIndex, "pattiNo", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                          />
                        </TableCell>
                        <TableCell className="p-1 min-w-[140px]">
                          <div className="relative flex items-center">
                            <input
                              value={r.pattiDate}
                              onChange={(e) => setCell(rowIndex, "pattiDate", e.target.value)}
                              placeholder="DD.MM.YYYY"
                              className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none pr-6"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer w-4 h-4 flex items-center justify-center opacity-60 hover:opacity-100">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                              </svg>
                              <input
                                type="date"
                                value={rowPickerValue(r.pattiDate)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    const parts = val.split("-");
                                    if (parts.length === 3) {
                                      setCell(rowIndex, "pattiDate", `${parts[2]}.${parts[1]}.${parts[0]}`);
                                    }
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </div>
                          </div>
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

      <Dialog open={confirmDialogOpen} onOpenChange={(open) => { if (!open) handleConfirmCancel(); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Do you want to save them before switching bills?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={handleConfirmDiscard}>Discard Changes</Button>
            <Button variant="outline" onClick={handleConfirmCancel}>Cancel</Button>
            <Button onClick={handleConfirmSave}>Save & Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AccountGenerationModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleCreateCustomer}
        initialData={{ accountType: "Customer" }}
      />
    </div>
  );
}
