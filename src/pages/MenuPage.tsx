import { useEffect, useState } from "react";
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useNetwork } from "../hooks/useNetwork";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { triggerSync } from "../api/syncEngine";

type MenuItem = { code: string; label: string; route: string; sortOrder: number };

export function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const setMenu = useAuthStore((s) => s.setMenu);
  const selectedFirm = useAuthStore((s) => s.selectedFirm);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const isOnline = useNetwork();
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncingManual, setSyncingManual] = useState(false);

  const pendingCount = useLiveQuery(() => db.syncOutbox.count()) ?? 0;
  const outboxItems = useLiveQuery(() => db.syncOutbox.toArray()) ?? [];
  const cachedPurchases = useLiveQuery(() => db.purchases.toArray()) ?? [];
  const cachedSales = useLiveQuery(() => db.sales.toArray()) ?? [];

  async function handleManualSync() {
    setSyncingManual(true);
    try {
      await triggerSync();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingManual(false);
    }
  }

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/menu");
      const menu = (data.items ?? []) as MenuItem[];
      setItems(menu);
      setMenu(menu);
    })();
  }, [setMenu]);

  const quickItems = [
    "Staff Attendance",
    "Reminder Entry",
    "RTGS",
    "SMS Menu",
    "Mobile Menu",
    "Server Menu (CCS)",
    "Import Bills",
    "Billing Machine",
    "Barcode Stickers",
    "Update Purchase",
    "Tally Export",
  ];

  const centerItems = ["Data Entry", "Sync", "Printing", "Setup", "Miscellaneous", "Personal", "Exit"];
  const rightItems = [
    "Delivery Challan Entry",
    "Purchase Bill Entry",
    "Challan Print",
    "Sale Bill Print",
    "VATAV Report",
    "Javak Report",
    "Akak Report",
    "Profit/Loss Report",
    "Cash Book",
  ];

  function onMainAction(label: string) {
    if (label === "Exit") {
      logout();
      navigate("/auth");
      return;
    }
    if (label === "Sync") {
      setSyncDialogOpen(true);
      return;
    }
    if (label === "Data Entry") {
      const hasPurchase = items.some((i) => i.route === "/purchase");
      const hasSales = items.some((i) => i.route === "/sales");
      if (hasPurchase) {
        navigate("/data-entry");
        return;
      }
      if (hasSales) {
        navigate("/data-entry");
      }
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#dee5f2" }}>
      <Box
        sx={{
          bgcolor: "#fff",
          height: "120px",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          px: 2,
          position: "relative",
        }}
      >
        <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 1.2, bgcolor: isOnline ? "#e8f5e9" : "#ffebee", px: 2, py: 0.5, borderRadius: "20px", border: isOnline ? "1px solid #c8e6c9" : "1px solid #ffcdd2" }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isOnline ? "#4caf50" : "#f44336" }} />
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: isOnline ? "#2e7d32" : "#c62828" }}>
            {isOnline ? "Online" : "Offline"} {pendingCount > 0 ? `(${pendingCount} pending)` : ""}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: "#172e57", fontSize: { xs: 38, md: 56 }, fontWeight: 700, lineHeight: 1 }}>
            {selectedFirm?.name?.toUpperCase() || "BRT TRADING CO."}
          </Typography>
          <Typography sx={{ color: "#1f262e", fontSize: { xs: 22, md: 40 }, fontWeight: 600 }}>
            Financial Year: 01.04.2025 to 31.03.2026
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: "1360px", mx: "auto", mt: 6, px: 2, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "362px 380px 381px" }, gap: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {quickItems.map((item) => {
            const disabled = item === "Update Purchase";
            return (
              <Button
                key={item}
                disabled={disabled}
                sx={{
                  justifyContent: "flex-start",
                  height: "50px",
                  borderRadius: "10px",
                  border: "1px solid #cfdbed",
                  bgcolor: disabled ? "#e5e8ed" : "#f7faff",
                  color: disabled ? "#8c94a1" : "#1f2b3b",
                  fontWeight: 600,
                  fontSize: 24,
                  textTransform: "none",
                  px: 2,
                }}
              >
                {item}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {centerItems.map((item, idx) => {
            const active = idx === 0;
            return (
              <Button
                key={item}
                onClick={() => onMainAction(item)}
                sx={{
                  height: "66px",
                  borderRadius: "12px",
                  border: active ? "2px solid #2b7ded" : "1px solid #d4deed",
                  bgcolor: active ? "#f2f7ff" : "#fafafc",
                  color: "#1f242b",
                  fontWeight: active ? 700 : 400,
                  fontSize: 56,
                  textTransform: "none",
                  justifyContent: "center",
                  boxShadow: active ? "none" : "0px 1px 2px rgba(0,0,0,0.12)",
                }}
              >
                {item}
              </Button>
            );
          })}
        </Box>

        <Box
          sx={{
            bgcolor: "#d4deed",
            border: "2px solid #dee5f2",
            borderRadius: "16px",
            boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
            p: 3,
          }}
        >
          <Box
            sx={{
              width: "297px",
              height: "52px",
              bgcolor: "#1470e5",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              px: 2,
              mb: 2,
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 44, lineHeight: 1 }}>Contract Expired</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
            {rightItems.map((item) => (
              <Typography key={item} sx={{ color: "#1f242b", fontWeight: 600, fontSize: 41, lineHeight: 1.1 }}>
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
      <Dialog open={syncDialogOpen} onClose={() => setSyncDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: 28, fontWeight: 700 }}>Data Synchronization Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2, mb: 3, mt: 1 }}>
            <Box sx={{ flex: 1, bgcolor: isOnline ? "#e8f5e9" : "#ffebee", border: isOnline ? "1px solid #c8e6c9" : "1px solid #ffcdd2", p: 2, borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography sx={{ fontSize: 20, color: "#555" }}>Connection State</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: isOnline ? "#2e7d32" : "#c62828", mt: 1 }}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, bgcolor: "#f1f3f9", border: "1px solid #cfd4db", p: 2, borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography sx={{ fontSize: 20, color: "#555" }}>Pending Outbox Queue</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#1e2e46", mt: 1 }}>
                {pendingCount} records
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: 24, fontWeight: 600, color: "#333", mb: 1 }}>Purchase Entries Cache</Typography>
          
          {cachedPurchases.length === 0 ? (
            <Typography sx={{ fontSize: 20, color: "#666", py: 2, textAlign: "center" }}>No purchase entries stored locally</Typography>
          ) : (
            <Box sx={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #d4deed", mb: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f1f5fa" }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: 18, fontWeight: 700 }}>Voucher No.</TableCell>
                    <TableCell sx={{ fontSize: 18, fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontSize: 18, fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontSize: 18, fontWeight: 700 }}>Sync Error / Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cachedPurchases.map((p) => {
                    const isPending = outboxItems.some((item) => item.payload.id === p.id);
                    return (
                      <TableRow key={p.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontSize: 18 }}>{p.billNo}</TableCell>
                        <TableCell sx={{ fontSize: 18 }}>Purchase</TableCell>
                        <TableCell sx={{ fontSize: 18 }}>
                          <Typography sx={{ fontSize: 18, fontWeight: 600, color: p.synced ? "#2e7d32" : (isPending ? "#ef6c00" : "#d84315") }}>
                            {p.synced ? "Synced" : (isPending ? "Pending Sync" : "Error")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 16, color: p.syncError ? "#d84315" : "#666" }}>
                          {p.syncError || (p.synced ? "Success" : "Waiting for network...")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}

          <Typography sx={{ fontSize: 24, fontWeight: 600, color: "#333", mb: 1, mt: 2 }}>Sales Entries Cache</Typography>
          
          {cachedSales.length === 0 ? (
            <Typography sx={{ fontSize: 20, color: "#666", py: 2, textAlign: "center" }}>No sales entries stored locally</Typography>
          ) : (
            <Box sx={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #d4deed" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f1f5fa" }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: 18, fontWeight: 700 }}>Voucher No.</TableCell>
                    <TableCell sx={{ fontSize: 18, fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontSize: 18, fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontSize: 18, fontWeight: 700 }}>Sync Error / Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cachedSales.map((s) => {
                    const isPending = outboxItems.some((item) => item.payload.id === s.id);
                    return (
                      <TableRow key={s.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontSize: 18 }}>{s.billNo}</TableCell>
                        <TableCell sx={{ fontSize: 18 }}>Sale</TableCell>
                        <TableCell sx={{ fontSize: 18 }}>
                          <Typography sx={{ fontSize: 18, fontWeight: 600, color: s.synced ? "#2e7d32" : (isPending ? "#ef6c00" : "#d84315") }}>
                            {s.synced ? "Synced" : (isPending ? "Pending Sync" : "Error")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 16, color: s.syncError ? "#d84315" : "#666" }}>
                          {s.syncError || (s.synced ? "Success" : "Waiting for network...")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSyncDialogOpen(false)} variant="outlined" sx={{ textTransform: "none", fontSize: 20 }}>
            Close
          </Button>
          <Button 
            onClick={handleManualSync} 
            disabled={syncingManual || !isOnline || pendingCount === 0} 
            variant="contained" 
            sx={{ textTransform: "none", fontSize: 20 }}
            startIcon={syncingManual ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {syncingManual ? "Syncing..." : "Sync Now"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
