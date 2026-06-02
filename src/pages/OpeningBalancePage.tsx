import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { AccountGenerationModal } from "../components/AccountGenerationModal";

export function OpeningBalancePage() {
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [printUponSaving, setPrintUponSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Fetch customers
  const fetchCustomers = async (search = "") => {
    try {
      const { data } = await api.get("/customers", {
        params: search ? { search } : {},
      });
      setCustomers(data || []);
    } catch (err) {
      console.error("Failed to load customers", err);
      setError("Failed to load customer list");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Search trigger (debounced or simple handler)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle cell edit
  const handleBalanceChange = (id: number, val: string) => {
    const numVal = parseFloat(val) || 0;
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, openingBalance: numVal } : c))
    );
  };

  const handleTypeChange = (id: number, val: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, openingBalanceType: val } : c))
    );
  };

  // Delete customer
  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this customer account?")) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setMessage("Account deleted successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to delete customer");
    }
  };

  // Save all balances
  const handleSaveAll = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      // Save changes by iterating over customer list and sending PUT requests
      for (const cust of customers) {
        await api.put(`/customers/${cust.id}`, cust);
      }
      setMessage("Opening balances updated successfully");
      if (printUponSaving) {
        window.print();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  // Save/Create modal callback
  const handleSaveModal = async (formData: any) => {
    try {
      if (selectedCustomer?.id) {
        // Update
        const { data } = await api.put(`/customers/${selectedCustomer.id}`, formData);
        setCustomers((prev) => prev.map((c) => (c.id === data.id ? data : c)));
        setMessage("Account updated successfully");
      } else {
        // Create
        const { data } = await api.post("/customers", formData);
        setCustomers((prev) => [...prev, data]);
        setMessage("Account created successfully");
      }
      setModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save account details");
    }
  };

  // Totals calculations
  const { totalDebit, totalCredit } = useMemo(() => {
    let debits = 0;
    let credits = 0;
    customers.forEach((c) => {
      const bal = Number(c.openingBalance) || 0;
      if (c.openingBalanceType === "D" || c.openingBalanceType === "Debit") {
        debits += bal;
      } else {
        credits += bal;
      }
    });
    return { totalDebit: debits, totalCredit: credits };
  }, [customers]);

  // Keyboard Shortcuts F5 to Save, ESC to Exit/Back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        handleSaveAll();
      } else if (e.key === "Escape") {
        history.back();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customers]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#dee5f2", p: 3, display: "flex", flexDirection: "column" }}>
      {/* Top Breadcrumb */}
      <Typography sx={{ color: "#1470e5", fontSize: 20, fontWeight: 700, mb: 2 }}>
        {selectedFirm?.name?.toUpperCase() || "BRT TRADING CO."} &gt; DATA ENTRY &gt; OPENING BALANCE CHANGE
      </Typography>

      {/* Main Container */}
      <Paper
        sx={{
          bgcolor: "#cfd9e8",
          border: "1px solid #bccade",
          borderRadius: "20px",
          boxShadow: "0 8px 16px rgba(20,51,97,0.15)",
          p: 3,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#1e2e46", mb: 0.5 }}>
            Find Name:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              bgcolor: "#fff",
              borderRadius: "8px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
        </Box>

        {message ? (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
            {message}
          </Alert>
        ) : null}
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        ) : null}

        {/* Table wrapper */}
        <TableContainer sx={{ flex: 1, maxHeight: "calc(100vh - 350px)", bgcolor: "#fff", borderRadius: "12px", border: "1px solid #bccade" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6fa" }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6fa" }}>CUSTOMER NAME</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#f4f6fa" }}>OPENING BALANCE</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6fa" }}>CREDIT/DEBIT</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#f4f6fa" }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((c, index) => (
                <TableRow key={c.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setSelectedCustomer(c);
                        setModalOpen(true);
                      }}
                      sx={{
                        textTransform: "none",
                        color: "#1e2e46",
                        fontWeight: 600,
                        justifyContent: "flex-start",
                        p: 0,
                        "&:hover": { textDecoration: "underline", bgcolor: "transparent" },
                      }}
                    >
                      {c.name}
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    <input
                      type="number"
                      step="0.01"
                      value={c.openingBalance}
                      onChange={(e) => handleBalanceChange(c.id, e.target.value)}
                      style={{
                        textAlign: "right",
                        fontWeight: "bold",
                        color: "#1470e5",
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        width: "120px",
                        fontSize: "1rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={c.openingBalanceType === "C" || c.openingBalanceType === "Credit" ? "C" : "D"}
                      onChange={(e) => handleTypeChange(c.id, e.target.value)}
                      variant="standard"
                      disableUnderline
                      sx={{ fontWeight: 500 }}
                    >
                      <MenuItem value="D">Debit</MenuItem>
                      <MenuItem value="C">Credit</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleDeleteCustomer(c.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No customer accounts found. Click "+ New Account" to add one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer info inside paper */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, px: 1 }}>
          <Typography sx={{ color: "#546e7a", fontWeight: 500 }}>
            Showing {customers.length} customer accounts
          </Typography>
          <Typography sx={{ color: "#1e2e46", fontWeight: 700 }}>
            Total Debit: {totalDebit.toFixed(2)} &nbsp;&nbsp;|&nbsp;&nbsp; Total Credit: {totalCredit.toFixed(2)}
          </Typography>
        </Box>
      </Paper>

      {/* Bottom Command Buttons Bar */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedCustomer(null);
              setModalOpen(true);
            }}
            sx={{
              bgcolor: "#fff",
              color: "#1e2e46",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              px: 3,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            + New Account
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                checked={printUponSaving}
                onChange={(e) => setPrintUponSaving(e.target.checked)}
              />
            }
            label="Print upon saving"
            sx={{ color: "#1e2e46", fontWeight: 500 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={handleSaveAll}
            disabled={loading}
            sx={{
              bgcolor: "#1470e5",
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "10px",
              px: 4,
              "&:hover": { bgcolor: "#105bbd" },
            }}
          >
            {loading ? "Saving..." : "Save (F5)"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => history.back()}
            sx={{
              borderColor: "#aebfd5",
              color: "#1e2e46",
              bgcolor: "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "10px",
              px: 3,
              "&:hover": { bgcolor: "#f5f5f5", borderColor: "#aebfd5" },
            }}
          >
            Close (ESC)
          </Button>
        </Box>
      </Box>

      {/* Account Generation Modal Component */}
      <AccountGenerationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveModal}
        initialData={selectedCustomer}
      />
    </Box>
  );
}
