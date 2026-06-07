import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>+</div>
          <div>
            <div style={S.logoTitle}>MedCore</div>
            <div style={S.logoSub}>Healthcare Management</div>
          </div>
        </div>

        <h2 style={S.heading}>Welcome back</h2>
        <p style={S.sub}>Sign in to your account</p>

        {error && <div style={S.error}>{error}</div>}

        <div style={S.field}>
          <label style={S.label}>Email Address</label>
          <input
            style={S.input} type="email" placeholder="doctor@hospital.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div style={S.field}>
          <label style={S.label}>Password</label>
          <input
            style={S.input} type="password" placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, color: "#8b949e", fontSize: 14 }}>
          No account? <Link to="/register" style={{ color: "#00c9a7" }}>Register here</Link>
        </p>

        {/* Demo credentials */}
        <div style={S.demo}>
          <div style={{ color: "#8b949e", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>DEMO ACCOUNTS</div>
          {[
            { role: "Admin",   email: "admin@medcore.com",   pass: "admin123" },
            { role: "Doctor",  email: "doctor@medcore.com",  pass: "doctor123" },
            { role: "Patient", email: "patient@medcore.com", pass: "patient123" },
          ].map((d) => (
            <div key={d.role} style={S.demoRow}
              onClick={() => setForm({ email: d.email, password: d.pass })}>
              <span style={S.demoRole}>{d.role}</span>
              <span style={{ color: "#8b949e" }}>{d.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", padding: 20 },
  card: { background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: 40, width: "100%", maxWidth: 420 },
  logo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32 },
  logoIcon: { width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #00c9a7, #4e8cff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700 },
  logoTitle: { fontWeight: 700, fontSize: 18, color: "#fff" },
  logoSub: { fontSize: 12, color: "#8b949e" },
  heading: { color: "#fff", margin: "0 0 6px", fontSize: 24, fontWeight: 700 },
  sub: { color: "#8b949e", margin: "0 0 24px", fontSize: 14 },
  error: { background: "#ff6b6b20", border: "1px solid #ff6b6b40", color: "#ff6b6b", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 },
  field: { marginBottom: 16 },
  label: { display: "block", color: "#8b949e", fontSize: 13, fontWeight: 500, marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, color: "#e6edf3", fontSize: 14, outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: "12px", background: "linear-gradient(135deg, #00c9a7, #4e8cff)", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  demo: { marginTop: 24, background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: 14 },
  demoRow: { display: "flex", gap: 12, alignItems: "center", padding: "6px 0", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #21262d10" },
  demoRole: { background: "#00c9a720", color: "#00c9a7", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, minWidth: 52, textAlign: "center" },
};
