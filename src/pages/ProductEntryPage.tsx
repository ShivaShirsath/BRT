import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { ExpensesGroupModal } from "../components/ExpensesGroupModal";

interface Product {
  id: number;
  code: string;
  marathiName: string;
  englishName: string;
  bhartiWeight: number;
  gstItemCode: string;
}

interface ExpenseGroup {
  id: number;
  rateCode: string;
  description: string;
  validFrom: string;
  validTo: string;
  bhartiBag: number;
  farmerCommPct: number;
  farmerCessPct: number;
  farmerSupFeePct: number;
  farmerChargePct: number;
  farmerVatPct: number;
  farmerPackingChrg: number;
  farmerRatePer: number;
  farmerDetails: string;
  customerCommPct: number;
  customerCessPct: number;
  customerSupFeePct: number;
  customerChargePct: number;
  customerVatPct: number;
  customerPackingChrg: number;
  customerRatePer: number;
  customerDetails: string;
  hamaliOn: string;
  hamaliRs: number;
  hamaliPer: number;
  hamaliCustRs: number;
  tolaiOn: string;
  tolaiRs: number;
  tolaiPer: number;
  tolaiCustRs: number;
  bharaiOn: string;
  bharaiRs: number;
  bharaiPer: number;
  bharaiCustRs: number;
  mapaiOn: string;
  mapaiRs: number;
  mapaiPer: number;
  mapaiCustRs: number;
  octrioRate: number;
  varaiRate: number;
  packedInCrate: string;
  crateExp: number;
  farmerWeightDisc: number;
  upToWeight: number;
  moreThan: number;
  discountWeight: number;
  purchaseAc: string;
  saleAc: string;
}

