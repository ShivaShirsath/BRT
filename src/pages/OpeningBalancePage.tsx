import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Loader2 } from "lucide-react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { AccountGenerationModal } from "../components/AccountGenerationModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";

export function OpeningBalancePage() {
  const navigate = useNavigate();
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
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customers]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 flex flex-col text-foreground">
      {/* Top Breadcrumb */}
      <h1 className="text-primary text-xl font-bold mb-4 tracking-tight">
        {selectedFirm?.name?.toUpperCase() || "BRT TRADING CO."} &gt; DATA ENTRY &gt; OPENING BALANCE CHANGE
      </h1>

      {/* Main Container */}
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-border rounded-xl shadow-md p-6 flex flex-col">
        {/* Search */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-muted-foreground block mb-1">
            Find Name:
          </label>
          <Input
            placeholder="Search customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background"
          />
        </div>

        {message && (
          <Alert className="mb-4 bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Table wrapper */}
        <div className="flex-1 overflow-auto border border-border rounded-lg bg-background max-h-[calc(100vh-350px)]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-16 font-bold">#</TableHead>
                <TableHead className="font-bold">CUSTOMER NAME</TableHead>
                <TableHead className="text-right font-bold w-48">OPENING BALANCE</TableHead>
                <TableHead className="font-bold w-36">CREDIT/DEBIT</TableHead>
                <TableHead className="text-center font-bold w-24">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c, index) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedCustomer(c);
                        setModalOpen(true);
                      }}
                      className="text-left font-semibold hover:underline text-foreground bg-transparent border-0 cursor-pointer p-0"
                    >
                      {c.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={c.openingBalance}
                      onChange={(e) => handleBalanceChange(c.id, e.target.value)}
                      className="text-right font-bold text-primary bg-transparent border-0 outline-none w-full max-w-[120px] focus:ring-1 focus:ring-ring focus:bg-background/50 rounded px-1"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={c.openingBalanceType === "C" || c.openingBalanceType === "Credit" ? "C" : "D"}
                      onChange={(e) => handleTypeChange(c.id, e.target.value)}
                      className="h-8 py-0"
                    >
                      <option value="D">Debit</option>
                      <option value="C">Credit</option>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteCustomer(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No customer accounts found. Click "+ New Account" to add one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 mt-4 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground font-medium">
            Showing {customers.length} customer accounts
          </span>
          <span className="text-sm font-bold text-foreground">
            Total Debit: {totalDebit.toFixed(2)} &nbsp;&nbsp;|&nbsp;&nbsp; Total Credit: {totalCredit.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Bottom Command Buttons Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            className="font-bold border-border shadow bg-background"
            onClick={() => {
              setSelectedCustomer(null);
              setModalOpen(true);
            }}
          >
            + New Account
          </Button>

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={printUponSaving}
              onChange={(e) => setPrintUponSaving(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring"
            />
            <span>Print upon saving</span>
          </label>
        </div>

        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <Button
            onClick={handleSaveAll}
            disabled={loading}
            className="font-bold min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save (F5)"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="font-bold border-border bg-background"
          >
            Close (ESC)
          </Button>
        </div>
      </div>

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
    </div>
  );
}
