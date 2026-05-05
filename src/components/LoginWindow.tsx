import { useState } from "react";
import type { FormEvent } from "react";

export function LoginWindow({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
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
        setError(data.error || "Login failed");
        return;
      }
      onLogin();
    } catch {
      setError("Login API unavailable. Start: npm run dbf:server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page" aria-label="Login page">
      <div className="login-card">
        <p className="login-badge">Aadt solution</p>
        <h1>Welcome back</h1>
        <p className="login-subtitle">Sign in to continue to your dashboard.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">User ID</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value.toUpperCase())} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
      </div>
    </main>
  );
}
