import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Checkbox, MenuItem, TextField, Typography } from "@mui/material";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNetwork } from "../hooks/useNetwork";
import { z } from "zod";
import { ValidationErrorsDialog } from "../components/ValidationErrorsDialog";

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#dee5f2", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2 }}>
        <Typography sx={{ fontSize: 42, color: "#9aa0a9" }}>{title}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, bgcolor: isOnline ? "#e8f5e9" : "#ffebee", px: 2, py: 0.5, borderRadius: "20px", border: isOnline ? "1px solid #c8e6c9" : "1px solid #ffcdd2" }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: isOnline ? "#4caf50" : "#f44336" }} />
          <Typography sx={{ fontSize: 24, fontWeight: 600, color: isOnline ? "#2e7d32" : "#c62828" }}>
            {isOnline ? "Online" : "Offline"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#cfd9e8", border: "1px solid #b8c7db", p: 2.2 }}>
        <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#1e2e46", mb: 0.6 }}>
          {selectedFirm?.name || "BRT Trading Co."} <Typography component="span" sx={{ color: "#1e2e46", fontSize: 30 }}>›</Typography> Data Entry <Typography component="span" sx={{ color: "#1e2e46", fontSize: 30 }}>›</Typography> Sale patti Entry
        </Typography>

        <Box sx={{ bgcolor: "#becadd", borderRadius: "16px", p: 2, mt: 1.5, boxShadow: "0 3px 6px rgba(0,0,0,0.2)" }}>
          <Typography sx={{ color: "#667d9d", fontSize: 34, mb: 1 }}>PATTI DETAILS</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 2fr 1.2fr 1.2fr 1.1fr", gap: 1.6 }}>
            <TextField
              label="Voucher No."
              size="small"
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
            <TextField label="Customer" size="small" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Search Customer" />
            <TextField label="Delivered to" size="small" value={deliveredTo} onChange={(e) => setDeliveredTo(e.target.value)} />
            <TextField label="Vehicle No." size="small" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            <TextField label="Party Bill No." size="small" value={partyBillNo} onChange={(e) => setPartyBillNo(e.target.value)} />
            <TextField label="Date" size="small" value={date} onChange={(e) => setDate(e.target.value)} />
          </Box>
        </Box>

        <Box sx={{ bgcolor: "#becadd", borderRadius: "16px", p: 2, mt: 2.2, boxShadow: "0 3px 6px rgba(0,0,0,0.2)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2 }}>
            <Typography sx={{ color: "#667d9d", fontSize: 40 }}>PATTI ITEMS</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={addRow} sx={{ textTransform: "none", borderRadius: "10px", fontSize: 34, px: 2.2 }}>+ Add row</Button>
              <Button variant="outlined" onClick={removeSelectedRow} sx={{ textTransform: "none", borderRadius: "10px", fontSize: 34, px: 2.2 }}>Remove</Button>
            </Box>
          </Box>

          <Box sx={{ border: "1px solid #aebfd5", bgcolor: "#d7dce5" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "0.4fr 1.2fr 1fr 1.2fr 0.8fr 1fr 1fr 1fr 0.8fr 1fr 1fr", px: 1, py: 0.7, borderBottom: "1px solid #aebfd5" }}>
              {["#", "Book date", "Patti no.", "Patti date", "Bags", "Patti wt.", "Patti freight", "Commission", "TDS %", "TDS amt.", "Patti net"].map((h) => (
                <Typography key={h} sx={{ color: "#617897", fontSize: 31 }}>{h}</Typography>
              ))}
            </Box>

            {rows.map((r, rowIndex) => {
              const tds = rowTdsAmount(r).toFixed(2);
              const net = rowNet(r).toFixed(2);
              return (
                <Box key={rowIndex} onClick={() => setSelectedRowIndex(rowIndex)} sx={{ display: "grid", gridTemplateColumns: "0.4fr 1.2fr 1fr 1.2fr 0.8fr 1fr 1fr 1fr 0.8fr 1fr 1fr", px: 1, py: 0.6, borderBottom: "1px solid #aebfd5", bgcolor: selectedRowIndex === rowIndex ? "#e8edf6" : "transparent" }}>
                  <Typography sx={{ fontSize: 28 }}>{rowIndex + 1}</Typography>
                  <input value={r.bookDate} onChange={(e) => setCell(rowIndex, "bookDate", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.pattiNo} onChange={(e) => setCell(rowIndex, "pattiNo", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.pattiDate} onChange={(e) => setCell(rowIndex, "pattiDate", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.bags} onChange={(e) => setCell(rowIndex, "bags", sanitizeInteger(e.target.value))} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.pattiWt} onChange={(e) => setCell(rowIndex, "pattiWt", sanitizeNumeric(e.target.value))} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.pattiFreight} onChange={(e) => setCell(rowIndex, "pattiFreight", sanitizeNumeric(e.target.value))} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.commission} onChange={(e) => setCell(rowIndex, "commission", sanitizeNumeric(e.target.value))} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.tdsPercent} onChange={(e) => setCell(rowIndex, "tdsPercent", sanitizeNumeric(e.target.value))} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <Typography sx={{ fontSize: 28 }}>{tds}</Typography>
                  <Typography sx={{ fontSize: 28 }}>{net}</Typography>
                </Box>
              );
            })}

            <Box sx={{ display: "grid", gridTemplateColumns: "0.4fr 1.2fr 1fr 1.2fr 0.8fr 1fr 1fr 1fr 0.8fr 1fr 1fr", px: 1, py: 0.7, borderTop: "1px solid #aebfd5" }}>
              <Typography sx={{ fontSize: 31, color: "#617897", gridColumn: "1 / span 8" }}>As per challan</Typography>
              <Box sx={{ borderLeft: "1px solid #aebfd5" }} />
              <Box sx={{ borderLeft: "1px solid #aebfd5" }} />
              <Box sx={{ borderLeft: "1px solid #aebfd5" }} />
            </Box>
            <Typography sx={{ fontSize: 34, color: "#1f65d0", px: 1, py: 0.6 }}>+/- Adjustment</Typography>
          </Box>

          <Typography sx={{ textAlign: "right", mt: 1, color: "#667d9d", fontSize: 31 }}>Patti net total ₹ {pattiNetTotal.toFixed(2)}</Typography>
        </Box>

        {message ? <Alert severity="success" sx={{ mt: 1.2 }}>{message}</Alert> : null}
        {error ? <Alert severity="error" sx={{ mt: 1.2 }}>{error}</Alert> : null}

        <Box sx={{ mt: 2, borderTop: "1px solid #90a7c6", pt: 1.4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Button variant={transport ? "contained" : "outlined"} onClick={() => setTransport((v) => !v)} sx={{ textTransform: "none", fontSize: 31 }}>Transporter</Button>
            <Button variant={remark ? "contained" : "outlined"} onClick={() => setRemark((v) => !v)} sx={{ textTransform: "none", fontSize: 31 }}>Remark</Button>
            <Typography sx={{ fontSize: 32, color: "#6a7f9d" }}>| Sales Complete?</Typography>
            <TextField size="small" select value={salesComplete} onChange={(e) => setSalesComplete(e.target.value)} sx={{ width: 120 }}>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox checked={print} onChange={(e) => setPrint(e.target.checked)} />
            <Typography sx={{ fontSize: 32 }}>Print</Typography>
            <Button variant="contained" onClick={handleSave} disabled={loading} sx={{ textTransform: "none", fontSize: 34 }}>{loading ? "Saving..." : "Save"}</Button>
            <Button variant="outlined" sx={{ textTransform: "none", fontSize: 34 }} onClick={() => history.back()}>Close</Button>
          </Box>
        </Box>
      </Box>
      <ValidationErrorsDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        errors={validationErrors}
      />
    </Box>
  );
}
