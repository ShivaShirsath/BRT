import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function DataEntryPage() {
  const navigate = useNavigate();
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  const col1 = [
    "Delivery Challan Entry",
    "Purchase Bill",
    "Sales Patti Entry",
    "Dalal Payment 1",
    "Dalal Payment",
    "Cash Deposit",
    "Cash Withdrawal",
    "Customer Receipt",
    "Miscellaneous Receipt",
    "Payment Voucher",
  ];
  const col2 = [
    "Account Generation",
    "Journal Voucher",
    "Vapasi Entry",
    "Opening Balance",
    "Parcel Expense Entry",
    "Bank Reconciliation",
    "Accounts Group Master",
    "Release Records (LAN)",
    "Contract Entry",
    "Grading",
  ];
  const col3 = [
    "Dispatch Entry",
    "Cheque Return Entry",
    "Customer Expenses",
    "Stall Expenses Entry",
    "Multiple Bank / Address",
    "Opening Stock Entry",
    "Railway Freight Entry",
    "Dockt Entry",
    "Update Stock",
    "Exit",
  ];

  function routeFor(title: string) {
    if (title === "Purchase Bill") return "/purchase";
    if (title === "Sales Patti Entry") return "/sales";
    if (title === "Opening Balance") return "/opening-balances";
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#dee5f2", p: 2 }}>
      <Box
        sx={{
          bgcolor: "#fff",
          height: "140px",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Box>
          <Typography sx={{ color: "#172e57", fontSize: { xs: 34, md: 60 }, fontWeight: 700, lineHeight: 1 }}>
            {selectedFirm?.name?.toUpperCase() || "BRT TRADING CO."}
          </Typography>
          <Typography sx={{ color: "#1f262e", fontSize: { xs: 20, md: 48 }, fontWeight: 600 }}>
            Financial Year: 01.04.2025 to 31.03.2026
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: "1360px", mx: "auto", mt: 2 }}>
        <Box
          sx={{
            bgcolor: "#cfd9e8",
            border: "1px solid #bccade",
            borderRadius: "20px",
            boxShadow: "0 8px 16px rgba(20,51,97,0.15)",
            p: 3,
          }}
        >
          <Box sx={{ display: "grid", placeItems: "center", mb: 3 }}>
            <Box
              sx={{
                bgcolor: "#1d72e3",
                borderRadius: "14px",
                px: 3,
                py: 0.8,
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
                Data Entry Menu
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 3 }}>
            {[col1, col2, col3].map((col, ci) => (
              <Box key={ci} sx={{ display: "flex", flexDirection: "column", gap: 1.6 }}>
                {col.map((title) => {
                  const route = routeFor(title);
                  const enabled = Boolean(route);
                  return (
                    <Button
                      key={title}
                      disabled={!enabled}
                      onClick={() => route && navigate(route)}
                      sx={{
                        height: "66px",
                        justifyContent: "flex-start",
                        borderRadius: "14px",
                        border: "1px solid #c6d3e5",
                        bgcolor: enabled ? "#f4f6fa" : "#e3e7ee",
                        color: enabled ? "#262d37" : "#8b93a0",
                        fontWeight: 500,
                        fontSize: 22,
                        textTransform: "none",
                        px: 2,
                        boxShadow: "0 3px 4px rgba(0,0,0,0.15)",
                      }}
                    >
                      {title}
                    </Button>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
