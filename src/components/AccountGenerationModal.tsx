import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface AccountGenerationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export function AccountGenerationModal({
  open,
  onClose,
  onSave,
  initialData,
}: AccountGenerationModalProps) {
  const [tabValue, setTabValue] = useState(0);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    category: "B",
    englishName: "",
    shortName: "",
    accountType: "Customer",
    openingBalance: 0,
    openingBalanceType: "D",
    firmAccountNo: "",
    groupName: "Current Liabilities",
    userGroup: "",
    locationType: "LOCAL",
    locationState: "Maharashtra",
    packingCharges: 0,
    levy: "",
    sawangadiNo: "",
    // Personal Details
    address: "",
    email: "",
    city: "",
    zone: "",
    taluka: "",
    dist: "",
    pin: "",
    phone: "",
    stateName: "",
    mobileNo: "",
    mobile2nd: "",
    aadharNo: "",
    panNo: "",
    licenseNo: "",
    tinNo: "",
    discountPercentage: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
      });
    } else {
      setFormData({
        name: "",
        category: "B",
        englishName: "",
        shortName: "",
        accountType: "Customer",
        openingBalance: 0,
        openingBalanceType: "D",
        firmAccountNo: "",
        groupName: "Current Liabilities",
        userGroup: "",
        locationType: "LOCAL",
        locationState: "Maharashtra",
        packingCharges: 0,
        levy: "",
        sawangadiNo: "",
        address: "",
        email: "",
        city: "",
        zone: "",
        taluka: "",
        dist: "",
        pin: "",
        phone: "",
        stateName: "",
        mobileNo: "",
        mobile2nd: "",
        aadharNo: "",
        panNo: "",
        licenseNo: "",
        tinNo: "",
        discountPercentage: 0,
      });
    }
    setTabValue(0);
  }, [initialData, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          bgcolor: "#f4f7fc",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          bgcolor: "#1a73e8",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          On-Line Account Generation
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mt: 1 }}>
          {/* Main Grid Fields */}
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                size="small"
                label="Name"
                placeholder="Enter Account Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="English Name"
                value={formData.englishName}
                onChange={(e) => handleChange("englishName", e.target.value)}
              />
            </Grid>

            <Grid item xs={8}>
              <TextField
                fullWidth
                size="small"
                label="Short Name"
                value={formData.shortName}
                onChange={(e) => handleChange("shortName", e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="A/c Type"
                value={formData.accountType}
                onChange={(e) => handleChange("accountType", e.target.value)}
              >
                <MenuItem value="Customer">Customer</MenuItem>
                <MenuItem value="Supplier">Supplier</MenuItem>
                <MenuItem value="Bank">Bank</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Op. Balance"
                value={formData.openingBalance}
                onChange={(e) => handleChange("openingBalance", Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Dr/Cr"
                value={formData.openingBalanceType}
                onChange={(e) => handleChange("openingBalanceType", e.target.value)}
              >
                <MenuItem value="D">Debit (D)</MenuItem>
                <MenuItem value="C">Credit (C)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                label="A/c for firm no."
                value={formData.firmAccountNo}
                onChange={(e) => handleChange("firmAccountNo", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                select
                label="Group"
                value={formData.groupName}
                onChange={(e) => handleChange("groupName", e.target.value)}
              >
                <MenuItem value="Current Liabilities">Current Liabilities</MenuItem>
                <MenuItem value="Current Assets">Current Assets</MenuItem>
                <MenuItem value="Customer Accounts">Customer Accounts</MenuItem>
                <MenuItem value="Supplier Accounts">Supplier Accounts</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="User Group"
                value={formData.userGroup}
                onChange={(e) => handleChange("userGroup", e.target.value)}
              >
                <MenuItem value="">Select User Group</MenuItem>
                <MenuItem value="Retail">Retail</MenuItem>
                <MenuItem value="Wholesale">Wholesale</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Location Type"
                value={formData.locationType}
                onChange={(e) => handleChange("locationType", e.target.value)}
              >
                <MenuItem value="LOCAL">LOCAL</MenuItem>
                <MenuItem value="OUTSTATION">OUTSTATION</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Location State"
                value={formData.locationState}
                onChange={(e) => handleChange("locationState", e.target.value)}
              >
                <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                <MenuItem value="Gujarat">Gujarat</MenuItem>
                <MenuItem value="Karnataka">Karnataka</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Packing Charges"
                value={formData.packingCharges}
                onChange={(e) => handleChange("packingCharges", Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                select
                label="Levy"
                value={formData.levy}
                onChange={(e) => handleChange("levy", e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Sawangadi No."
                value={formData.sawangadiNo}
                onChange={(e) => handleChange("sawangadiNo", e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Tabs Section */}
          <Box sx={{ mt: 3, borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable">
              <Tab label="Personal Details" />
              <Tab label="Other Details" />
              <Tab label="RTGS Details" />
              <Tab label="Note" />
              <Tab label="GST, VAT, TIN, & CST" />
            </Tabs>
          </Box>

          {/* Personal Details Tab Content */}
          {tabValue === 0 && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="Address"
                    placeholder="Enter Full Address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    label="E-Mail"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Zone"
                    value={formData.zone}
                    onChange={(e) => handleChange("zone", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Taluka"
                    value={formData.taluka}
                    onChange={(e) => handleChange("taluka", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Dist."
                    value={formData.dist}
                    onChange={(e) => handleChange("dist", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pin"
                    value={formData.pin}
                    onChange={(e) => handleChange("pin", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Phone (O)"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="State Name"
                    value={formData.stateName}
                    onChange={(e) => handleChange("stateName", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mobile No."
                    value={formData.mobileNo}
                    onChange={(e) => handleChange("mobileNo", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mobile 2nd"
                    value={formData.mobile2nd}
                    onChange={(e) => handleChange("mobile2nd", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Aadhar No."
                    value={formData.aadharNo}
                    onChange={(e) => handleChange("aadharNo", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="PAN No."
                    value={formData.panNo}
                    onChange={(e) => handleChange("panNo", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="License No."
                    value={formData.licenseNo}
                    onChange={(e) => handleChange("licenseNo", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="TIN No."
                    value={formData.tinNo}
                    onChange={(e) => handleChange("tinNo", e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Discount %"
                    value={formData.discountPercentage}
                    onChange={(e) => handleChange("discountPercentage", Number(e.target.value))}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue > 0 && (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                Additional Details and Settings for {formData.name || "this account"}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
        <Typography variant="caption" sx={{ color: "#d93025", fontWeight: 700 }}>
          UserId
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: "none", borderRadius: "8px", px: 3 }}
          >
            Return
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ textTransform: "none", borderRadius: "8px", px: 3 }}
          >
            Generate
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
