import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { ExpensesGroupModal } from "../components/ExpensesGroupModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";


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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 text-foreground">
      {/* Outer Card Panel */}
      <div className="max-w-[1400px] mx-auto rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-border shadow-lg flex flex-col">
        {/* Header Title */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Product Entry</h1>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] p-6 gap-6">
          
          {/* Left Column: Product Master List */}
          <div className="flex flex-col gap-4">
            <div className="overflow-auto border border-border rounded-lg bg-background max-h-[500px]">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-bold">Code</TableHead>
                    <TableHead className="font-bold">Marathi Name</TableHead>
                    <TableHead className="font-bold">English Name</TableHead>
                    <TableHead className="text-right font-bold">Bharti Wt.</TableHead>
                    <TableHead className="font-bold">GST Item Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <TableRow
                        key={p.id}
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
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"
                        }`}
                      >
                        <TableCell className="font-semibold text-primary">{p.code}</TableCell>
                        <TableCell>{p.marathiName}</TableCell>
                        <TableCell>{p.englishName}</TableCell>
                        <TableCell className="text-right">{p.bhartiWeight.toFixed(2)}</TableCell>
                        <TableCell>{p.gstItemCode}</TableCell>
                      </TableRow>
                    );
                  })}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No products available. Click Add to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Product Control Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleOpenAddProduct} className="px-6 font-semibold">
                Add
              </Button>
              <Button
                variant="destructive"
                disabled={!selectedProduct}
                onClick={handleDeleteProduct}
                className="px-6 font-semibold"
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Right Column: Expense Group & Items */}
          <div className="flex flex-col gap-6">
            
            {/* Expense Periods List */}
            <div className="flex flex-col gap-4">
              <h2 className="text-md font-bold text-foreground">
                {selectedProduct ? `${selectedProduct.code} - ${selectedProduct.englishName}` : "No Product Selected"}
              </h2>

              <div className="overflow-auto border border-border rounded-lg bg-background max-h-[220px]">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="font-bold">Description</TableHead>
                      <TableHead className="font-bold">Valid From</TableHead>
                      <TableHead className="font-bold">Valid up to</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseGroups.map((g) => {
                      const isSelected = selectedGroup?.id === g.id;
                      return (
                        <TableRow
                          key={g.id}
                          onClick={() => setSelectedGroup(g)}
                          onDoubleClick={() => {
                            setEditingExpenseGroup(g);
                            setExpenseModalOpen(true);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"
                          }`}
                        >
                          <TableCell className="font-semibold text-primary">{g.description}</TableCell>
                          <TableCell>{g.validFrom}</TableCell>
                          <TableCell>{g.validTo || ". ."}</TableCell>
                        </TableRow>
                      );
                    })}
                    {expenseGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                          No expense periods configured.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Group Period buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleOpenAddExpenseGroup}
                  disabled={!selectedProduct}
                  className="font-medium bg-background border-border"
                >
                  Add new expenses Group
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOpenLinkPeriod}
                  disabled={!selectedProduct}
                  className="font-medium bg-background border-border"
                >
                  New Period
                </Button>
              </div>
            </div>

            {/* Item List for Selected Expense Group */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                ITEM LIST FOR SELECTED EXPENSES GROUP
              </h3>

              <div className="overflow-auto border border-border rounded-lg bg-background max-h-[200px]">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="font-bold">Code</TableHead>
                      <TableHead className="font-bold">Product Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupProducts.map((gp) => (
                      <TableRow key={gp.id}>
                        <TableCell className="font-semibold text-primary">{gp.code}</TableCell>
                        <TableCell>{gp.englishName}</TableCell>
                      </TableRow>
                    ))}
                    {groupProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                          No products mapped to this group.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Bottom control buttons */}
              <div className="flex justify-end gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={handleOpenAddItem}
                  disabled={!selectedGroup}
                  className="font-semibold border-primary/30 text-primary hover:bg-primary/5 bg-background"
                >
                  Add Item
                </Button>
                <Button
                  onClick={() => navigate("/data-entry")}
                  className="font-semibold bg-slate-600 hover:bg-slate-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Product Add/Edit Dialog */}
      <Dialog open={productModalOpen} onOpenChange={(val) => !val && setProductModalOpen(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground">Product Code</label>
              <Input
                value={productForm.code}
                onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                disabled={!!editingProduct}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground">Marathi Name</label>
              <Input
                value={productForm.marathiName}
                onChange={(e) => setProductForm({ ...productForm, marathiName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground">English Name</label>
              <Input
                value={productForm.englishName}
                onChange={(e) => setProductForm({ ...productForm, englishName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground">Bharti Weight</label>
              <Input
                type="number"
                value={productForm.bhartiWeight}
                onChange={(e) => setProductForm({ ...productForm, bhartiWeight: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground">GST Item Code</label>
              <Input
                value={productForm.gstItemCode}
                onChange={(e) => setProductForm({ ...productForm, gstItemCode: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
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
      <Dialog open={linkPeriodOpen} onOpenChange={(val) => !val && setLinkPeriodOpen(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Select Expense Period Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground">Select Group</label>
              <Select
                value={selectedPeriodToLink}
                onChange={(e) => setSelectedPeriodToLink(Number(e.target.value))}
              >
                <option value="">Select Group</option>
                {allExpenseGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.rateCode} - {g.description}
                  </option>
                ))}
              </Select>
              {allExpenseGroups.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  No unlinked groups available. Click "Add new expenses Group" instead.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkPeriodOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkPeriod} disabled={!selectedPeriodToLink}>
              Link Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={addItemOpen} onOpenChange={(val) => !val && setAddItemOpen(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Product to selected Expense Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground">Select Product</label>
              <Select
                value={selectedProductToLink}
                onChange={(e) => setSelectedProductToLink(Number(e.target.value))}
              >
                <option value="">Select Product</option>
                {products
                  .filter((p) => !groupProducts.some((gp) => gp.id === p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.englishName}
                    </option>
                  ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkProductToGroup} disabled={!selectedProductToLink}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
export default ProductEntryPage;
