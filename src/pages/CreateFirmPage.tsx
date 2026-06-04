import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export function CreateFirmPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bookStartDate, setBookStartDate] = useState("01.04.2026");
  const [businessType, setBusinessType] = useState("Trader");
  const [financialYear, setFinancialYear] = useState("2026-27");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to convert dd.MM.yyyy to yyyy-MM-dd ISO format
  function toIsoDate(ddmmyyyy: string) {
    const parts = ddmmyyyy.trim().split(".");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return ddmmyyyy; // fallback if already ISO or formatted otherwise
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Firm Name is required");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const isoDate = toIsoDate(bookStartDate);
      await api.post("/firms", {
        name: name.trim(),
        bookStartDate: isoDate,
        businessType,
        financialYear
      });
      setSuccess("Firm created successfully!");
      setTimeout(() => {
        navigate("/firm-selection");
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to create firm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#edf2fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "480px",
          bgcolor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 18px 40px rgba(20, 51, 97, 0.08)",
          border: "1px solid rgba(212, 227, 245, 0.8)",
          overflow: "visible"
        }}
      >
        <CardContent sx={{ p: 4, "&:last-child": { pb: 4 } }}>
          <Typography
            sx={{
              color: "#1e2e4a",
              fontSize: "20px",
              fontWeight: 700,
              mb: 4,
              borderBottom: "1px solid #edf2fc",
              pb: 2
            }}
          >
            Create Firm
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: "10px" }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            
            {/* Firm Name Row */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  color: "#6e7d91",
                  fontSize: "14px",
                  fontWeight: 600,
                  width: "140px",
                  flexShrink: 0
                }}
              >
                Firm Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter firm name"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    bgcolor: "#fff",
                    "& fieldset": { borderColor: "#d4e3f5" },
                    "&:hover fieldset": { borderColor: "#b5c7e5" },
                    "&.Mui-focused fieldset": { borderColor: "#1470e5" }
                  }
                }}
              />
            </Box>

            {/* Book Start Date Row */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  color: "#6e7d91",
                  fontSize: "14px",
                  fontWeight: 600,
                  width: "140px",
                  flexShrink: 0
                }}
              >
                Book Start Date
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={bookStartDate}
                onChange={(e) => setBookStartDate(e.target.value)}
                placeholder="DD.MM.YYYY"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    bgcolor: "#fff",
                    "& fieldset": { borderColor: "#d4e3f5" },
                    "&:hover fieldset": { borderColor: "#b5c7e5" },
                    "&.Mui-focused fieldset": { borderColor: "#1470e5" }
                  }
                }}
              />
            </Box>

            {/* Business Type Row */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  color: "#6e7d91",
                  fontSize: "14px",
                  fontWeight: 600,
                  width: "140px",
                  flexShrink: 0
                }}
              >
                Business Type
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    borderRadius: "10px",
                    bgcolor: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d4e3f5" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#b5c7e5" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1470e5" }
                  }}
                >
                  <MenuItem value="Trader">Trader</MenuItem>
                  <MenuItem value="Manufacturer">Manufacturer</MenuItem>
                  <MenuItem value="Retailer">Retailer</MenuItem>
                  <MenuItem value="Broker">Broker</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Financial Year Row */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  color: "#6e7d91",
                  fontSize: "14px",
                  fontWeight: 600,
                  width: "140px",
                  flexShrink: 0
                }}
              >
                Financial Year
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    borderRadius: "10px",
                    bgcolor: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d4e3f5" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#b5c7e5" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1470e5" }
                  }}
                >
                  <MenuItem value="2026-27">2026-27</MenuItem>
                  <MenuItem value="2025-26">2025-26</MenuItem>
                  <MenuItem value="2027-28">2027-28</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Form Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/firm-selection")}
                disabled={loading}
                sx={{
                  borderRadius: "10px",
                  borderColor: "#dee5f2",
                  color: "#6e7d91",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  px: 3,
                  py: 1,
                  "&:hover": {
                    borderColor: "#b5c7e5",
                    bgcolor: "#f7faff"
                  }
                }}
              >
                Return
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: "10px",
                  bgcolor: "#1470e5",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  px: 3,
                  py: 1,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#1160c4",
                    boxShadow: "none"
                  }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Create Firm"}
              </Button>
            </Box>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
