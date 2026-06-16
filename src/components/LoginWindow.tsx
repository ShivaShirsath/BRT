import { useState } from "react";
import type { FormEvent } from "react";
import { useToastStore } from "../store/toastStore";

export function LoginWindow({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      addToast("Please enter both User ID and Password", "error");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:4001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: email,
          password,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        const errMsg = data.error || "Login failed";
        setError(errMsg);
        addToast(errMsg, "error");
        return;
      }
      addToast("Successfully logged in", "success");
      onLogin();
    } catch {
      const errMsg = "Login API unavailable. Start: npm run dbf:server";
      setError(errMsg);
      addToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  const isFormInvalid = !email.trim() || !password.trim();

  return (
    <main className="login-page" aria-label="Login page">
      <div className="login-card">
        <p className="login-badge">Aadt solution</p>
        <h1>Welcome back</h1>
        <p className="login-subtitle">Sign in to continue to your dashboard.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">User ID</label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toUpperCase())}
            placeholder="e.g., ADMIN"
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          {error ? <p className="error-text">{error}</p> : null}
          <button
            type="submit"
            disabled={loading || isFormInvalid}
            className={isFormInvalid ? "opacity-50 cursor-not-allowed" : ""}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
