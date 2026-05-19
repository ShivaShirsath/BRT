import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, Box, Button, Checkbox, FormControlLabel, Link, Stack, TextField, Typography } from "@mui/material";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const signinSchema = z.object({ firmCode: z.string().min(1), userCode: z.string().min(1), password: z.string().min(1) });
const signupSchema = z.object({ firmCode: z.string().min(1), userCode: z.string().min(1), fullName: z.string().min(2), password: z.string().min(6) });

type SigninForm = { firmCode: string; userCode: string; password: string };
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

  const signin = useForm<SigninForm>({ defaultValues: { firmCode: "BRT01", userCode: "", password: "" } });
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
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, bgcolor: "#f5faff" }}>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          color: "#fff",
          background: "linear-gradient(113.274deg, #0A387D 7.3%, #297DD9 80.3%)",
          p: "120px 80px",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 56, lineHeight: 1 }}>BRT</Typography>
        <Typography sx={{ mt: 2, color: "#E3F2FF", fontSize: 32 }}>Built for reliable, fast access.</Typography>
      </Box>

      <Box sx={{ display: "grid", placeItems: "center", p: 3 }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
            bgcolor: "#fff",
            border: "1px solid #E3EBF7",
            borderRadius: "20px",
            boxShadow: "0 14px 32px rgba(15,41,79,0.12)",
            p: 4,
          }}
        >
          <Typography sx={{ color: "#17263D", fontWeight: 700, fontSize: 40 }}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </Typography>
          <Typography sx={{ color: "#637591", mt: 0.5, mb: 3, fontSize: 18 }}>
            {mode === "signin" ? "Sign in to continue" : "Sign up to start using BRT"}
          </Typography>

          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          {mode === "signin" ? (
            <Box component="form" onSubmit={signin.handleSubmit(handleSignin)}>
              <Stack spacing={2}>
                <TextField label="Firm Code" placeholder="BRT01" {...signin.register("firmCode")} />
                <TextField label="User Code" placeholder="ADMIN" {...signin.register("userCode")} />
                <TextField type="password" label="Password" placeholder="••••••••••" {...signin.register("password")} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <FormControlLabel control={<Checkbox />} label="Remember me" />
                  <Link underline="hover" sx={{ fontWeight: 600, fontSize: 14 }}>Forgot password?</Link>
                </Box>
                <Button type="submit" disabled={loading} variant="contained" sx={{ height: 56, borderRadius: "12px", fontSize: 18, textTransform: "none", bgcolor: "#125CD9" }}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={signup.handleSubmit(handleSignup)}>
              <Stack spacing={2}>
                <TextField label="Firm Code" placeholder="BRT01" {...signup.register("firmCode")} />
                <TextField label="User Code" placeholder="USER01" {...signup.register("userCode")} />
                <TextField label="Full Name" placeholder="John Doe" {...signup.register("fullName")} />
                <TextField type="password" label="Password" placeholder="Min 6 characters" {...signup.register("password")} />
                <Button type="submit" disabled={loading} variant="contained" sx={{ height: 56, borderRadius: "12px", fontSize: 18, textTransform: "none", bgcolor: "#125CD9" }}>
                  {loading ? "Creating..." : "Sign Up"}
                </Button>
              </Stack>
            </Box>
          )}

          <Typography sx={{ textAlign: "center", mt: 3, color: "#576982", fontSize: 14 }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <Link component="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} sx={{ fontWeight: 600 }}>
              {mode === "signin" ? "Sign up" : "Sign in"}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
