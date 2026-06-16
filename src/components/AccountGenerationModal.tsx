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
import { useToastStore } from "../store/toastStore";

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
  const addToast = useToastStore((s) => s.addToast);

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
    // Other Details
    guarantor: "",
    creditAmt: 0,
    creditDays: 0,
    mst: "",
    cst: "",
    eccNo: "",
    range: "",
    division: "",
    collector: "",
    patiCode: "",
    marriageDate: "",
    dob: "",
    monthlyWages: 0,
    gst: "",
    // RTGS Details
    rtgsIfsc: "",
    rtgsBankName: "",
    rtgsBranchName: "",
    rtgsLocation: "",
    rtgsAcNo: "",
    rtgsAcType: "",
    rtgsAcNoConfirm: "",
    rtgsFormNo: "",
    rtgsFormat: "",
    rtgsReport: "",
    note: "",
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
        guarantor: "",
        creditAmt: 0,
        creditDays: 0,
        mst: "",
        cst: "",
        eccNo: "",
        range: "",
        division: "",
        collector: "",
        patiCode: "",
        marriageDate: "",
        dob: "",
        monthlyWages: 0,
        gst: "",
        rtgsIfsc: "",
        rtgsBankName: "",
        rtgsBranchName: "",
        rtgsLocation: "",
        rtgsAcNo: "",
        rtgsAcType: "",
        rtgsAcNoConfirm: "",
        rtgsFormNo: "",
        rtgsFormat: "",
        rtgsReport: "",
        note: "",
      });
    }
    setTabValue(0);
  }, [initialData, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      addToast("Account Name is required", "error");
      return;
    }
    onSave(formData);
  };

  const isInvalid = !formData.name.trim();

  const tabs = ["Personal Details", "Other Details", "RTGS Details", "Note"];

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-zinc-900 border border-border text-foreground">
        <DialogHeader className="border-b border-border pb-2 bg-primary px-6 py-4 -mx-6 -mt-6 rounded-t-lg">
          <DialogTitle className="text-lg font-bold text-primary-foreground">
            On-Line Account Generation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Grid Fields */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Name</label>
              <Input
                placeholder="e.g., John Doe Trading Co."
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <Select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Select>
            </div>

            <div className="md:col-span-12 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">English Name</label>
              <Input
                placeholder="e.g., John Doe"
                value={formData.englishName}
                onChange={(e) => handleChange("englishName", e.target.value)}
              />
            </div>

            <div className="md:col-span-8 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Short Name</label>
              <Input
                placeholder="e.g., JDT"
                value={formData.shortName}
                onChange={(e) => handleChange("shortName", e.target.value)}
              />
            </div>
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">A/c Type</label>
              <Select
                value={formData.accountType}
                onChange={(e) => handleChange("accountType", e.target.value)}
              >
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
              </Select>
            </div>

            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Op. Balance</label>
              <Input
                type="number"
                value={formData.openingBalance}
                onChange={(e) => handleChange("openingBalance", Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Dr/Cr</label>
              <Select
                value={formData.openingBalanceType}
                onChange={(e) => handleChange("openingBalanceType", e.target.value)}
              >
                <option value="D">Debit (D)</option>
                <option value="C">Credit (C)</option>
              </Select>
            </div>
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">A/c for firm no.</label>
              <Input
                value={formData.firmAccountNo}
                onChange={(e) => handleChange("firmAccountNo", e.target.value)}
              />
            </div>

            <div className="md:col-span-12 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Group</label>
              <Select
                value={formData.groupName}
                onChange={(e) => handleChange("groupName", e.target.value)}
              >
                <option value="Current Liabilities">Current Liabilities</option>
                <option value="Current Assets">Current Assets</option>
                <option value="Customer Accounts">Customer Accounts</option>
                <option value="Supplier Accounts">Supplier Accounts</option>
              </Select>
            </div>

            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">User Group</label>
              <Select
                value={formData.userGroup}
                onChange={(e) => handleChange("userGroup", e.target.value)}
              >
                <option value="">Select User Group</option>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
              </Select>
            </div>
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Location Type</label>
              <Select
                value={formData.locationType}
                onChange={(e) => handleChange("locationType", e.target.value)}
              >
                <option value="LOCAL">LOCAL</option>
                <option value="OUTSTATION">OUTSTATION</option>
              </Select>
            </div>
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Location State</label>
              <Select
                value={formData.locationState}
                onChange={(e) => handleChange("locationState", e.target.value)}
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
              </Select>
            </div>

            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Packing Charges</label>
              <Input
                type="number"
                value={formData.packingCharges}
                onChange={(e) => handleChange("packingCharges", Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Levy</label>
              <Select
                value={formData.levy}
                onChange={(e) => handleChange("levy", e.target.value)}
              >
                <option value="">None</option>
                <option value="Standard">Standard</option>
              </Select>
            </div>

            <div className="md:col-span-12 flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Sawangadi No.</label>
              <Input
                value={formData.sawangadiNo}
                onChange={(e) => handleChange("sawangadiNo", e.target.value)}
              />
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-6 border-b border-border">
            <div className="flex space-x-1 overflow-x-auto pb-1">
              {tabs.map((tab, idx) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTabValue(idx)}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    tabValue === idx
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Details Tab Content */}
          {tabValue === 0 && (
            <div className="py-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Address</label>
                  <textarea
                    rows={2}
                    placeholder="Enter Full Address"
                    value={formData.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">E-Mail</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Zone</label>
                  <Input
                    value={formData.zone}
                    onChange={(e) => handleChange("zone", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Taluka</label>
                  <Input
                    value={formData.taluka}
                    onChange={(e) => handleChange("taluka", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Dist.</label>
                  <Input
                    value={formData.dist}
                    onChange={(e) => handleChange("dist", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Pin</label>
                  <Input
                    value={formData.pin}
                    onChange={(e) => handleChange("pin", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Phone (O)</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">State Name</label>
                  <Input
                    value={formData.stateName}
                    onChange={(e) => handleChange("stateName", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Mobile No.</label>
                  <Input
                    value={formData.mobileNo}
                    onChange={(e) => handleChange("mobileNo", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Mobile 2nd</label>
                  <Input
                    value={formData.mobile2nd}
                    onChange={(e) => handleChange("mobile2nd", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Aadhar No.</label>
                  <Input
                    value={formData.aadharNo}
                    onChange={(e) => handleChange("aadharNo", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">PAN No.</label>
                  <Input
                    value={formData.panNo}
                    onChange={(e) => handleChange("panNo", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">License No.</label>
                  <Input
                    value={formData.licenseNo}
                    onChange={(e) => handleChange("licenseNo", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">TIN No.</label>
                  <Input
                    value={formData.tinNo}
                    onChange={(e) => handleChange("tinNo", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Discount %</label>
                  <Input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => handleChange("discountPercentage", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {tabValue === 1 && (
            <div className="py-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Guarantor</label>
                  <Input
                    value={formData.guarantor}
                    onChange={(e) => handleChange("guarantor", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Pati Code</label>
                  <Input
                    value={formData.patiCode}
                    onChange={(e) => handleChange("patiCode", e.target.value)}
                  />
                </div>

                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Credit Amt.</label>
                  <Input
                    type="number"
                    value={formData.creditAmt}
                    onChange={(e) => handleChange("creditAmt", Number(e.target.value))}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Credit Days</label>
                  <Input
                    type="number"
                    value={formData.creditDays}
                    onChange={(e) => handleChange("creditDays", Number(e.target.value))}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Marriage Date</label>
                  <Input
                    type="date"
                    value={formData.marriageDate || ""}
                    onChange={(e) => handleChange("marriageDate", e.target.value)}
                  />
                </div>

                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">License</label>
                  <Input
                    value={formData.licenseNo}
                    onChange={(e) => handleChange("licenseNo", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dob || ""}
                    onChange={(e) => handleChange("dob", e.target.value)}
                  />
                </div>

                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">GST</label>
                  <Input
                    value={formData.gst}
                    onChange={(e) => handleChange("gst", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Monthly Wages</label>
                  <Input
                    type="number"
                    value={formData.monthlyWages}
                    onChange={(e) => handleChange("monthlyWages", Number(e.target.value))}
                  />
                </div>

                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">MST</label>
                  <Input
                    value={formData.mst}
                    onChange={(e) => handleChange("mst", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4"></div>

                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">CST</label>
                  <Input
                    value={formData.cst}
                    onChange={(e) => handleChange("cst", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4"></div>

                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">ECC No.</label>
                  <Input
                    value={formData.eccNo}
                    onChange={(e) => handleChange("eccNo", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4"></div>

                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Range</label>
                  <Input
                    value={formData.range}
                    onChange={(e) => handleChange("range", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4"></div>

                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Division</label>
                  <Input
                    value={formData.division}
                    onChange={(e) => handleChange("division", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4"></div>

                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Collector</label>
                  <Input
                    value={formData.collector}
                    onChange={(e) => handleChange("collector", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4"></div>
              </div>
            </div>
          )}

          {tabValue === 2 && (
            <div className="py-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">IFSC Code</label>
                  <Input
                    value={formData.rtgsIfsc}
                    onChange={(e) => handleChange("rtgsIfsc", e.target.value)}
                  />
                </div>
                <div className="md:col-span-4 flex items-end">
                  <Button variant="secondary" className="w-full h-10 font-semibold">
                    Get Bank
                  </Button>
                </div>

                <div className="md:col-span-12 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Bank Name</label>
                  <Input
                    value={formData.rtgsBankName}
                    onChange={(e) => handleChange("rtgsBankName", e.target.value)}
                  />
                </div>

                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Branch Name</label>
                  <Input
                    value={formData.rtgsBranchName}
                    onChange={(e) => handleChange("rtgsBranchName", e.target.value)}
                  />
                </div>
                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Location</label>
                  <Input
                    value={formData.rtgsLocation}
                    onChange={(e) => handleChange("rtgsLocation", e.target.value)}
                  />
                </div>

                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">A/C No</label>
                  <Input
                    value={formData.rtgsAcNo}
                    onChange={(e) => handleChange("rtgsAcNo", e.target.value)}
                  />
                </div>
                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">A/C Type</label>
                  <Input
                    value={formData.rtgsAcType}
                    onChange={(e) => handleChange("rtgsAcType", e.target.value)}
                  />
                </div>

                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">A/C No Conform</label>
                  <Input
                    value={formData.rtgsAcNoConfirm}
                    onChange={(e) => handleChange("rtgsAcNoConfirm", e.target.value)}
                  />
                </div>
                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Form No.</label>
                  <Input
                    value={formData.rtgsFormNo}
                    onChange={(e) => handleChange("rtgsFormNo", e.target.value)}
                  />
                </div>

                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">RTGS Format</label>
                  <Select
                    value={formData.rtgsFormat}
                    onChange={(e) => handleChange("rtgsFormat", e.target.value)}
                  >
                    <option value="">Select Format</option>
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                  </Select>
                </div>
                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">RTGS Report</label>
                  <Input
                    value={formData.rtgsReport}
                    onChange={(e) => handleChange("rtgsReport", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {tabValue === 3 && (
            <div className="py-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-muted-foreground">Note</label>
              <textarea
                rows={4}
                placeholder="Enter general notes or comments here..."
                value={formData.note || ""}
                onChange={(e) => handleChange("note", e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center border-t border-border pt-4 mt-2">
          <span className="text-xs font-bold text-red-600 tracking-wider">
            UserId
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border bg-background font-semibold"
            >
              Return
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isInvalid}
              className="font-semibold px-6"
            >
              Generate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
