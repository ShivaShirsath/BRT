import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

type MenuItem = { code: string; label: string; route: string; sortOrder: number };

export function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const setMenu = useAuthStore((s) => s.setMenu);
  const selectedFirm = useAuthStore((s) => s.selectedFirm);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

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

  const centerItems = ["Data Entry", "Printing", "Setup", "Miscellaneous", "Personal", "Exit"];
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
        }}
      >
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
    </Box>
  );
}
