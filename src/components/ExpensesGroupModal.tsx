import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

interface ExpensesGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: (id: number) => void;
  initialData?: any;
}

export function ExpensesGroupModal({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
}: ExpensesGroupModalProps) {
  const [formData, setFormData] = useState<any>({
    rateCode: "",
    description: "",
    validFrom: "",
    validTo: "",
    bhartiBag: 0,

    farmerCommPct: 0,
    farmerCessPct: 0,
    farmerSupFeePct: 0,
    farmerChargePct: 0,
    farmerVatPct: 0,
    farmerPackingChrg: 0,
    farmerRatePer: 1,
    farmerDetails: "Rate with Comm",

    customerCommPct: 0,
    customerCessPct: 0,
    customerSupFeePct: 0,
    customerChargePct: 0,
    customerVatPct: 0,
    customerPackingChrg: 0,
    customerRatePer: 1,
    customerDetails: "Cess on Comm.",

    hamaliOn: "Farmer",
    hamaliRs: 0,
    hamaliPer: 0,
    hamaliCustRs: 0,

    tolaiOn: "Farmer",
    tolaiRs: 0,
    tolaiPer: 0,
    tolaiCustRs: 0,

    bharaiOn: "Farmer",
    bharaiRs: 0,
    bharaiPer: 0,
    bharaiCustRs: 0,

    mapaiOn: "Farmer",
    mapaiRs: 0,
    mapaiPer: 0,
    mapaiCustRs: 0,

    octrioRate: 0,
    varaiRate: 0,
    packedInCrate: "Yes",
    crateExp: 0,

    farmerWeightDisc: 0,
    upToWeight: 0,
    moreThan: 0,
    discountWeight: 0,

    purchaseAc: "",
    saleAc: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        validFrom: initialData.validFrom || "",
        validTo: initialData.validTo || "",
      });
    } else {
      setFormData({
        rateCode: "",
        description: "",
        validFrom: new Date().toISOString().split("T")[0],
        validTo: "",
        bhartiBag: 0,
        farmerCommPct: 0,
        farmerCessPct: 0,
        farmerSupFeePct: 0,
        farmerChargePct: 0,
        farmerVatPct: 0,
        farmerPackingChrg: 0,
        farmerRatePer: 1,
        farmerDetails: "Rate with Comm",
        customerCommPct: 0,
        customerCessPct: 0,
        customerSupFeePct: 0,
        customerChargePct: 0,
        customerVatPct: 0,
        customerPackingChrg: 0,
        customerRatePer: 1,
        customerDetails: "Cess on Comm.",
        hamaliOn: "Farmer",
        hamaliRs: 0,
        hamaliPer: 0,
        hamaliCustRs: 0,
        tolaiOn: "Farmer",
        tolaiRs: 0,
        tolaiPer: 0,
        tolaiCustRs: 0,
        bharaiOn: "Farmer",
        bharaiRs: 0,
        bharaiPer: 0,
        bharaiCustRs: 0,
        mapaiOn: "Farmer",
        mapaiRs: 0,
        mapaiPer: 0,
        mapaiCustRs: 0,
        octrioRate: 0,
        varaiRate: 0,
        packedInCrate: "Yes",
        crateExp: 0,
        farmerWeightDisc: 0,
        upToWeight: 0,
        moreThan: 0,
        discountWeight: 0,
        purchaseAc: "",
        saleAc: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.rateCode.trim()) {
      alert("Rate Code is required");
      return;
    }
    if (!formData.description.trim()) {
      alert("Description is required");
      return;
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (initialData?.id && onDelete) {
      if (confirm("Are you sure you want to delete this expenses group?")) {
        onDelete(initialData.id);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-zinc-900 border border-border text-foreground">
        <DialogHeader className="border-b border-border pb-2">
          <DialogTitle className="text-lg font-bold text-primary">
            {initialData?.id ? "Edit expenses group" : "Add new expenses group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rate Code, Description, Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Rate Code</label>
              <Input
                value={formData.rateCode}
                onChange={(e) => handleChange("rateCode", e.target.value)}
                className="bg-background h-9"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50 h-9"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Valid From</label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleChange("validFrom", e.target.value)}
                className="bg-background h-9"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">to</label>
              <Input
                type="date"
                value={formData.validTo}
                onChange={(e) => handleChange("validTo", e.target.value)}
                className="bg-background h-9"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Bharati / Bag</label>
              <Input
                type="number"
                value={formData.bhartiBag}
                onChange={(e) => handleChange("bhartiBag", parseInt(e.target.value) || 0)}
                className="bg-background h-9"
              />
            </div>
          </div>

          {/* Farmer & Customer Commission Card */}
          <div className="border border-border rounded-xl p-4 bg-background space-y-3 shadow-sm overflow-x-auto">
            {/* Headers */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)_140px] gap-2 min-w-[800px] text-center text-xs font-bold text-muted-foreground uppercase tracking-wider pb-1">
              <div></div>
              <div>COMM%</div>
              <div>CESS%</div>
              <div>SUP FEE%</div>
              <div>CHARGE %</div>
              <div>VAT %</div>
              <div>PACKING CHRG</div>
              <div>RATE PER</div>
              <div>DETAILS</div>
            </div>

            {/* Farmer Row */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)_140px] gap-2 min-w-[800px] items-center">
              <span className="text-sm font-bold text-foreground">Farmer:</span>
              <Input type="number" step="any" value={formData.farmerCommPct} onChange={(e) => handleChange("farmerCommPct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.farmerCessPct} onChange={(e) => handleChange("farmerCessPct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.farmerSupFeePct} onChange={(e) => handleChange("farmerSupFeePct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.farmerChargePct} onChange={(e) => handleChange("farmerChargePct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.farmerVatPct} onChange={(e) => handleChange("farmerVatPct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.farmerPackingChrg} onChange={(e) => handleChange("farmerPackingChrg", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.farmerRatePer} onChange={(e) => handleChange("farmerRatePer", parseFloat(e.target.value) || 1)} className="h-8 py-1" />
              <Input value={formData.farmerDetails} onChange={(e) => handleChange("farmerDetails", e.target.value)} className="h-8 py-1" />
            </div>

            {/* Customer Row */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)_140px] gap-2 min-w-[800px] items-center">
              <span className="text-sm font-bold text-foreground">Customer:</span>
              <Input type="number" step="any" value={formData.customerCommPct} onChange={(e) => handleChange("customerCommPct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.customerCessPct} onChange={(e) => handleChange("customerCessPct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.customerSupFeePct} onChange={(e) => handleChange("customerSupFeePct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.customerChargePct} onChange={(e) => handleChange("customerChargePct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.customerVatPct} onChange={(e) => handleChange("customerVatPct", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.customerPackingChrg} onChange={(e) => handleChange("customerPackingChrg", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
              <Input type="number" step="any" value={formData.customerRatePer} onChange={(e) => handleChange("customerRatePer", parseFloat(e.target.value) || 1)} className="h-8 py-1" />
              <Input value={formData.customerDetails} onChange={(e) => handleChange("customerDetails", e.target.value)} className="h-8 py-1" />
            </div>
          </div>

          {/* Hamali, Tolai, Bharai, Mapai Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-3">
              <div className="grid grid-cols-[120px_140px_100px_100px_40px] gap-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div></div>
                <div>On</div>
                <div>Rs.</div>
                <div>per</div>
                <div></div>
              </div>

              {/* Hamali */}
              <div className="grid grid-cols-[120px_140px_100px_100px_40px] gap-2 items-center">
                <span className="text-sm font-semibold text-foreground">Hamali on:</span>
                <Select value={formData.hamaliOn} onChange={(e) => handleChange("hamaliOn", e.target.value)} className="h-8 py-0">
                  <option value="Farmer">Farmer</option>
                  <option value="Customer">Customer</option>
                  <option value="Both">Both</option>
                  <option value="None">None</option>
                </Select>
                <Input type="number" step="any" value={formData.hamaliRs} onChange={(e) => handleChange("hamaliRs", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
                <Input type="number" step="any" value={formData.hamaliPer} onChange={(e) => handleChange("hamaliPer", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
                <span className="text-xs text-muted-foreground font-semibold">Kg</span>
              </div>

              {/* Tolai */}
              <div className="grid grid-cols-[120px_140px_100px_100px_40px] gap-2 items-center">
                <span className="text-sm font-semibold text-foreground">Tolai on:</span>
                <Select value={formData.tolaiOn} onChange={(e) => handleChange("tolaiOn", e.target.value)} className="h-8 py-0">
                  <option value="Farmer">Farmer</option>
                  <option value="Customer">Customer</option>
                  <option value="Both">Both</option>
                  <option value="None">None</option>
                </Select>
                <Input type="number" step="any" value={formData.tolaiRs} onChange={(e) => handleChange("tolaiRs", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
                <Input type="number" step="any" value={formData.tolaiPer} onChange={(e) => handleChange("tolaiPer", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
                <span className="text-xs text-muted-foreground font-semibold">Kg</span>
              </div>

              {/* Bharai */}
              <div className="grid grid-cols-[120px_140px_100px_100px_40px] gap-2 items-center">
                <span className="text-sm font-semibold text-foreground">Bharai on:</span>
                <Select value={formData.bharaiOn} onChange={(e) => handleChange("bharaiOn", e.target.value)} className="h-8 py-0">
                  <option value="Farmer">Farmer</option>
                  <option value="Customer">Customer</option>
                  <option value="Both">Both</option>
                  <option value="None">None</option>
                </Select>
                <Input type="number" step="any" value={formData.bharaiRs} onChange={(e) => handleChange("bharaiRs", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
                <Input type="number" step="any" value={formData.bharaiPer} onChange={(e) => handleChange("bharaiPer", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
                <span className="text-xs text-muted-foreground font-semibold">Kg</span>
              </div>

              {/* Mapai */}
              <div className="grid grid-cols-[120px_140px_100px_100px_40px] gap-2 items-center">
                <span className="text-sm font-semibold text-foreground">Mapai On:</span>
                <Select value={formData.mapaiOn} onChange={(e) => handleChange("mapaiOn", e.target.value)} className="h-8 py-0">
                  <option value="Farmer">Farmer</option>
                  <option value="Customer">Customer</option>
                  <option value="Both">Both</option>
                  <option value="None">None</option>
                </Select>
                <Input type="number" step="any" value={formData.mapaiRs} onChange={(e) => handleChange("mapaiRs", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
                <Input type="number" step="any" value={formData.mapaiPer} onChange={(e) => handleChange("mapaiPer", parseFloat(e.target.value) || 0)} className="h-8 py-1" />
                <span className="text-xs text-muted-foreground font-semibold">Pcs</span>
              </div>
            </div>

            {/* Customer Rates Column */}
            <div className="flex flex-col items-center border border-border rounded-xl p-3 bg-background shadow-inner">
              <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Customer Rs.</span>
              <div className="space-y-3 w-full max-w-[120px]">
                <Input type="number" step="any" value={formData.hamaliCustRs} onChange={(e) => handleChange("hamaliCustRs", parseFloat(e.target.value) || 0)} className="h-8 py-1 text-center" />
                <Input type="number" step="any" value={formData.tolaiCustRs} onChange={(e) => handleChange("tolaiCustRs", parseFloat(e.target.value) || 0)} className="h-8 py-1 text-center" />
                <Input type="number" step="any" value={formData.bharaiCustRs} onChange={(e) => handleChange("bharaiCustRs", parseFloat(e.target.value) || 0)} className="h-8 py-1 text-center" />
                <Input type="number" step="any" value={formData.mapaiCustRs} onChange={(e) => handleChange("mapaiCustRs", parseFloat(e.target.value) || 0)} className="h-8 py-1 text-center" />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Octroi, Varai, Crate details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Octrio Rate</label>
              <Input type="number" step="any" value={formData.octrioRate} onChange={(e) => handleChange("octrioRate", parseFloat(e.target.value) || 0)} className="bg-background h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Varai Rate / 100 Kg</label>
              <Input type="number" step="any" value={formData.varaiRate} onChange={(e) => handleChange("varaiRate", parseFloat(e.target.value) || 0)} className="bg-background h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Packed in Crate?</label>
              <Select value={formData.packedInCrate} onChange={(e) => handleChange("packedInCrate", e.target.value)} className="bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/10 dark:border-yellow-900/40 h-9 py-0">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Crate Exp:</label>
              <Input type="number" step="any" value={formData.crateExp} onChange={(e) => handleChange("crateExp", parseFloat(e.target.value) || 0)} className="bg-background h-9" />
            </div>
          </div>

          {/* Farmer weight discount fields */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Farmer Weight Disc:</label>
              <Input type="number" step="any" value={formData.farmerWeightDisc} onChange={(e) => handleChange("farmerWeightDisc", parseFloat(e.target.value) || 0)} className="bg-background h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Up To Weight:</label>
              <Input type="number" step="any" value={formData.upToWeight} onChange={(e) => handleChange("upToWeight", parseFloat(e.target.value) || 0)} className="bg-background h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">More Than:</label>
              <Input type="number" step="any" value={formData.moreThan} onChange={(e) => handleChange("moreThan", parseFloat(e.target.value) || 0)} className="bg-background h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Discount Weight:</label>
              <Input type="number" step="any" value={formData.discountWeight} onChange={(e) => handleChange("discountWeight", parseFloat(e.target.value) || 0)} className="bg-background h-9" />
            </div>
          </div>

          {/* Accounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-muted-foreground">Purchase A/c</label>
              <Input value={formData.purchaseAc} onChange={(e) => handleChange("purchaseAc", e.target.value)} placeholder="Enter Purchase Account Name" className="bg-background h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-muted-foreground">Sale A/c</label>
              <Input value={formData.saleAc} onChange={(e) => handleChange("saleAc", e.target.value)} placeholder="Enter Sale Account Name" className="bg-background h-9" />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center border-t border-border pt-4 mt-2">
          <Button variant="outline" className="border-border bg-background mb-2 sm:mb-0">
            Customize Expenses
          </Button>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {initialData?.id && onDelete && (
              <Button variant="destructive" onClick={handleDelete} className="font-semibold bg-red-100 dark:bg-red-950/40 text-red-600 hover:bg-red-200">
                Delete
              </Button>
            )}
            <Button onClick={handleSave} className="font-semibold px-6">
              Save
            </Button>
            <Button variant="outline" onClick={onClose} className="border-border bg-background font-semibold">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
