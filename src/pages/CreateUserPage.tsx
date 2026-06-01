import React, { useEffect, useState } from "react";
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
  CircularProgress,
  Checkbox,
  ListItemText
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

type Firm = { code: string; name: string };

export function CreateUserPage() {
  const navigate = useNavigate();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirms, setSelectedFirms] = useState<string[]>([]);
  const [userCode, setUserCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleCode, setRoleCode] = useState("OPERATOR");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingFirms, setFetchingFirms] = useState(true);

  // Fetch available firms
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/firms");
        const list = (data.firms ?? []) as Firm[];
        setFirms(list);
        if (list.length > 0) {
          setSelectedFirms([list[0].code]);
        }
      } catch (err: any) {
        setError("Failed to load firms list");
      } finally {
        setFetchingFirms(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFirms.length === 0) {
      setError("Please select at least one Firm");
      return;
    }
    if (!userCode.trim()) {
      setError("User Code is required");
      return;
    }
    if (!fullName.trim()) {
      setError("Full Name is required");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/users", {
        firmCodes: selectedFirms,
        userCode: userCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        roleCode,
        password
      });
      setSuccess("User created successfully!");
      setTimeout(() => {
        navigate("/firm-selection");
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to create user");
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
            Create User
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: "10px" }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            
            {/* Firm Select Row */}
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
                Select Firm(s)
              </Typography>
              <FormControl fullWidth size="small">
                {fetchingFirms ? (
                  <CircularProgress size={20} />
                ) : (
                  <Select
                    multiple
                    value={selectedFirms}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedFirms(typeof val === "string" ? val.split(",") : val);
                    }}
                    renderValue={(selected) => {
                      return selected
                        .map((code) => firms.find((f) => f.code === code)?.name || code)
                        .join(", ");
                    }}
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      borderRadius: "10px",
                      bgcolor: "#fff",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d4e3f5" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#b5c7e5" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1470e5" }
                    }}
                  >
                    {firms.map((f) => (
                      <MenuItem key={f.code} value={f.code}>
                        <Checkbox checked={selectedFirms.indexOf(f.code) > -1} />
                        <ListItemText primary={f.name} />
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Box>


            {/* User Code Row */}
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
                User Code
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="e.g. USER01"
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

            {/* Full Name Row */}
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
                Full Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
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

            {/* Role Row */}
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
                Role
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    borderRadius: "10px",
                    bgcolor: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d4e3f5" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#b5c7e5" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1470e5" }
                  }}
                >
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
                  <MenuItem value="OPERATOR">Operator</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Password Row */}
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
                Password
              </Typography>
              <TextField
                fullWidth
                type="password"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
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

            {/* Actions */}
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
                {loading ? <CircularProgress size={20} color="inherit" /> : "Create User"}
              </Button>
            </Box>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
