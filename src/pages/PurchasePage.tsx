import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useNetwork } from "../hooks/useNetwork";
import { z } from "zod";
import { ValidationErrorsDialog } from "../components/ValidationErrorsDialog";
import { useToastStore } from "../store/toastStore";
import { useBeforeUnload } from "../hooks/useBeforeUnload";
import { useViewport } from "../hooks/useViewport";
import { NavigationGuard } from "../components/NavigationGuard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Select } from "../components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { db } from "../lib/db";
import { AccountGenerationModal } from "../components/AccountGenerationModal";
import { useNavigate } from "react-router-dom";

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

function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function isValidDate(dateStr: string): boolean {
  const parts = dateStr.trim().split(".");
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  const dateObj = new Date(year, month, day);
  return dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === day;
}

const purchaseSchema = z.object({
  voucherNo: z.string().trim().min(1, "Voucher No. is required"),
  date: z.string()
    .trim()
    .min(1, "Date is required")
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, "Date must be in DD.MM.YYYY format")
    .refine(isValidDate, "Date must be a valid calendar date"),
  entryType: z.string()
    .trim()
    .min(1, "Please select a market entry type")
    .refine(val => val !== "Select market" && val.trim() !== "", "Please select a market entry type"),
  activeRows: z.array(
    z.object({
      index: z.number(),
      commodity: z.string().trim().min(1, "Commodity is required"),
    })
  ).min(1, "Add at least one item row"),
  netTotal: z.number().nonnegative("Net Total cannot be negative. Please adjust Discount, TDS, or other charges."),
});

