import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "patient",
    phone: "", age: "", gender: "Male", bloodGroup: "O+",
    address: "", condition: "General",
    specialization: "", experience: "", qualification: "", department: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const user = await register(form);
      // ✅ Role ke hisaab se redirect
      if (user.role === "patient") navigate("/my-dashboard");
      else if (user.role === "doctor") navigate("/doctor-dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const F = (label, key, type = "text", placeholder = "") => (
    <div style={S.field} key={key}>
      <label style={S.label}>{label}</label>
      <input style={S.input} type={type} placeholder={placeholder}
        value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>+</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>MedCore</div>
            <div style={{ fontSize: 12, color: "#8b949e" }}>Create Account</div>
          </div>
        </div>

        {error && <div style={S.error}>{error}</div>}

        {/* Role Selector */}
        <div style={S.field}>
          <label style={S.label}>Register As</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["patient", "doctor"].map((r) => (
              <button key={r} onClick={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer",
                  border: form.role === r ? "2px solid #00c9a7" : "1px solid #30363d",
                  background: form.role === r ? "#00c9a720" : "#0d1117",
                  color: form.role === r ? "#00c9a7" : "#8b949e",
                  fontWeight: form.role === r ? 700 : 400, fontSize: 13,
                  textTransform: "capitalize",
                }}>
                {r === "patient" ? "🧑" : r === "doctor" ? "👨‍⚕️" : "⚙️"} {r}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Fields — sabke liye */}
        <div style={S.grid2}>
          {F("Full Name",  "name",     "text",     "Ritesh Kumar")}
          {F("Email",      "email",    "email",    "ritesh@gmail.com")}
          {F("Phone",      "phone",    "tel",      "+91 9876543210")}
          {F("Password",   "password", "password", "Min 6 characters")}
        </div>

        {/* ── Patient Extra Fields ── */}
        {form.role === "patient" && (
          <div>
            <div style={S.divider}>🧑 Patient Information</div>
            <div style={S.grid2}>
              {F("Age", "age", "number", "25")}
              <div style={S.field}>
                <label style={S.label}>Gender</label>
                <select style={S.input} value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Blood Group</label>
                <select style={S.input} value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              {F("Address", "address", "text", "Varanasi, UP")}
            </div>
            {/* Condition field */}
            <div style={S.field}>
              <label style={S.label}>Primary Health Concern</label>
              <select style={S.input} value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                {["General", "Diabetes", "Hypertension", "Heart Disease", "Asthma",
                  "Orthopedic", "Skin Issue", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Doctor Extra Fields ── */}
        {form.role === "doctor" && (
          <div>
            <div style={S.divider}>👨‍⚕️ Doctor Information</div>
            <div style={S.grid2}>
              {F("Specialization",    "specialization", "text",   "Cardiologist")}
              {F("Experience (yrs)",  "experience",     "number", "5")}
              {F("Qualification",     "qualification",  "text",   "MBBS, MD")}
              {F("Department",        "department",     "text",   "Cardiology")}
            </div>
          </div>
        )}

        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, color: "#8b949e", fontSize: 14 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#00c9a7" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page:    { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", padding: 20 },
  card:    { background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: 32, width: "100%", maxWidth: 500, maxHeight: "95vh", overflowY: "auto" },
  logo:    { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 },
  logoIcon:{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#00c9a7,#4e8cff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700 },
  error:   { background: "#ff6b6b20", border: "1px solid #ff6b6b40", color: "#ff6b6b", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 },
  divider: { color: "#00c9a7", fontSize: 13, fontWeight: 600, margin: "16px 0 10px", padding: "8px 12px", background: "#00c9a710", borderRadius: 6, borderLeft: "3px solid #00c9a7" },
  grid2:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" },
  field:   { marginBottom: 12 },
  label:   { display: "block", color: "#8b949e", fontSize: 12, fontWeight: 500, marginBottom: 5 },
  input:   { width: "100%", padding: "9px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 7, color: "#e6edf3", fontSize: 13, outline: "none", boxSizing: "border-box" },
  btn:     { width: "100%", padding: "12px", background: "linear-gradient(135deg,#00c9a7,#4e8cff)", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 12 },
};
