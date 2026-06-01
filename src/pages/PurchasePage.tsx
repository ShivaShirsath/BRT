import { useEffect, useMemo, useState } from "react";
import { Box, Button, Checkbox, MenuItem, TextField, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
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
      const next = prev.filter((_, i) => i !== selectedRowIndex);
      return next;
    });
    setSelectedRowIndex((i) => Math.max(0, i - 1));
    setIsDirty(true);
  }

  function handleBillNoChange(newVal: string) {
    const trimmed = newVal.trim();
    if (trimmed === billNo) return;

    if (isDirty) {
      setPendingBillNo(trimmed);
      setConfirmDialogOpen(true);
    } else {
      setBillNo(trimmed);
    }
  }

  function handleConfirmDiscard() {
    setConfirmDialogOpen(false);
    setBillNo(pendingBillNo);
    setIsDirty(false);
  }

  async function handleConfirmSave() {
    setConfirmDialogOpen(false);
    await onSave();
    setBillNo(pendingBillNo);
    setIsDirty(false);
  }

  function handleConfirmCancel() {
    setConfirmDialogOpen(false);
    setBillNoInput(billNo);
  }

  function toIsoDate(ddmmyyyy: string) {
    const p = ddmmyyyy.split(".");
    if (p.length !== 3) return new Date().toISOString().slice(0, 10);
    return `${p[2]}-${p[1]}-${p[0]}`;
  }

  const total = useMemo(() => {
    return rows.reduce((sum, r) => sum + Number(r.netWt || 0) * Number(r.rate || 0), 0);
  }, [rows]);

  const netTotal = useMemo(() => {
    let sum = total;
    const additionFields = [
      "M. Tax", "Commission", "Pur. Comm", "Freight", "Packing", "Loading", "Leivy",
      "Tolai", "Hamali", "IGST", "SGST", "CGST", "Khandani", "Our expenses", "Exp. 2", "Exp. 3", "Exp. 4"
    ];
    additionFields.forEach((f) => {
      sum += Number(charges[f] || 0);
    });
    sum -= Number(charges["Discount"] || 0);
    sum -= Number(charges["TDS"] || 0);
    return sum;
  }, [total, charges]);

  async function onSave() {
    setError("");
    setMessage("");
    const activeRows = rows.filter((r) => r.commodity.trim() || Number(r.netWt) > 0 || Number(r.rate) > 0);
    if (!activeRows.length) {
      setError("Add at least one item row");
      return;
    }

    const items = activeRows.map((r) => ({
      commodity: r.commodity.trim(),
      mark: r.mark.trim(),
      brand: r.brand.trim(),
      bags: r.bags.trim(),
      avgWeight: Number(r.avgWt) || 0,
      purchaseWeight: Number(r.purWt) || 0,
      packingWeight: Number(r.packingWeight) || 0,
      netWeight: Number(r.netWt) || 0,
      rate: Number(r.rate) || 0,
      amount: Number(r.netWt || 0) * Number(r.rate || 0),
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
      chargesPayload[apiField] = uiField === "Purchase amt." ? total : (Number(charges[uiField]) || 0);
    }

    setLoading(true);
    try {
      const payload = {
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
      setMessage(`Purchase saved. ID: ${data.id}`);
      setIsDirty(false);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to save purchase");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setDate("08.11.2025");
    setEntryType("Select market");
    setCessCondition("Order");
    setSeller("");
    setVehicleNo("--");
    setPartyBillNo("--");
    setNote("");
    setRows(Array.from({ length: 6 }, () => mkRow()));
    setCharges(Object.fromEntries(chargeFields.map((f) => [f, "0.00"])));
    setMessage("");
    setError("");
    setIsDirty(false);
  }

  async function checkExistingBill(num: string) {
    if (!num.trim()) {
      resetForm();
      return;
    }
    try {
      const { data } = await api.get(`/purchase/by-bill-no/${num.trim()}`);
      if (data && data.id) {
        setBillNo(data.billNo || "");
        setBillNoInput(data.billNo || "");
        if (data.billDate) {
          const parts = data.billDate.split("-");
          if (parts.length === 3) {
            setDate(`${parts[2]}.${parts[1]}.${parts[0]}`);
          } else {
            setDate(data.billDate);
          }
        }
        setEntryType(data.entryType || "Select market");
        setCessCondition(data.cessCondition || "Order");
        setSeller(data.sellerId ? String(data.sellerId) : "");
        setVehicleNo(data.vehicleNo || "--");
        setPartyBillNo(data.partyBillNo || "--");
        setNote(data.note || "");

        if (data.items && data.items.length > 0) {
          const mappedRows = data.items.map((it: any) => ({
            commodity: it.commodity || "",
            mark: it.mark || "",
            brand: it.brand || "",
            bags: it.bags || "",
            avgWt: it.avgWeight !== undefined ? String(it.avgWeight) : "",
            purWt: it.purchaseWeight !== undefined ? String(it.purchaseWeight) : "",
            packingWeight: it.packingWeight !== undefined ? String(it.packingWeight) : "",
            netWt: it.netWeight !== undefined ? String(it.netWeight) : "",
            rate: it.rate !== undefined ? String(it.rate) : "",
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
            purchaseAmount: "Purchase amt.",
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

        setMessage(`Loaded details for Bill no. ${data.billNo}`);
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
            <TextField label="Date" size="small" value={date} onChange={(e) => setDateDirty(e.target.value)} />
            <TextField label="Entry Type" size="small" select value={entryType} onChange={(e) => setEntryTypeDirty(e.target.value)}>
              <MenuItem value="Select market">Select market</MenuItem>
              <MenuItem value="Market A">Market A</MenuItem>
            </TextField>
            <TextField label="Cess Condition" size="small" select value={cessCondition} onChange={(e) => setCessConditionDirty(e.target.value)}>
              <MenuItem value="Order">Order</MenuItem>
              <MenuItem value="Direct">Direct</MenuItem>
            </TextField>
            <TextField label="Seller" size="small" value={seller} onChange={(e) => setSellerDirty(e.target.value)} sx={{ gridColumn: "1 / span 2" }} placeholder="Search Customer" />
            <TextField label="Vehicle No." size="small" value={vehicleNo} onChange={(e) => setVehicleNoDirty(e.target.value)} />
            <TextField label="Party Bill No." size="small" value={partyBillNo} onChange={(e) => setPartyBillNoDirty(e.target.value)} />
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

            <input value={note} onChange={(e) => setNoteDirty(e.target.value)} placeholder="Note" style={{ width: "100%", padding: "14px 12px", border: "none", fontSize: 28, background: "#e2e7ef", color: "#6a7990" }} />
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
                value={f === "Purchase amt." ? total.toFixed(2) : charges[f]}
                onChange={(e) => setChargesDirty((c) => ({ ...c, [f]: e.target.value }))}
                disabled={f === "Purchase amt."}
              />
            ))}
          </Box>
          <Typography sx={{ textAlign: "right", mt: 1, color: "#667d9d", fontSize: 31 }}>Total ₹ {total.toFixed(2)} | Net total ₹ {netTotal.toFixed(2)}</Typography>
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

      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmCancel}
      >
        <DialogTitle sx={{ fontSize: 32, fontWeight: 700 }}>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 28 }}>
            You have unsaved changes in this purchase entry. Would you like to save them before changing the bill number?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleConfirmCancel} variant="outlined" sx={{ textTransform: "none", fontSize: 26 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDiscard} variant="outlined" color="error" sx={{ textTransform: "none", fontSize: 26 }}>
            Discard Changes
          </Button>
          <Button onClick={handleConfirmSave} variant="contained" sx={{ textTransform: "none", fontSize: 26 }}>
            Save & Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
