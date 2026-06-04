import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            bgcolor: "#f3f6fc",
            color: "#1e293b",
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e2e8f0",
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e3a8a" }}>
            {initialData?.id ? "Edit expenses group" : "Add new expenses group"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#64748b" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mt: 1 }}>
          {/* Rate Code, Description, Dates */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Rate Code</Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.rateCode}
                onChange={(e) => handleChange("rateCode", e.target.value)}
                sx={{ bgcolor: "#fff" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3.6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Description</Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                sx={{ bgcolor: "#e0f2fe" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Valid From</Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleChange("validFrom", e.target.value)}
                sx={{ bgcolor: "#fff" }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>to</Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={formData.validTo}
                onChange={(e) => handleChange("validTo", e.target.value)}
                sx={{ bgcolor: "#fff" }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Bharati / Bag</Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={formData.bhartiBag}
                onChange={(e) => handleChange("bhartiBag", parseInt(e.target.value) || 0)}
                sx={{ bgcolor: "#fff" }}
              />
            </Grid>
          </Grid>

          {/* Farmer & Customer Commission Card */}
          <Box sx={{ border: "1px solid #cbd5e1", borderRadius: "12px", p: 2, bgcolor: "#fff", mb: 3 }}>
            {/* Headers */}
            <Box sx={{ display: "grid", gridTemplateColumns: "100px repeat(7, 1fr) 140px", gap: 1, mb: 1, textAlign: "center" }}>
              <Box></Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>COMM%</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>CESS%</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>SUP FEE%</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>CHARGE %</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>VAT %</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>PACKING CHRG</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>RATE PER</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>DETAILS</Typography>
            </Box>

            {/* Farmer Row */}
            <Box sx={{ display: "grid", gridTemplateColumns: "100px repeat(7, 1fr) 140px", gap: 1, alignItems: "center", mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Farmer:</Typography>
              <TextField size="small" type="number" value={formData.farmerCommPct} onChange={(e) => handleChange("farmerCommPct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.farmerCessPct} onChange={(e) => handleChange("farmerCessPct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.farmerSupFeePct} onChange={(e) => handleChange("farmerSupFeePct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.farmerChargePct} onChange={(e) => handleChange("farmerChargePct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.farmerVatPct} onChange={(e) => handleChange("farmerVatPct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.farmerPackingChrg} onChange={(e) => handleChange("farmerPackingChrg", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.farmerRatePer} onChange={(e) => handleChange("farmerRatePer", parseFloat(e.target.value) || 1)} />
              <TextField size="small" value={formData.farmerDetails} onChange={(e) => handleChange("farmerDetails", e.target.value)} />
            </Box>

            {/* Customer Row */}
            <Box sx={{ display: "grid", gridTemplateColumns: "100px repeat(7, 1fr) 140px", gap: 1, alignItems: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Customer:</Typography>
              <TextField size="small" type="number" value={formData.customerCommPct} onChange={(e) => handleChange("customerCommPct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.customerCessPct} onChange={(e) => handleChange("customerCessPct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.customerSupFeePct} onChange={(e) => handleChange("customerSupFeePct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.customerChargePct} onChange={(e) => handleChange("customerChargePct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.customerVatPct} onChange={(e) => handleChange("customerVatPct", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.customerPackingChrg} onChange={(e) => handleChange("customerPackingChrg", parseFloat(e.target.value) || 0)} />
              <TextField size="small" type="number" value={formData.customerRatePer} onChange={(e) => handleChange("customerRatePer", parseFloat(e.target.value) || 1)} />
              <TextField size="small" value={formData.customerDetails} onChange={(e) => handleChange("customerDetails", e.target.value)} />
            </Box>
          </Box>

          {/* Hamali, Tolai, Bharai, Mapai Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "100px 140px 100px 100px 40px", gap: 1, mb: 1 }}>
                <Box></Box>
                <Box></Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>Rs.</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>per</Typography>
                <Box></Box>
              </Box>

              {/* Hamali */}
              <Box sx={{ display: "grid", gridTemplateColumns: "100px 140px 100px 100px 40px", gap: 1, alignItems: "center", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Hamali on:</Typography>
                <TextField select size="small" value={formData.hamaliOn} onChange={(e) => handleChange("hamaliOn", e.target.value)}>
                  <MenuItem value="Farmer">Farmer</MenuItem>
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </TextField>
                <TextField size="small" type="number" value={formData.hamaliRs} onChange={(e) => handleChange("hamaliRs", parseFloat(e.target.value) || 0)} />
                <TextField size="small" type="number" value={formData.hamaliPer} onChange={(e) => handleChange("hamaliPer", parseFloat(e.target.value) || 0)} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>Kg</Typography>
              </Box>

              {/* Tolai */}
              <Box sx={{ display: "grid", gridTemplateColumns: "100px 140px 100px 100px 40px", gap: 1, alignItems: "center", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Tolai on:</Typography>
                <TextField select size="small" value={formData.tolaiOn} onChange={(e) => handleChange("tolaiOn", e.target.value)}>
                  <MenuItem value="Farmer">Farmer</MenuItem>
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </TextField>
                <TextField size="small" type="number" value={formData.tolaiRs} onChange={(e) => handleChange("tolaiRs", parseFloat(e.target.value) || 0)} />
                <TextField size="small" type="number" value={formData.tolaiPer} onChange={(e) => handleChange("tolaiPer", parseFloat(e.target.value) || 0)} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>Kg</Typography>
              </Box>

              {/* Bharai */}
              <Box sx={{ display: "grid", gridTemplateColumns: "100px 140px 100px 100px 40px", gap: 1, alignItems: "center", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Bharai on:</Typography>
                <TextField select size="small" value={formData.bharaiOn} onChange={(e) => handleChange("bharaiOn", e.target.value)}>
                  <MenuItem value="Farmer">Farmer</MenuItem>
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </TextField>
                <TextField size="small" type="number" value={formData.bharaiRs} onChange={(e) => handleChange("bharaiRs", parseFloat(e.target.value) || 0)} />
                <TextField size="small" type="number" value={formData.bharaiPer} onChange={(e) => handleChange("bharaiPer", parseFloat(e.target.value) || 0)} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>Kg</Typography>
              </Box>

              {/* Mapai */}
              <Box sx={{ display: "grid", gridTemplateColumns: "100px 140px 100px 100px 40px", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Mapai On:</Typography>
                <TextField select size="small" value={formData.mapaiOn} onChange={(e) => handleChange("mapaiOn", e.target.value)}>
                  <MenuItem value="Farmer">Farmer</MenuItem>
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </TextField>
                <TextField size="small" type="number" value={formData.mapaiRs} onChange={(e) => handleChange("mapaiRs", parseFloat(e.target.value) || 0)} />
                <TextField size="small" type="number" value={formData.mapaiPer} onChange={(e) => handleChange("mapaiPer", parseFloat(e.target.value) || 0)} />
                <Typography variant="body2" sx={{ color: "#64748b" }}>Pcs</Typography>
              </Box>
            </Grid>

            {/* Customer Rates Column */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e3b8b", mb: 1 }}>CUSTOMER</Typography>
                <TextField size="small" type="number" value={formData.hamaliCustRs} onChange={(e) => handleChange("hamaliCustRs", parseFloat(e.target.value) || 0)} sx={{ mb: 1, bgcolor: "#fff" }} />
                <TextField size="small" type="number" value={formData.tolaiCustRs} onChange={(e) => handleChange("tolaiCustRs", parseFloat(e.target.value) || 0)} sx={{ mb: 1, bgcolor: "#fff" }} />
                <TextField size="small" type="number" value={formData.bharaiCustRs} onChange={(e) => handleChange("bharaiCustRs", parseFloat(e.target.value) || 0)} sx={{ mb: 1, bgcolor: "#fff" }} />
                <TextField size="small" type="number" value={formData.mapaiCustRs} onChange={(e) => handleChange("mapaiCustRs", parseFloat(e.target.value) || 0)} sx={{ bgcolor: "#fff" }} />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Octroi, Varai, Crate details */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Octrio Rate</Typography>
              <TextField fullWidth size="small" type="number" value={formData.octrioRate} onChange={(e) => handleChange("octrioRate", parseFloat(e.target.value) || 0)} sx={{ bgcolor: "#fff" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Varai Rate / 100 Kg</Typography>
              <TextField fullWidth size="small" type="number" value={formData.varaiRate} onChange={(e) => handleChange("varaiRate", parseFloat(e.target.value) || 0)} sx={{ bgcolor: "#fff" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Packed in Crate?</Typography>
              <TextField fullWidth select size="small" value={formData.packedInCrate} onChange={(e) => handleChange("packedInCrate", e.target.value)} sx={{ bgcolor: "#fef08a" }}>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Crate Exp:</Typography>
              <TextField fullWidth size="small" type="number" value={formData.crateExp} onChange={(e) => handleChange("crateExp", parseFloat(e.target.value) || 0)} sx={{ bgcolor: "#fff" }} />
            </Grid>
          </Grid>

          {/* Farmer weight discount fields */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Farmer Weight Disc:</Typography>
              <TextField fullWidth size="small" type="number" value={formData.farmerWeightDisc} onChange={(e) => handleChange("farmerWeightDisc", parseFloat(e.target.value) || 0)} sx={{ bgcolor: "#fff" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Up To Weight:</Typography>
              <TextField fullWidth size="small" type="number" value={formData.upToWeight} onChange={(e) => handleChange("upToWeight", parseFloat(e.target.value) || 0)} sx={{ bgcolor: "#fff" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>More Than:</Typography>
              <TextField fullWidth size="small" type="number" value={formData.moreThan} onChange={(e) => handleChange("moreThan", parseFloat(e.target.value) || 0)} sx={{ bgcolor: "#fff" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Discount Weight:</Typography>
              <TextField fullWidth size="small" type="number" value={formData.discountWeight} onChange={(e) => handleChange("discountWeight", parseFloat(e.target.value) || 0)} sx={{ bgcolor: "#fff" }} />
            </Grid>
          </Grid>

          {/* Accounts */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Purchase A/c</Typography>
              <TextField fullWidth size="small" value={formData.purchaseAc} onChange={(e) => handleChange("purchaseAc", e.target.value)} sx={{ bgcolor: "#fff" }} placeholder="Enter Purchase Account Name" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Sale A/c</Typography>
              <TextField fullWidth size="small" value={formData.saleAc} onChange={(e) => handleChange("saleAc", e.target.value)} sx={{ bgcolor: "#fff" }} placeholder="Enter Sale Account Name" />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#fff", display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0" }}>
        <Button variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>
          Customize Exper
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          {initialData?.id && onDelete && (
            <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: "8px", textTransform: "none", bgcolor: "#fee2e2", color: "#ef4444", "&:hover": { bgcolor: "#fca5a5" } }}>
              Delete
            </Button>
          )}
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ borderRadius: "8px", textTransform: "none", bgcolor: "#1d4ed8", "&:hover": { bgcolor: "#1e40af" } }}>
            Save
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: "8px", textTransform: "none", color: "#475569", borderColor: "#cbd5e1" }}>
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