export function ProductEntryPage() {
  const navigate = useNavigate();

  // State lists
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ExpenseGroup | null>(null);
  const [groupProducts, setGroupProducts] = useState<Product[]>([]);

  // Modals / Dialogs State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    code: "",
    marathiName: "",
    englishName: "",
    bhartiWeight: 0,
    gstItemCode: "",
  });

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpenseGroup, setEditingExpenseGroup] = useState<ExpenseGroup | null>(null);

  // Link existing period modal
  const [allExpenseGroups, setAllExpenseGroups] = useState<ExpenseGroup[]>([]);
  const [linkPeriodOpen, setLinkPeriodOpen] = useState(false);
  const [selectedPeriodToLink, setSelectedPeriodToLink] = useState<number | "">("");

  // Add Item to Expense Group modal
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [selectedProductToLink, setSelectedProductToLink] = useState<number | "">("");

  // Load products initially
  const loadProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
      if (data.length > 0 && !selectedProduct) {
        setSelectedProduct(data[0]);
      } else if (selectedProduct) {
        // refresh selected product info
        const updated = data.find((p: Product) => p.id === selectedProduct.id);
        if (updated) setSelectedProduct(updated);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  // Load expense groups for selected product
  const loadExpenseGroupsForProduct = async (productId: number) => {
    try {
      const { data } = await api.get(`/products/${productId}/expense-groups`);
      setExpenseGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0]);
      } else {
        setSelectedGroup(null);
        setGroupProducts([]);
      }
    } catch (err) {
      console.error("Failed to load expense groups", err);
    }
  };

  // Load products in selected expense group
  const loadGroupProducts = async (groupId: number) => {
    try {
      const { data } = await api.get(`/expense-groups/${groupId}/products`);
      setGroupProducts(data);
    } catch (err) {
      console.error("Failed to load products in group", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadExpenseGroupsForProduct(selectedProduct.id);
    } else {
      setExpenseGroups([]);
      setSelectedGroup(null);
      setGroupProducts([]);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupProducts(selectedGroup.id);
    } else {
      setGroupProducts([]);
    }
  }, [selectedGroup]);

  // Product Save/Edit
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      code: "",
      marathiName: "",
      englishName: "",
      bhartiWeight: 0.0,
      gstItemCode: "",
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.code.trim()) return alert("Code is required");
    try {
      const payload = editingProduct ? { ...editingProduct, ...productForm } : productForm;
      await api.post("/products", payload);
      setProductModalOpen(false);
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    if (confirm(`Are you sure you want to delete product ${selectedProduct.code}?`)) {
      try {
        await api.delete(`/products/${selectedProduct.id}`);
        setSelectedProduct(null);
        loadProducts();
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  // Expense Group Actions
  const handleOpenAddExpenseGroup = () => {
    setEditingExpenseGroup(null);
    setExpenseModalOpen(true);
  };

  const handleSaveExpenseGroup = async (groupData: any) => {
    try {
      const { data: savedGroup } = await api.post("/expense-groups", groupData);
      // Link it to current product if it's a new or updated group
      if (selectedProduct) {
        await api.post(`/expense-groups/${savedGroup.id}/products/${selectedProduct.id}`);
      }
      setExpenseModalOpen(false);
      if (selectedProduct) {
        loadExpenseGroupsForProduct(selectedProduct.id);
      }
    } catch (err) {
      alert("Failed to save expense group");
    }
  };

  const handleDeleteExpenseGroup = async (groupId: number) => {
    try {
      await api.delete(`/expense-groups/${groupId}`);
      setExpenseModalOpen(false);
      if (selectedProduct) {
        loadExpenseGroupsForProduct(selectedProduct.id);
      }
    } catch (err) {
      alert("Failed to delete expense group");
    }
  };

  // Load all expense groups to link period
  const handleOpenLinkPeriod = async () => {
    try {
      const { data } = await api.get("/expense-groups");
      // filter out already linked
      const unlinked = data.filter(
        (g: ExpenseGroup) => !expenseGroups.some((eg) => eg.id === g.id)
      );
      setAllExpenseGroups(unlinked);
      setSelectedPeriodToLink("");
      setLinkPeriodOpen(true);
    } catch (err) {
      alert("Failed to load expense groups");
    }
  };

  const handleLinkPeriod = async () => {
    if (!selectedPeriodToLink || !selectedProduct) return;
    try {
      await api.post(`/expense-groups/${selectedPeriodToLink}/products/${selectedProduct.id}`);
      setLinkPeriodOpen(false);
      loadExpenseGroupsForProduct(selectedProduct.id);
    } catch (err) {
      alert("Failed to link period");
    }
  };

  // Add Item to Group
  const handleOpenAddItem = () => {
    setSelectedProductToLink("");
    setAddItemOpen(true);
  };

  const handleLinkProductToGroup = async () => {
    if (!selectedProductToLink || !selectedGroup) return;
    try {
      await api.post(`/expense-groups/${selectedGroup.id}/products/${selectedProductToLink}`);
      setAddItemOpen(false);
      loadGroupProducts(selectedGroup.id);
    } catch (err) {
      alert("Failed to add item to group");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#dee5f2", p: 3 }}>
      {/* Outer Card Panel */}
      <Paper
        elevation={3}
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          borderRadius: "16px",
          overflow: "hidden",
          bgcolor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Title */}
        <Box sx={{ bgcolor: "#eff6ff", p: 2, borderBottom: "1px solid #cbd5e1" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e3a8a" }}>
            Product Entry
          </Typography>
        </Box>

        {/* Content Layout */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "55% 45%" }, p: 3, gap: 3 }}>
          
          {/* Left Column: Product Master List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "500px", borderRadius: "8px" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>Marathi Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>English Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>Bharti Wt.</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>GST Item Code</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <TableRow
                        key={p.id}
                        hover
                        selected={isSelected}
                        onClick={() => setSelectedProduct(p)}
                        onDoubleClick={() => {
                          setEditingProduct(p);
                          setProductForm({
                            code: p.code,
                            marathiName: p.marathiName || "",
                            englishName: p.englishName || "",
                            bhartiWeight: p.bhartiWeight || 0,
                            gstItemCode: p.gstItemCode || "",
                          });
                          setProductModalOpen(true);
                        }}
                        sx={{
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#e0f2fe !important" : "inherit",
                        }}
                      >
                        <TableCell sx={{ color: "#0284c7", fontWeight: 600 }}>{p.code}</TableCell>
                        <TableCell>{p.marathiName}</TableCell>
                        <TableCell>{p.englishName}</TableCell>
                        <TableCell align="right">{p.bhartiWeight.toFixed(2)}</TableCell>
                        <TableCell>{p.gstItemCode}</TableCell>
                      </TableRow>
                    );
                  })}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: "#64748b", py: 4 }}>
                        No products available. Click Add to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Product Control Buttons */}
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={handleOpenAddProduct}
                sx={{
                  bgcolor: "#2563eb",
                  borderRadius: "8px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                Add
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={!selectedProduct}
                onClick={handleDeleteProduct}
                sx={{
                  borderRadius: "8px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>

          {/* Right Column: Expense Group & Items */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            
            {/* Expense Periods List */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                {selectedProduct ? `${selectedProduct.code} - ${selectedProduct.englishName}` : "No Product Selected"}
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "220px", borderRadius: "8px" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>Valid From</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>Valid up to</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenseGroups.map((g) => {
                      const isSelected = selectedGroup?.id === g.id;
                      return (
                        <TableRow
                          key={g.id}
                          hover
                          selected={isSelected}
                          onClick={() => setSelectedGroup(g)}
                          onDoubleClick={() => {
                            setEditingExpenseGroup(g);
                            setExpenseModalOpen(true);
                          }}
                          sx={{
                            cursor: "pointer",
                            backgroundColor: isSelected ? "#e0f2fe !important" : "inherit",
                          }}
                        >
                          <TableCell sx={{ color: "#0284c7" }}>{g.description}</TableCell>
                          <TableCell>{g.validFrom}</TableCell>
                          <TableCell>{g.validTo || ". ."}</TableCell>
                        </TableRow>
                      );
                    })}
                    {expenseGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ color: "#64748b", py: 2 }}>
                          No expense periods configured.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Group Period buttons */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={handleOpenAddExpenseGroup}
                  disabled={!selectedProduct}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    "&:hover": { borderColor: "#94a3b8" },
                  }}
                >
                  Add new expenses Group
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleOpenLinkPeriod}
                  disabled={!selectedProduct}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    "&:hover": { borderColor: "#94a3b8" },
                  }}
                >
                  New Period
                </Button>
              </Box>
            </Box>

            {/* Item List for Selected Expense Group */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569" }}>
                ITEM LIST FOR SELECTED EXPENSES GROUP
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "200px", borderRadius: "8px" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }}>Product Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupProducts.map((gp) => (
                      <TableRow key={gp.id}>
                        <TableCell sx={{ color: "#0284c7" }}>{gp.code}</TableCell>
                        <TableCell>{gp.englishName}</TableCell>
                      </TableRow>
                    ))}
                    {groupProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ color: "#64748b", py: 2 }}>
                          No products mapped to this group.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Bottom control buttons */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleOpenAddItem}
                  disabled={!selectedGroup}
                  sx={{
                    borderRadius: "8px",
                    borderColor: "#3b82f6",
                    color: "#2563eb",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Add Item
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/data-entry")}
                  sx={{
                    borderRadius: "8px",
                    bgcolor: "#475569",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#334155" },
                  }}
                >
                  Close
                </Button>
              </Box>
            </Box>

          </Box>
        </Box>
      </Paper>

      {/* Product Add/Edit Dialog */}
      <Dialog open={productModalOpen} onClose={() => setProductModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingProduct ? "Edit Product" : "Add Product"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Product Code"
            size="small"
            fullWidth
            value={productForm.code}
            onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
            disabled={!!editingProduct}
          />
          <TextField
            label="Marathi Name"
            size="small"
            fullWidth
            value={productForm.marathiName}
            onChange={(e) => setProductForm({ ...productForm, marathiName: e.target.value })}
          />
          <TextField
            label="English Name"
            size="small"
            fullWidth
            value={productForm.englishName}
            onChange={(e) => setProductForm({ ...productForm, englishName: e.target.value })}
          />
          <TextField
            label="Bharti Weight"
            size="small"
            type="number"
            fullWidth
            value={productForm.bhartiWeight}
            onChange={(e) => setProductForm({ ...productForm, bhartiWeight: parseFloat(e.target.value) || 0 })}
          />
          <TextField
            label="GST Item Code"
            size="small"
            fullWidth
            value={productForm.gstItemCode}
            onChange={(e) => setProductForm({ ...productForm, gstItemCode: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProductModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Expenses Group Modal */}
      <ExpensesGroupModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleSaveExpenseGroup}
        onDelete={handleDeleteExpenseGroup}
        initialData={editingExpenseGroup}
      />

      {/* Link Period Modal */}
      <Dialog open={linkPeriodOpen} onClose={() => setLinkPeriodOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Select Expense Period Group</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            label="Select Group"
            value={selectedPeriodToLink}
            onChange={(e) => setSelectedPeriodToLink(Number(e.target.value))}
          >
            {allExpenseGroups.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.rateCode} - {g.description}
              </MenuItem>
            ))}
            {allExpenseGroups.length === 0 && (
              <MenuItem disabled value="">
                No unlinked groups available. Click "Add new expenses Group" instead.
              </MenuItem>
            )}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLinkPeriodOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleLinkPeriod} variant="contained" color="primary" disabled={!selectedPeriodToLink}>
            Link Period
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={addItemOpen} onClose={() => setAddItemOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Product to selected Expense Group</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            label="Select Product"
            value={selectedProductToLink}
            onChange={(e) => setSelectedProductToLink(Number(e.target.value))}
          >
            {products
              .filter((p) => !groupProducts.some((gp) => gp.id === p.id))
              .map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.code} - {p.englishName}
                </MenuItem>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddItemOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleLinkProductToGroup} variant="contained" color="primary" disabled={!selectedProductToLink}>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
export default ProductEntryPage;
