import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";

type Firm = { code: string; name: string };

export function CreateUserPage() {
  const navigate = useNavigate();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirms, setSelectedFirms] = useState<string[]>([]);
  const [userCode, setUserCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleCode, setRoleCode] = useState("OPERATOR");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingFirms, setFetchingFirms] = useState(true);

  // Fetch available firms
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/firms");
        const list = (data.firms ?? []) as Firm[];
        setFirms(list);
        if (list.length > 0) {
          setSelectedFirms([list[0].code]);
        }
      } catch (err: any) {
        setError("Failed to load firms list");
      } finally {
        setFetchingFirms(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFirms.length === 0) {
      setError("Please select at least one Firm");
      return;
    }
    if (!userCode.trim()) {
      setError("User Code is required");
      return;
    }
    if (!fullName.trim()) {
      setError("Full Name is required");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/users", {
        firmCodes: selectedFirms,
        userCode: userCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        roleCode,
        password
      });
      setSuccess("User created successfully!");
      setTimeout(() => {
        navigate("/firm-selection");
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 text-foreground">
      <Card className="w-full max-w-[480px] shadow-lg border border-border">
        <CardHeader className="border-b border-border pb-4 mb-4">
          <CardTitle className="text-xl font-bold">Create User</CardTitle>
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
            {/* Firm Select Row */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0 pt-1">
                Select Firm(s)
              </label>
              <div className="flex-1 w-full">
                {fetchingFirms ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground py-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading firms...</span>
                  </div>
                ) : (
                  <div className="border border-input bg-background rounded-md p-2 max-h-[120px] overflow-y-auto space-y-1">
                    {firms.map((f) => (
                      <label
                        key={f.code}
                        className="flex items-center space-x-2 text-sm cursor-pointer p-1 rounded hover:bg-accent hover:text-accent-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFirms.includes(f.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFirms([...selectedFirms, f.code]);
                            } else {
                              setSelectedFirms(selectedFirms.filter((c) => c !== f.code));
                            }
                          }}
                          className="rounded border-input text-primary focus:ring-ring"
                        />
                        <span>{f.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User Code Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                User Code
              </label>
              <Input
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="e.g. USER01"
                className="flex-1"
              />
            </div>

            {/* Full Name Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Full Name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="flex-1"
              />
            </div>

            {/* Role Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Role
              </label>
              <Select
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
                className="flex-1"
              >
                <option value="ADMIN">Admin</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="OPERATOR">Operator</option>
              </Select>
            </div>

            {/* Password Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold text-muted-foreground w-full sm:w-[140px] shrink-0">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="flex-1"
              />
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
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
