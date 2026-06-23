import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";

export function CreateFirmPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logo, setLogo] = useState("");
  const [bookStartDate, setBookStartDate] = useState("01.04.2026");
  const [businessType, setBusinessType] = useState("Trader");
  const [financialYear, setFinancialYear] = useState("2026-27");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to convert dd.MM.yyyy to yyyy-MM-dd ISO format
  function toIsoDate(ddmmyyyy: string) {
    const parts = ddmmyyyy.trim().split(".");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return ddmmyyyy; // fallback if already ISO or formatted otherwise
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Firm Name is required");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const isoDate = toIsoDate(bookStartDate);
      await api.post("/firms", {
        name: name.trim(),
        bookStartDate: isoDate,
        businessType,
        financialYear,
        displayName: displayName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        logo
      });
      setSuccess("Firm created successfully!");
      setTimeout(() => {
        navigate("/firm-selection");
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to create firm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 text-foreground">
      <Card className="w-full max-w-[480px] shadow-lg border border-border">
        <CardHeader className="border-b border-border pb-4 mb-4">
          <CardTitle className="text-xl font-bold">Create Firm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Firm Name Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Firm Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter firm name"
                className="flex-1"
              />
            </div>

            {/* Display Name Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Display Name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name / business name"
                className="flex-1"
              />
            </div>

            {/* Address Row */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0 pt-2">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter business address"
                rows={2}
                className="flex-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Phone Number Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Phone Number
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="flex-1"
              />
            </div>

            {/* Logo Row */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0 pt-1">
                Firm Logo
              </label>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-input file:text-xs file:font-semibold file:bg-background file:text-foreground hover:file:bg-accent cursor-pointer"
                />
                {logo && (
                  <div className="relative w-16 h-16 border rounded bg-white flex items-center justify-center p-1">
                    <img src={logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Book Start Date Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Book Start Date
              </label>
              <Input
                value={bookStartDate}
                onChange={(e) => setBookStartDate(e.target.value)}
                placeholder="DD.MM.YYYY"
                className="flex-1"
              />
            </div>

            {/* Business Type Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Business Type
              </label>
              <Select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="flex-1"
              >
                <option value="Trader">Trader</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Retailer">Retailer</option>
                <option value="Broker">Broker</option>
              </Select>
            </div>

            {/* Financial Year Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Financial Year
              </label>
              <Select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="flex-1"
              >
                <option value="2026-27">2026-27</option>
                <option value="2025-26">2025-26</option>
                <option value="2027-28">2027-28</option>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/firm-selection")}
                disabled={loading}
              >
                Return
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[110px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Firm"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
