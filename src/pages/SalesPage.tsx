import { useMemo, useState } from "react";
import { Alert, Box, Button, Checkbox, MenuItem, TextField, Typography } from "@mui/material";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";

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

export function SalesPage() {
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  const [title] = useState("BRT Flow - Sale Patti Entry");
  const [customer, setCustomer] = useState("");
  const [deliveredTo, setDeliveredTo] = useState("Delivery address");
  const [vehicleNo, setVehicleNo] = useState("--");
  const [partyBillNo, setPartyBillNo] = useState("--");
  const [date, setDate] = useState("08.11.2025");
  const [voucherNo] = useState("001186");

  const [rows, setRows] = useState<SalesRow[]>(Array.from({ length: 6 }, () => mkRow()));
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);

  const [transport, setTransport] = useState(false);
  const [remark, setRemark] = useState(false);
  const [salesComplete, setSalesComplete] = useState("Yes");
  const [print, setPrint] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  function rowTdsAmount(r: SalesRow) {
    const wt = Number(r.pattiWt || 0);
    const tdsPct = Number(r.tdsPercent || 0);
    return (wt * tdsPct) / 100;
  }

  function rowNet(r: SalesRow) {
    const wt = Number(r.pattiWt || 0);
    const freight = Number(r.pattiFreight || 0);
    const commissionVal = Number(r.commission || 0);
    return wt - freight - commissionVal - rowTdsAmount(r);
  }

  const pattiNetTotal = useMemo(() => rows.reduce((sum, r) => sum + rowNet(r), 0), [rows]);

  async function handleSave() {
    setMessage("");
    setError("");

    const activeRows = rows.filter((r) => r.pattiNo.trim() || Number(r.bags) > 0 || Number(r.pattiWt) > 0);
    if (!activeRows.length) {
      setError("Add at least one patti row");
      return;
    }

    const totalQty = activeRows.reduce((s, r) => s + Number(r.bags || 0), 0);
    const totalNet = activeRows.reduce((s, r) => s + rowNet(r), 0);
    const avgRate = totalQty > 0 ? totalNet / totalQty : 0;
    const first = activeRows[0];

    setLoading(true);
    try {
      const payload = {
        voucherNo,
        businessDate: toIsoDate(date),
        customerAcno: (customer || "CUST001").toUpperCase(),
        itemCode: (first.pattiNo || "PATTI001").toUpperCase().replace(/\s+/g, "_"),
        qty: totalQty > 0 ? totalQty : 1,
        rate: avgRate,
      };
      const { data } = await api.post("/sales", payload);
      setMessage(`Sale saved. ID: ${data.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to save sale");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#dee5f2", p: 2 }}>
      <Typography sx={{ fontSize: 42, color: "#9aa0a9", mb: 1.2 }}>{title}</Typography>

      <Box sx={{ bgcolor: "#cfd9e8", border: "1px solid #b8c7db", p: 2.2 }}>
        <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#1e2e46", mb: 0.6 }}>
          {selectedFirm?.name || "BRT Trading Co."} <Typography component="span" sx={{ color: "#1e2e46", fontSize: 30 }}>›</Typography> Data Entry <Typography component="span" sx={{ color: "#1e2e46", fontSize: 30 }}>›</Typography> Sale patti Entry
        </Typography>

        <Box sx={{ bgcolor: "#becadd", borderRadius: "16px", p: 2, mt: 1.5, boxShadow: "0 3px 6px rgba(0,0,0,0.2)" }}>
          <Typography sx={{ color: "#667d9d", fontSize: 34, mb: 1 }}>PATTI DETAILS</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.2fr 1.1fr", gap: 1.6 }}>
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
                  <input value={r.bags} onChange={(e) => setCell(rowIndex, "bags", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.pattiWt} onChange={(e) => setCell(rowIndex, "pattiWt", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.pattiFreight} onChange={(e) => setCell(rowIndex, "pattiFreight", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.commission} onChange={(e) => setCell(rowIndex, "commission", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.tdsPercent} onChange={(e) => setCell(rowIndex, "tdsPercent", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
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
    </Box>
  );
}