export function PurchasePage() {
  const navigate = useNavigate();
  const selectedFirm = useAuthStore((s) => s.selectedFirm);
  const isOnline = useNetwork();
  const addToast = useToastStore((s) => s.addToast);
  const { viewportHeight } = useViewport();
  const defaultCrop = useThemeStore((s) => s.defaultCrop);
  const purchaseCharges = useThemeStore((s) => s.purchaseCharges);

  const [billNo, setBillNo] = useState("");
  const [billNoInput, setBillNoInput] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isLoadedFromDb, setIsLoadedFromDb] = useState(false);

  useBeforeUnload(isDirty);

  const [purchaseId, setPurchaseId] = useState<string>(() => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });
  const [pendingBillNo, setPendingBillNo] = useState("");

  const [date, setDate] = useState(getTodayDateString());
  const [entryType, setEntryType] = useState("Select market");
  const [cessCondition, setCessCondition] = useState("Order");
  const [farmer, setFarmer] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [partyBillNo, setPartyBillNo] = useState("");
  const [rows, setRows] = useState<PurchaseItemRow[]>(Array.from({ length: 2 }, () => mkRow()));
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);

  useEffect(() => {
    if (defaultCrop) {
      setRows((prev) => {
        if (prev[0] && !prev[0].commodity && !prev[0].mark && !prev[0].brand && !prev[0].bags) {
          return prev.map((r, idx) => idx === 0 ? { ...r, commodity: defaultCrop } : r);
        }
        return prev;
      });
    }
  }, [defaultCrop]);

  useEffect(() => {
    if (!isLoadedFromDb && purchaseCharges && Object.keys(purchaseCharges).length > 0) {
      setCharges((prev) => {
        return Object.fromEntries(chargeFields.map((f) => [
          f,
          f === "Purchase amt." ? prev[f] : (purchaseCharges[f] ?? "0.00")
        ]));
      });
    }
  }, [purchaseCharges, isLoadedFromDb]);

  const [note, setNote] = useState("");
  const [print, setPrint] = useState(false);
  const [billReceived, setBillReceived] = useState("No");
  const [lockState, setLockState] = useState("No");
  const [charges, setCharges] = useState<Record<string, string>>(() => {
    const storeCharges = useThemeStore.getState().purchaseCharges;
    return Object.fromEntries(chargeFields.map((f) => [
      f,
      f === "Purchase amt." ? "0.00" : (storeCharges[f] ?? "0.00")
    ]));
  });

  const [showBillNoDropdown, setShowBillNoDropdown] = useState(false);
  const [allBills, setAllBills] = useState<any[]>([]);
  const [pastVehicles, setPastVehicles] = useState<string[]>([]);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCommodityRowIndex, setActiveCommodityRowIndex] = useState<number | null>(null);
  const [commodityDropdownCoords, setCommodityDropdownCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const fetchAllBills = async () => {
    try {
      let billsList: any[] = [];
      if (isOnline) {
        const { data } = await api.get("/purchase/all");
        if (data && data.rows) {
          billsList = data.rows.map((r: any) => ({ ...r, synced: true }));
        }
      } else {
        const offlinePurchases = await db.purchases.toArray();
        billsList = offlinePurchases.map((p) => ({
          id: p.id,
          billNo: p.billNo,
          date: p.billDate ? p.billDate : "",
          amount: p.charges?.netTotal ?? 0,
          synced: p.synced
        }));
      }
      setAllBills(billsList);

      // Auto-precede bill number if not already set or loaded
      let maxNum = -1;
      let maxStr = "";
      for (const b of billsList) {
        const numStr = b.billNo || "";
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
          maxStr = numStr;
        }
      }
      const nextBill = maxNum !== -1
        ? String(maxNum + 1).padStart(maxStr.length || 6, "0")
        : "000001";

      setBillNo((prev) => prev ? prev : nextBill);
      setBillNoInput((prev) => prev ? prev : nextBill);
    } catch (err) {
      console.error("Failed to load purchase bills", err);
    }
  };

  useEffect(() => {
    fetchAllBills();
  }, [isOnline]);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get("/customers");
      setCustomers(data || []);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [isOnline]);

  useEffect(() => {
    if (farmer && customers.length > 0 && !selectedCustomerId) {
      const idNum = Number(farmer);
      if (!isNaN(idNum)) {
        const found = customers.find(c => c.id === idNum);
        if (found) {
          setFarmer(found.name);
          setSelectedCustomerId(found.id);
        }
      }
    }
  }, [farmer, customers, selectedCustomerId]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const { data } = await api.get("/purchase/vehicles");
        setPastVehicles(data || []);
      } catch (err) {
        console.error("Failed to load past vehicles", err);
        try {
          const purchases = await db.purchases.toArray();
          const sales = await db.sales.toArray();
          const vehicles = new Set<string>();
          purchases.forEach(p => {
            if (p.vehicleNo && p.vehicleNo.trim() && p.vehicleNo.trim() !== "--") {
              vehicles.add(p.vehicleNo.trim());
            }
          });
          sales.forEach(s => {
            if (s.payload && s.payload.vehicleNo && s.payload.vehicleNo.trim() && s.payload.vehicleNo.trim() !== "--") {
              vehicles.add(s.payload.vehicleNo.trim());
            }
          });
          setPastVehicles(Array.from(vehicles));
        } catch (offlineErr) {
          console.error("Offline vehicle load failed", offlineErr);
        }
      }
    };
    const loadProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    loadVehicles();
    loadProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setActiveCommodityRowIndex(null);
    };
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
  const setFarmerDirty = (val: string) => {
    setFarmer(val);
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

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
      return prev.filter((_, i) => i !== selectedRowIndex);
    });
    setSelectedRowIndex((i) => Math.max(0, i - 1));
    setIsDirty(true);
  }

  function toIsoDate(ddmmyyyy: string) {
    const p = ddmmyyyy.split(".");
    if (p.length !== 3) return new Date().toISOString().slice(0, 10);
    return `${p[2]}-${p[1]}-${p[0]}`;
  }

  function parseNumber(val: any): number {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  }

  function sanitizeNumeric(val: string): string {
    let cleaned = val.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  }

  function sanitizeInteger(val: string): string {
    return val.replace(/[^0-9]/g, "");
  }

  const total = useMemo(() => {
    return rows.reduce((sum, r) => sum + parseNumber(r.netWt) * parseNumber(r.rate), 0);
  }, [rows]);

  const netTotal = useMemo(() => {
    let sum = total;
    const additionFields = [
      "M. Tax", "Commission", "Pur. Comm", "Freight", "Packing", "Loading", "Leivy",
      "Tolai", "Hamali", "Discount", "IGST", "SGST", "CGST", "Khandani", "Our expenses", "Exp. 2", "Exp. 3", "Exp. 4"
    ];
    additionFields.forEach((f) => {
      sum += parseNumber(charges[f]);
    });
    sum -= parseNumber(charges["Discount"]);
    sum -= parseNumber(charges["TDS"]);
    return sum;
  }, [total, charges]);

  async function onSave() {
    setError("");
    setMessage("");

    const activeRows = rows.filter((r) => r.commodity.trim() || parseNumber(r.netWt) > 0 || parseNumber(r.rate) > 0);
    const dataToValidate = {
      voucherNo: billNoInput,
      date,
      entryType,
      activeRows: activeRows.map((r, i) => ({
        index: i + 1,
        commodity: r.commodity,
      })),
      netTotal,
    };

    const validationResult = purchaseSchema.safeParse(dataToValidate);
    if (!validationResult.success) {
      const errMsgs = validationResult.error.issues.map((err) => {
        if (err.path[0] === "activeRows" && typeof err.path[1] === "number") {
          const rowIndex = dataToValidate.activeRows[err.path[1]].index;
          const fieldName = err.path[2];
          if (fieldName === "commodity") {
            return `Row ${rowIndex}: Commodity is required`;
          }
        }
        return err.message;
      });
      setValidationErrors(errMsgs);
      setValidationDialogOpen(true);
      errMsgs.forEach(msg => addToast(msg, "error"));
      return;
    }

    const items = activeRows.map((r) => ({
      commodity: r.commodity.trim(),
      mark: r.mark.trim(),
      brand: r.brand.trim(),
      bags: r.bags.trim(),
      avgWeight: parseNumber(r.avgWt),
      purchaseWeight: parseNumber(r.purWt),
      packingWeight: parseNumber(r.packingWeight),
      netWeight: parseNumber(r.netWt),
      rate: parseNumber(r.rate),
      amount: parseNumber(r.netWt) * parseNumber(r.rate),
    }));

    const parsedFarmerId = selectedCustomerId ?? (/^\d+$/.test(farmer.trim()) ? Number(farmer.trim()) : null);

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
      chargesPayload[apiField] = uiField === "Purchase amt." ? total : parseNumber(charges[uiField]);
    }

    setLoading(true);
    try {
      const payload = {
        id: purchaseId,
        voucherNo: billNo,
        businessDate: toIsoDate(date),
        entryType,
        cessCondition,
        sellerId: parsedFarmerId,
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
      if (data.offline) {
        addToast(`Purchase saved offline (pending sync). ID: ${data.id}`, "info");
        setMessage(`Purchase saved offline (pending sync). ID: ${data.id}`);
      } else {
        addToast(`Purchase saved successfully. ID: ${data.id}`, "success");
        setMessage(`Purchase saved successfully. ID: ${data.id}`);
      }
      setIsDirty(false);
      fetchAllBills();

      const num = parseInt(billNo, 10);
      let nextBill = billNo;
      if (!isNaN(num)) {
        nextBill = String(num + 1).padStart(billNo.length, "0");
      }
      resetForm(nextBill);
    } catch (e: any) {
      const errMsg = e?.response?.data?.error ?? "Failed to save purchase";
      setError(errMsg);
      addToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  function resetForm(keepBillNo: string = "") {
    setIsLoadedFromDb(false);
    setPurchaseId(
      typeof window !== "undefined" && window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })
    );
    let targetBillNo = keepBillNo;
    if (!targetBillNo) {
      let maxNum = -1;
      let maxStr = "";
      for (const b of allBills) {
        const numStr = b.billNo || "";
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
          maxStr = numStr;
        }
      }
      targetBillNo = maxNum !== -1
        ? String(maxNum + 1).padStart(maxStr.length || 6, "0")
        : "000001";
    }
    setBillNoInput(targetBillNo);
    setBillNo(targetBillNo);
    setDate(getTodayDateString());
    setEntryType("Select market");
    setCessCondition("Order");
    setFarmer("");
    setSelectedCustomerId(null);
    setVehicleNo("");
    setPartyBillNo("");
    const initialRows = Array.from({ length: 2 }, () => mkRow());
    if (defaultCrop) {
      initialRows[0].commodity = defaultCrop;
    }
    setRows(initialRows);
    setNote("");
    setCharges(Object.fromEntries(chargeFields.map((f) => [
      f,
      f === "Purchase amt." ? "0.00" : (purchaseCharges[f] ?? "0.00")
    ])));
    setIsDirty(false);
    setMessage("");
    setError("");
  }

  const handleCreateCustomer = async (formData: any) => {
    try {
      const { data } = await api.post("/customers", formData);
      setCustomers((prev) => [...prev, data]);
      setFarmer(data.name);
      setSelectedCustomerId(data.id);
      setIsDirty(true);
      setIsCustomerModalOpen(false);
      setMessage(`Account created successfully for ${data.name}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create customer account");
    }
  };

  const handleBillNoChange = (newVal: string) => {
    if (isDirty) {
      setPendingBillNo(newVal);
      setConfirmDialogOpen(true);
    } else {
      setBillNo(newVal.trim());
      setBillNoInput(newVal.trim());
    }
  };

  const handleConfirmSave = async () => {
    setConfirmDialogOpen(false);
    await onSave();
    if (pendingBillNo) {
      setBillNo(pendingBillNo.trim());
      setBillNoInput(pendingBillNo.trim());
      setPendingBillNo("");
    }
  };

  const handleConfirmDiscard = () => {
    setConfirmDialogOpen(false);
    setIsDirty(false);
    if (pendingBillNo) {
      setBillNo(pendingBillNo.trim());
      setBillNoInput(pendingBillNo.trim());
      setPendingBillNo("");
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialogOpen(false);
    setBillNoInput(billNo);
    setPendingBillNo("");
  };

  async function checkExistingBill(num: string) {
    if (!num.trim()) {
      resetForm();
      return;
    }
    try {
      const { data } = await api.get(`/purchase/by-bill-no/${num.trim()}`);
      if (data && data.id) {
        setIsLoadedFromDb(true);
        setPurchaseId(data.id);
        setBillNo(data.billNo || data.voucherNo || "");
        setBillNoInput(data.billNo || data.voucherNo || "");
        setEntryType(data.entryType || "Select market");
        setCessCondition(data.cessCondition || "Order");
        setFarmer(data.sellerId ? String(data.sellerId) : "");
        setSelectedCustomerId(data.sellerId || null);
        setVehicleNo(data.vehicleNo && data.vehicleNo !== "--" ? data.vehicleNo : "");
        setPartyBillNo(data.partyBillNo && data.partyBillNo !== "--" ? data.partyBillNo : "");
        setNote(data.note || "");

        if (data.businessDate) {
          const parts = data.businessDate.split("-");
          if (parts.length === 3) {
            setDate(`${parts[2]}.${parts[1]}.${parts[0]}`);
          } else {
            setDate(data.businessDate);
          }
        }

        if (data.items && data.items.length > 0) {
          const mappedRows = data.items.map((it: any) => ({
            commodity: it.commodity || "",
            mark: it.mark || "",
            brand: it.brand || "",
            bags: it.bags || "",
            avgWt: it.avgWeight ? String(it.avgWeight) : "",
            purWt: it.purchaseWeight ? String(it.purchaseWeight) : "",
            packingWeight: it.packingWeight ? String(it.packingWeight) : "",
            netWt: it.netWeight ? String(it.netWeight) : "",
            rate: it.rate ? String(it.rate) : "",
          }));
          while (mappedRows.length < 2) {
            mappedRows.push(mkRow());
          }
          setRows(mappedRows);
        } else {
          setRows(Array.from({ length: 2 }, () => mkRow()));
        }

        if (data.charges) {
          const loadedCharges: Record<string, string> = {};
          const chargesMapReverse: Record<string, string> = {
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

        setMessage(`Loaded details for Bill no. ${data.billNo || data.voucherNo}`);
        setError("");
        setIsDirty(false);
      } else {
        resetForm(num);
      }
    } catch (e: any) {
      console.error("Failed to fetch existing bill details", e);
      resetForm(num);
    }
  }

  useEffect(() => {
    if (billNo) {
      checkExistingBill(billNo);
    }
  }, [billNo]);

  const pickerValue = (() => {
    const parts = date.split(".");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      if (year.length === 4 && !isNaN(Number(day)) && !isNaN(Number(month)) && !isNaN(Number(year))) {
        return `${year}-${month}-${day}`;
      }
    }
    return "";
  })();

  return (
    <div className="bg-background text-foreground flex flex-col transition-[height] duration-300 ease-out overflow-hidden" style={{ height: viewportHeight }}>
      <NavigationGuard isDirty={isDirty} />
      <header className="sticky top-0 z-40 shrink-0 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 text-card-foreground shadow-sm py-4 px-6 flex justify-between items-center relative">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Purchase Bill Entry</h1>
        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-background text-xs font-semibold shadow-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-destructive animate-pulse"}`} />
          <span className="text-muted-foreground">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-semibold">
          <span>{selectedFirm?.name || "BRT Trading Co."}</span>
          <span>›</span>
          <span>Data Entry</span>
          <span>›</span>
          <span>Purchase Bill Entry</span>
        </div>

        {message && (
          <Alert variant="success">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="p-4 border-b flex flex-row justify-between items-center h-14">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Bill Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-slate-500">Bill no.</label>
              <Input
                value={billNoInput}
                readOnly
                onFocus={() => setShowBillNoDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowBillNoDropdown(false), 200);
                }}
                className="w-full bg-slate-50 cursor-not-allowed font-mono"
                placeholder="Auto-generated"
              />
              {showBillNoDropdown && (
                <div className="absolute z-[100] w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {allBills.map((b) => (
                    <div
                      key={b.id}
                      onMouseDown={() => {
                        handleBillNoChange(b.billNo);
                        setShowBillNoDropdown(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex justify-between items-center"
                    >
                      <span className="font-semibold">{b.billNo}</span>
                      <span className="text-xs text-muted-foreground">{b.date}</span>
                    </div>
                  ))}
                  {allBills.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                      No matching bills found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <div className="relative flex items-center">
                <Input
                  value={date}
                  onChange={(e) => setDateDirty(e.target.value)}
                  placeholder="DD.MM.YYYY"
                  className="pr-10"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-muted-foreground">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <input
                    type="date"
                    value={pickerValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const parts = val.split("-");
                        if (parts.length === 3) {
                          setDateDirty(`${parts[2]}.${parts[1]}.${parts[0]}`);
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Entry Type</label>
              <Select value={entryType} onChange={(e) => setEntryTypeDirty(e.target.value)}>
                <option value="Select market">Select market</option>
                <option value="Market A">Market A</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Cess Condition</label>
              <Select value={cessCondition} onChange={(e) => setCessConditionDirty(e.target.value)}>
                <option value="Order">Order</option>
                <option value="Direct">Direct</option>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2 relative">
              <label className="text-xs font-semibold text-slate-500">Farmer</label>
              <Input
                value={farmer}
                onChange={(e) => {
                  setFarmerDirty(e.target.value);
                  setSelectedCustomerId(null);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowCustomerDropdown(false), 200);
                }}
                placeholder="Search Farmer"
              />
              {showCustomerDropdown && (
                <div className="absolute z-[100] w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {customers
                    .filter((c) =>
                      c.name && c.name.toLowerCase().includes(farmer.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        onMouseDown={() => {
                          setFarmer(c.name);
                          setSelectedCustomerId(c.id);
                          setIsDirty(true);
                          setShowCustomerDropdown(false);
                        }}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        {c.name}
                      </div>
                    ))}
                  <div
                    onMouseDown={() => {
                      setIsCustomerModalOpen(true);
                      setShowCustomerDropdown(false);
                    }}
                    className="px-3 py-2 text-sm font-semibold text-primary cursor-pointer hover:bg-accent border-t"
                  >
                    + Add New Farmer
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-slate-500">Vehicle No.</label>
              <Input
                value={vehicleNo}
                onChange={(e) => {
                  setVehicleNoDirty(e.target.value);
                  setShowVehicleDropdown(true);
                }}
                onFocus={() => setShowVehicleDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowVehicleDropdown(false), 200);
                }}
                placeholder="e.g., MH-12-AB-1234"
              />
              {showVehicleDropdown && (
                <div className="absolute z-[100] w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-40 overflow-y-auto">
                  {pastVehicles
                    .filter((v) =>
                      v.toLowerCase().includes(vehicleNo.toLowerCase())
                    )
                    .map((v) => (
                      <div
                        key={v}
                        onMouseDown={() => {
                          setVehicleNo(v);
                          setIsDirty(true);
                          setShowVehicleDropdown(false);
                        }}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        {v}
                      </div>
                    ))}
                  {pastVehicles.filter((v) => v.toLowerCase().includes(vehicleNo.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                      No matching vehicles
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Party Bill No.</label>
              <Input
                value={partyBillNo}
                onChange={(e) => setPartyBillNoDirty(e.target.value)}
                placeholder="e.g., PB/2025/001"
              />
            </div>
          </CardContent>
        </Card>        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          {/* Items Card (60% proportion) */}
          <div className="lg:col-span-6">
            <Card>
              <CardHeader className="p-4 border-b flex flex-row justify-between items-center h-14">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Items</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={addRow} className="h-7 px-2.5 text-xs">+ Add row</Button>
                  <Button variant="outline" size="sm" onClick={removeSelectedRow} className="h-7 px-2.5 text-xs">Remove</Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Commodity</TableHead>
                        <TableHead>Mark</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="w-20">Qty</TableHead>
                        <TableHead className="w-24">Avg. Wt.</TableHead>
                        <TableHead className="w-24">Pur. Wt.</TableHead>
                        <TableHead className="w-32">Packing Weight</TableHead>
                        <TableHead className="w-24">Net Wt.</TableHead>
                        <TableHead className="w-24">Rate</TableHead>
                        <TableHead className="w-32 text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r, rowIndex) => {
                        const amount = (parseNumber(r.netWt) * parseNumber(r.rate)).toFixed(2);
                        const active = selectedRowIndex === rowIndex;
                        return (
                          <TableRow
                            key={rowIndex}
                            onClick={() => setSelectedRowIndex(rowIndex)}
                            className={active ? "bg-muted/50" : ""}
                          >
                            <TableCell className="text-center font-medium">{rowIndex + 1}</TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.commodity}
                                onChange={(e) => setCell(rowIndex, "commodity", e.target.value)}
                                onFocus={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setCommodityDropdownCoords({
                                    top: rect.bottom,
                                    left: rect.left,
                                    width: rect.width,
                                  });
                                  setActiveCommodityRowIndex(rowIndex);
                                }}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setCommodityDropdownCoords({
                                    top: rect.bottom,
                                    left: rect.left,
                                    width: rect.width,
                                  });
                                  setActiveCommodityRowIndex(rowIndex);
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setActiveCommodityRowIndex(null);
                                    setRows((prev) => {
                                      return prev.map((row, idx) => {
                                        if (idx === rowIndex) {
                                          const trimmed = row.commodity.trim().toLowerCase();
                                          if (!trimmed) return row;
                                          const matched = products.find(
                                            (p) => p.englishName?.toLowerCase() === trimmed
                                          );
                                          if (!matched) {
                                            return { ...row, commodity: "" };
                                          } else {
                                            return { ...row, commodity: matched.englishName };
                                          }
                                        }
                                        return row;
                                      });
                                    });
                                  }, 200);
                                }}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                                placeholder="e.g., Onion"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.mark}
                                onChange={(e) => setCell(rowIndex, "mark", e.target.value)}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                                placeholder="e.g., A1"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.brand}
                                onChange={(e) => setCell(rowIndex, "brand", e.target.value)}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none"
                                placeholder="e.g., Best"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.bags}
                                onChange={(e) => setCell(rowIndex, "bags", sanitizeInteger(e.target.value))}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.avgWt}
                                onChange={(e) => setCell(rowIndex, "avgWt", sanitizeNumeric(e.target.value))}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.purWt}
                                onChange={(e) => setCell(rowIndex, "purWt", sanitizeNumeric(e.target.value))}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.packingWeight}
                                onChange={(e) => setCell(rowIndex, "packingWeight", sanitizeNumeric(e.target.value))}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.netWt}
                                onChange={(e) => setCell(rowIndex, "netWt", sanitizeNumeric(e.target.value))}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                              />
                            </TableCell>
                            <TableCell className="p-1">
                              <input
                                value={r.rate}
                                onChange={(e) => setCell(rowIndex, "rate", sanitizeNumeric(e.target.value))}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm outline-none font-mono"
                              />
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-semibold">{amount}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <Input
                  value={note}
                  onChange={(e) => setNoteDirty(e.target.value)}
                  placeholder="Add details/note..."
                  className="bg-slate-100 dark:bg-slate-900 border-0"
                />
              </CardContent>
            </Card>
          </div>

          {/* Charges & Taxes Card (40% proportion) */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader className="p-4 border-b flex flex-row justify-between items-center h-14">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Charges & Taxes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {chargeFields.map((f) => (
                    <div key={f} className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wide text-slate-500 block truncate" title={f}>{f}</label>
                      <Input
                        value={f === "Purchase amt." ? total.toFixed(2) : charges[f]}
                        readOnly
                        className="h-8 text-xs font-mono bg-slate-50 cursor-not-allowed text-slate-600"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col space-y-2 border-t pt-4 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="font-mono text-slate-700">₹ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#1e3a8a] border-t border-dashed pt-2.5">
                    <span className="font-bold text-sm">Net Total Payable:</span>
                    <span className="font-mono text-base font-extrabold">₹ {netTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-40 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t py-4 px-6 mb-0">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
              <Checkbox checked={print} onChange={(e) => setPrint(e.target.checked)} />
              <span>Print</span>
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Bill received?</span>
              <Select value={billReceived} onChange={(e) => setBillReceived(e.target.value)} className="w-24 h-9">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Lock?</span>
              <Select value={lockState} onChange={(e) => setLockState(e.target.value)} className="w-24 h-9">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">Delete</Button>
            <Button onClick={onSave} disabled={loading} className="flex-1 sm:flex-none">
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/data-entry")} className="flex-1 sm:flex-none">Close</Button>
          </div>
        </div>
      </main>

      <Dialog open={confirmDialogOpen} onOpenChange={(val) => { if (!val) handleConfirmCancel(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">Unsaved Changes</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              You have unsaved changes in this purchase entry. Would you like to save them before changing the bill number?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={handleConfirmCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDiscard}>
              Discard Changes
            </Button>
            <Button onClick={handleConfirmSave}>
              Save & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ValidationErrorsDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        errors={validationErrors}
      />

      <AccountGenerationModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleCreateCustomer}
        initialData={{ name: farmer }}
      />

      {activeCommodityRowIndex !== null && commodityDropdownCoords && createPortal(
        <div
          className="fixed z-[9999] bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto"
          style={{
            top: `${commodityDropdownCoords.top}px`,
            left: `${commodityDropdownCoords.left}px`,
            width: `${commodityDropdownCoords.width}px`,
          }}
        >
          {products
            .filter((p) => {
              const currentVal = rows[activeCommodityRowIndex]?.commodity || "";
              if (!currentVal.trim()) return true;
              const isExactMatch = products.some(
                (prod) => prod.englishName?.toLowerCase() === currentVal.toLowerCase()
              );
              if (isExactMatch) return true;
              return (p.englishName && p.englishName.toLowerCase().includes(currentVal.toLowerCase())) ||
                     (p.marathiName && p.marathiName.toLowerCase().includes(currentVal.toLowerCase()));
            })
            .map((p) => (
              <div
                key={p.id}
                onMouseDown={() => {
                  setCell(activeCommodityRowIndex, "commodity", p.englishName);
                  setActiveCommodityRowIndex(null);
                }}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground text-left"
              >
                {p.englishName} {p.marathiName ? `(${p.marathiName})` : ""}
              </div>
            ))}
          {products.filter((p) => {
            const currentVal = rows[activeCommodityRowIndex]?.commodity || "";
            if (!currentVal.trim()) return true;
            const isExactMatch = products.some(
              (prod) => prod.englishName?.toLowerCase() === currentVal.toLowerCase()
            );
            if (isExactMatch) return true;
            return (p.englishName && p.englishName.toLowerCase().includes(currentVal.toLowerCase())) ||
                   (p.marathiName && p.marathiName.toLowerCase().includes(currentVal.toLowerCase()));
          }).length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              No matching products
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
