import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Box, FormControlLabel, Link, Stack, TextField } from "@mui/material";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

const signinSchema = z.object({ userCode: z.string().min(1), password: z.string().min(1) });
const signupSchema = z.object({ firmCode: z.string().min(1), userCode: z.string().min(1), fullName: z.string().min(2), password: z.string().min(6) });

type SigninForm = { userCode: string; password: string };
type SignupForm = { firmCode: string; userCode: string; fullName: string; password: string };

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) navigate("/firm-selection");
  }, [token, navigate]);

  const signin = useForm<SigninForm>({ defaultValues: { userCode: "", password: "" } });
  const signup = useForm<SignupForm>({ defaultValues: { firmCode: "BRT01", userCode: "", fullName: "", password: "" } });

  async function handleSignin(values: SigninForm) {
    const parsed = signinSchema.safeParse(values);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid signin values");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/signin", values);
      setAuth(data);
      navigate("/firm-selection");
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Signin failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(values: SignupForm) {
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid signup values");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/signup", values);
      setAuth(data);
      navigate("/firm-selection");
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background text-foreground">
      <div className="hidden md:flex flex-col justify-center bg-zinc-950 text-zinc-50 p-16 border-r border-zinc-900">
        <h1 className="text-6xl font-extrabold tracking-tight">BRT</h1>
        <p className="mt-4 text-2xl text-zinc-300">Built for reliable, fast access.</p>
      </div>

      <div className="grid place-items-center p-6">
        <Card className="w-full max-w-[440px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {mode === "signin" ? "Sign in to continue" : "Sign up to start using BRT"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {mode === "signin" ? (
              <Box component="form" onSubmit={signin.handleSubmit(handleSignin)}>
                <Stack spacing={2}>
                  <TextField label="User Code" placeholder="ADMIN" {...signin.register("userCode")} />
                  <TextField type="password" label="Password" placeholder="••••••••••" {...signin.register("password")} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <FormControlLabel control={<Checkbox />} label="Remember me" />
                    <Link underline="hover" sx={{ fontWeight: 600, fontSize: 14 }}>Forgot password?</Link>
                  </Box>
                  <Button type="submit" disabled={loading} className="w-full h-11">
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <form onSubmit={signup.handleSubmit(handleSignup)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Firm Code</label>
                  <Input placeholder="BRT01" {...signup.register("firmCode")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">User Code</label>
                  <Input placeholder="USER01" {...signup.register("userCode")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Full Name</label>
                  <Input placeholder="John Doe" {...signup.register("fullName")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Password</label>
                  <Input type="password" placeholder="Min 6 characters" {...signup.register("password")} />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11">
                  {loading ? "Creating..." : "Sign Up"}
                </Button>
              </form>
            )}

            <div className="text-center mt-4 text-sm text-muted-foreground">
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-semibold text-primary hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
