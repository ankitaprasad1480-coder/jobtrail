import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Blobs from "../components/Blobs";

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "up") {
        await api("/auth/register", { method: "POST", body: { email, password } });
      }
      const { access_token } = await api("/auth/login", { method: "POST", body: { email, password } });
      localStorage.setItem("token", access_token);
      try {
        await api("/profile");
        nav("/jobs");
      } catch {
        nav("/profile");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside className="blobwrap login-art" style={{ flex: "1.05", background: "var(--acc2)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 34, minWidth: 0 }}>
        <Blobs variant="login" />
        <h1 style={{ fontSize: 28, lineHeight: 1.2, maxWidth: 300 }}>Find work that actually fits you.</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "10px 0 0", maxWidth: 300 }}>
          Jobs from startups to global companies, matched to your skills and salary range.
        </p>
      </aside>

      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18, marginBottom: 22 }}>
            <i style={{ width: 30, height: 30, borderRadius: 9, background: "var(--acc)", display: "grid", placeItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="18" height="13" rx="3" />
                <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
            </i>
            JobTrail
          </div>

          <div style={{ display: "flex", background: "var(--acc2)", borderRadius: 12, padding: 4, marginBottom: 18 }}>
            {["in", "up"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1, border: "none", background: mode === m ? "var(--surface)" : "transparent",
                  color: mode === m ? "var(--text)" : "var(--muted)", padding: 9, borderRadius: 9,
                  fontWeight: 600, fontSize: 13, cursor: "pointer", marginTop: 0,
                  boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                }}
              >
                {m === "in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2>{mode === "up" ? "Create your account" : "Welcome back"}</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 6px" }}>
            {mode === "up" ? "Takes less than a minute. Free." : "Sign in to see your matched jobs."}
          </p>

          <form onSubmit={submit}>
            {mode === "up" && (
              <>
                <label>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </>
            )}
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Please wait..." : mode === "up" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 14, textAlign: "center" }}>
            {mode === "in" ? (
              <>New here? <button type="button" className="link" onClick={() => setMode("up")}>Create a free account</button></>
            ) : (
              <>Already registered? <button type="button" className="link" onClick={() => setMode("in")}>Sign in</button></>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}