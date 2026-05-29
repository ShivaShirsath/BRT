import { useMemo, useState, useEffect } from "react";
import { Box, Button, Checkbox, MenuItem, TextField, Typography, Alert } from "@mui/material";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";

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

export function PurchasePage() {
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  const [billId, setBillId] = useState<number | null>(null);
  const [billNo, setBillNo] = useState("001186");
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Auto-load existing bill when billNo changes or on blur
  async function loadExistingBill(no: string) {
    if (!no.trim()) return;
    try {
      const { data } = await api.get(`/purchase/${no.trim()}`);
      if (data) {
        setBillId(data.id);
        setDate(data.date || "");
        setEntryType(data.entryType || "Select market");
        setCessCondition(data.cessCondition || "Order");
        setSeller(data.seller || "");
        setVehicleNo(data.vehicleNo || "");
        setPartyBillNo(data.partyBillNo || "");
        setNote(data.note || "");
        
        let fetchedRows = (data.items || []).map((item: any) => ({
          commodity: item.commodity || "",
          mark: item.mark || "",
          brand: item.brand || "",
          bags: item.bags || "",
          avgWt: item.avgWt || "",
          purWt: item.purWt || "",
          packingWeight: item.packingWeight || "",
          netWt: item.netWt || "",
          rate: item.rate || "",
        }));

        while (fetchedRows.length < 6) {
          fetchedRows.push(mkRow());
        }
        setRows(fetchedRows);

        if (data.charges) {
          setCharges(data.charges);
        }
        setMessage(`Loaded existing bill: ${no}`);
        setError("");
      }
    } catch (e) {
      // Bill does not exist, treat as a new bill
      setBillId(null);
      if (message.startsWith("Loaded")) {
        setMessage("");
      }
    }
  }

  function setCell(rowIndex: number, key: keyof PurchaseItemRow, value: string) {
    // Validate number fields: allow only digits and optional single decimal point
    const numFields: (keyof PurchaseItemRow)[] = ["bags", "avgWt", "purWt", "packingWeight", "netWt", "rate"];
    if (numFields.includes(key)) {
      if (key === "bags") {
        value = value.replace(/[^0-9]/g, "");
      } else {
        value = value.replace(/[^0-9.]/g, "");
        const parts = value.split(".");
        if (parts.length > 2) {
          value = parts[0] + "." + parts.slice(1).join("");
        }
      }
    }
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, mkRow()]);
    setSelectedRowIndex(rows.length);
  }

  function removeSelectedRow() {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== selectedRowIndex);
      return next;
    });
    setSelectedRowIndex((i) => Math.max(0, i - 1));
  }

  function toIsoDate(ddmmyyyy: string) {
    const p = ddmmyyyy.split(".");
    if (p.length !== 3) return new Date().toISOString().slice(0, 10);
    return `${p[2]}-${p[1]}-${p[0]}`;
  }

  // Calculate items sum
  const itemsTotal = useMemo(() => {
    return rows.reduce((sum, r) => sum + Number(r.netWt || 0) * Number(r.rate || 0), 0);
  }, [rows]);

  // Sync "Purchase amt." in charges with the items total
  useEffect(() => {
    setCharges((c) => ({
      ...c,
      "Purchase amt.": itemsTotal.toFixed(2),
    }));
  }, [itemsTotal]);

  // Calculate net total with charges & taxes
  const netTotal = useMemo(() => {
    const purchaseAmt = Number(charges["Purchase amt."] || 0);
    const mTax = Number(charges["M. Tax"] || 0);
    const commission = Number(charges["Commission"] || 0);
    const purComm = Number(charges["Pur. Comm"] || 0);
    const freight = Number(charges["Freight"] || 0);
    const packing = Number(charges["Packing"] || 0);
    const loading = Number(charges["Loading"] || 0);
    const levy = Number(charges["Leivy"] || charges["Levy"] || 0);
    const tolai = Number(charges["Tolai"] || 0);
    const hamali = Number(charges["Hamali"] || 0);
    const discount = Number(charges["Discount"] || 0);
    const igst = Number(charges["IGST"] || 0);
    const sgst = Number(charges["SGST"] || 0);
    const cgst = Number(charges["CGST"] || 0);
    const tds = Number(charges["TDS"] || 0);
    const khandani = Number(charges["Khandani"] || 0);
    const ourExpenses = Number(charges["Our expenses"] || 0);
    const exp2 = Number(charges["Exp. 2"] || 0);
    const exp3 = Number(charges["Exp. 3"] || 0);
    const exp4 = Number(charges["Exp. 4"] || 0);

    const total = purchaseAmt + mTax + commission + purComm + freight + packing + loading + levy + tolai + hamali + khandani + ourExpenses + exp2 + exp3 + exp4 - discount;
    const net = total + igst + sgst + cgst - tds;
    return isNaN(net) ? 0 : net;
  }, [charges]);

  async function onSave() {
    setError("");
    setMessage("");
    const activeRows = rows.filter((r) => r.commodity.trim() || Number(r.netWt) > 0 || Number(r.rate) > 0);
    if (!activeRows.length) {
      setError("Add at least one item row");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: billId,
        voucherNo: billNo,
        businessDate: toIsoDate(date),
        entryType,
        cessCondition,
        supplierAcno: seller || "SUPP001",
        vehicleNo,
        partyBillNo,
        note,
        print,
        billReceived,
        lockState,
        items: activeRows.map((r) => ({
          commodity: r.commodity.toUpperCase(),
          mark: r.mark,
          brand: r.brand,
          bags: r.bags ? parseInt(r.bags) : 0,
          avgWt: r.avgWt ? parseFloat(r.avgWt) : 0.0,
          purWt: r.purWt ? parseFloat(r.purWt) : 0.0,
          packingWeight: r.packingWeight ? parseFloat(r.packingWeight) : 0.0,
          netWt: r.netWt ? parseFloat(r.netWt) : 0.0,
          rate: r.rate ? parseFloat(r.rate) : 0.0,
        })),
        charges,
      };

      const { data } = await api.post("/purchase", payload);
      setMessage(`Purchase saved successfully. ID: ${data.id}`);
      setBillId(data.id);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to save purchase");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#dee5f2", p: 2 }}>
      <Typography sx={{ fontSize: 42, color: "#9aa0a9", mb: 1.2 }}>Purchase Bill Entry</Typography>

      <Box sx={{ bgcolor: "#cfd9e8", border: "1px solid #b8c7db", p: 2.2 }}>
        <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#1e2e46", mb: 0.6 }}>
          {selectedFirm?.name || "BRT Trading Co."} <Typography component="span" sx={{ color: "#1e2e46", fontSize: 30 }}>›</Typography> Data Entry <Typography component="span" sx={{ color: "#1e2e46", fontSize: 30 }}>›</Typography> Purchase Bill Entry
        </Typography>

        <Box sx={{ bgcolor: "#becadd", borderRadius: "16px", p: 2, mt: 1.5, boxShadow: "0 3px 6px rgba(0,0,0,0.2)" }}>
          <Typography sx={{ color: "#667d9d", fontSize: 34, mb: 1 }}>BILL DETAILS</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1.6 }}>
            <TextField 
              label="Bill no." 
              size="small" 
              value={billNo} 
              onChange={(e) => setBillNo(e.target.value)} 
              onBlur={() => loadExistingBill(billNo)}
            />
            <TextField label="Date" size="small" value={date} onChange={(e) => setDate(e.target.value)} />
            <TextField label="Entry Type" size="small" select value={entryType} onChange={(e) => setEntryType(e.target.value)}>
              <MenuItem value="Select market">Select market</MenuItem>
              <MenuItem value="Market A">Market A</MenuItem>
            </TextField>
            <TextField label="Cess Condition" size="small" select value={cessCondition} onChange={(e) => setCessCondition(e.target.value)}>
              <MenuItem value="Order">Order</MenuItem>
              <MenuItem value="Direct">Direct</MenuItem>
            </TextField>
            <TextField label="Seller" size="small" value={seller} onChange={(e) => setSeller(e.target.value)} sx={{ gridColumn: "1 / span 2" }} placeholder="Search Customer" />
            <TextField label="Vehicle No." size="small" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
            <TextField label="Party Bill No." size="small" value={partyBillNo} onChange={(e) => setPartyBillNo(e.target.value)} />
          </Box>
        </Box>

        <Box sx={{ bgcolor: "#becadd", borderRadius: "16px", p: 2, mt: 2.2, boxShadow: "0 3px 6px rgba(0,0,0,0.2)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2 }}>
            <Typography sx={{ color: "#667d9d", fontSize: 40 }}>ITEMS</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={addRow} sx={{ textTransform: "none", borderRadius: "10px", fontSize: 34, px: 2.2 }}>+ Add row</Button>
              <Button variant="outlined" onClick={removeSelectedRow} sx={{ textTransform: "none", borderRadius: "10px", fontSize: 34, px: 2.2 }}>Remove</Button>
            </Box>
          </Box>

          <Box sx={{ border: "1px solid #aebfd5", bgcolor: "#d7dce5" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "0.4fr 1.8fr 1.2fr 1.2fr 0.9fr 0.9fr 0.9fr 1.3fr 0.9fr 0.9fr 1.1fr", px: 1, py: 0.7, borderBottom: "1px solid #aebfd5" }}>
              {["#", "Commodity", "Mark", "Brand", "Bags", "Avg. Wt.", "Pur. Wt.", "Packing Weight", "Net Wt.", "Rate", "Amount"].map((h) => (
                <Typography key={h} sx={{ color: "#617897", fontSize: 31 }}>{h}</Typography>
              ))}
            </Box>

            {rows.map((r, rowIndex) => {
              const amount = (Number(r.netWt || 0) * Number(r.rate || 0)).toFixed(2);
              return (
                <Box key={rowIndex} onClick={() => setSelectedRowIndex(rowIndex)} sx={{ display: "grid", gridTemplateColumns: "0.4fr 1.8fr 1.2fr 1.2fr 0.9fr 0.9fr 0.9fr 1.3fr 0.9fr 0.9fr 1.1fr", px: 1, py: 0.6, borderBottom: "1px solid #aebfd5", bgcolor: selectedRowIndex === rowIndex ? "#e8edf6" : "transparent" }}>
                  <Typography sx={{ fontSize: 28 }}>{rowIndex + 1}</Typography>
                  <input value={r.commodity} onChange={(e) => setCell(rowIndex, "commodity", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.mark} onChange={(e) => setCell(rowIndex, "mark", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.brand} onChange={(e) => setCell(rowIndex, "brand", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.bags} onChange={(e) => setCell(rowIndex, "bags", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.avgWt} onChange={(e) => setCell(rowIndex, "avgWt", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.purWt} onChange={(e) => setCell(rowIndex, "purWt", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.packingWeight} onChange={(e) => setCell(rowIndex, "packingWeight", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.netWt} onChange={(e) => setCell(rowIndex, "netWt", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <input value={r.rate} onChange={(e) => setCell(rowIndex, "rate", e.target.value)} style={{ fontSize: 28, border: "none", background: "transparent", width: "100%" }} />
                  <Typography sx={{ fontSize: 28 }}>{amount}</Typography>
                </Box>
              );
            })}

            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" style={{ width: "100%", padding: "14px 12px", border: "none", fontSize: 28, background: "#e2e7ef", color: "#6a7990" }} />
          </Box>
        </Box>

        <Box sx={{ bgcolor: "#becadd", borderRadius: "16px", p: 2, mt: 2.2, boxShadow: "0 3px 6px rgba(0,0,0,0.2)" }}>
          <Typography sx={{ color: "#667d9d", fontSize: 34, mb: 1 }}>Charges & Taxes</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 1.2 }}>
            {chargeFields.map((f) => (
              <TextField 
                key={f} 
                size="small" 
                label={f} 
                value={charges[f]} 
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.replace(/[^0-9.]/g, "");
                  const parts = value.split(".");
                  if (parts.length > 2) {
                    value = parts[0] + "." + parts.slice(1).join("");
                  }
                  setCharges((c) => ({ ...c, [f]: value }));
                }} 
              />
            ))}
          </Box>
          <Typography sx={{ textAlign: "right", mt: 1, color: "#667d9d", fontSize: 31 }}>Total ₹ {netTotal.toFixed(2)} | Net total ₹ {netTotal.toFixed(2)}</Typography>
        </Box>

        {message ? <Alert severity="success" sx={{ mt: 1.2 }}>{message}</Alert> : null}
        {error ? <Alert severity="error" sx={{ mt: 1.2 }}>{error}</Alert> : null}

        <Box sx={{ mt: 2, borderTop: "1px solid #90a7c6", pt: 1.4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Checkbox checked={print} onChange={(e) => setPrint(e.target.checked)} />
            <Typography sx={{ fontSize: 32 }}>Print</Typography>
            <Typography sx={{ fontSize: 32, color: "#6a7f9d" }}>Bill received?</Typography>
            <TextField size="small" select value={billReceived} onChange={(e) => setBillReceived(e.target.value)} sx={{ width: 120 }}>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
            </TextField>
            <Typography sx={{ fontSize: 32, color: "#6a7f9d" }}>Lock?</Typography>
            <TextField size="small" select value={lockState} onChange={(e) => setLockState(e.target.value)} sx={{ width: 100 }}>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" sx={{ textTransform: "none", fontSize: 34 }}>Delete</Button>
            <Button variant="contained" onClick={onSave} disabled={loading} sx={{ textTransform: "none", fontSize: 34 }}>{loading ? "Saving..." : "Save"}</Button>
            <Button variant="outlined" sx={{ textTransform: "none", fontSize: 34 }} onClick={() => history.back()}>Close</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
