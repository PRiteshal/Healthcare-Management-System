import { useEffect, useState } from "react";
import { doctorAPI } from "../utils/api";

const empty = { name: "", specialization: "", qualification: "", phone: "", email: "", experience: "", department: "", roomNumber: "", availability: true };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(empty);
  const [editId, setEditId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await doctorAPI.getAll(); setDoctors(r.data || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = (d) => { setForm(d); setEditId(d._id); setModal(true); };
  const handleDelete = async (id) => { if (!window.confirm("Remove doctor?")) return; await doctorAPI.delete(id); load(); };
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await doctorAPI.update(editId, form);
      else await doctorAPI.create(form);
      setModal(false); load();
    } catch (e) { alert(e.response?.data?.message || "Error"); }
    setSaving(false);
  };

  const F = (label, key, type = "text") => (
    <div style={S.field} key={key}>
      <label style={S.label}>{label}</label>
      <input style={S.input} type={type} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 style={S.h1}>Doctors</h1><p style={S.sub}>{doctors.length} staff members</p></div>
        <button style={S.btnPrimary} onClick={openAdd}>+ Add Doctor</button>
      </div>

      {loading ? <div style={S.loader}>Loading...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
          {doctors.map((d) => (
            <div key={d._id} style={S.card}>
              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div style={S.avatar}>{d.name.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{d.name}</div>
                  <div style={{ color: "#4e8cff", fontSize: 13 }}>{d.specialization}</div>
                  <div style={{ color: "#8b949e", fontSize: 12 }}>{d.qualification}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, color: "#8b949e", marginBottom: 14 }}>
                {d.department  && <div>🏥 {d.department}</div>}
                {d.experience  && <div>⏳ {d.experience} years experience</div>}
                {d.phone       && <div>📱 {d.phone}</div>}
                {d.roomNumber  && <div>🚪 Room {d.roomNumber}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: d.availability ? "#00c9a720" : "#ff6b6b20", color: d.availability ? "#00c9a7" : "#ff6b6b" }}>
                  {d.availability ? "Available" : "Unavailable"}
                </span>
                <button style={S.btnEdit} onClick={() => openEdit(d)}>Edit</button>
                <button style={S.btnDel}  onClick={() => handleDelete(d._id)}>Remove</button>
              </div>
            </div>
          ))}
          {doctors.length === 0 && <div style={S.empty}>No doctors added yet.</div>}
        </div>
      )}

      {modal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ color: "#fff", margin: 0, fontSize: 18 }}>{editId ? "Edit Doctor" : "Add Doctor"}</h2>
              <button style={S.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={S.grid2}>
              {F("Full Name", "name")}
              {F("Specialization", "specialization")}
              {F("Qualification", "qualification")}
              {F("Department", "department")}
              {F("Phone", "phone", "tel")}
              {F("Email", "email", "email")}
              {F("Experience (years)", "experience", "number")}
              {F("Room Number", "roomNumber")}
            </div>
            <div style={S.field}>
              <label style={S.label}>Availability</label>
              <select style={S.input} value={form.availability ? "true" : "false"} onChange={(e) => setForm({ ...form, availability: e.target.value === "true" })}>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={{ ...S.btnPrimary, flex: 1, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editId ? "Update" : "Add Doctor"}
              </button>
              <button style={S.btnCancel} onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  h1: { fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 },
  sub: { color: "#8b949e", fontSize: 13, margin: "4px 0 0" },
  loader: { textAlign: "center", padding: 40, color: "#8b949e" },
  empty: { color: "#8b949e", fontSize: 14, padding: 20 },
  card: { background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 18 },
  avatar: { width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#4e8cff,#00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 },
  btnPrimary: { background: "linear-gradient(135deg,#00c9a7,#4e8cff)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnEdit: { background: "#4e8cff20", border: "1px solid #4e8cff40", color: "#4e8cff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 },
  btnDel:  { background: "#ff6b6b20", border: "1px solid #ff6b6b40", color: "#ff6b6b", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 },
  btnCancel: { background: "#21262d", border: "1px solid #30363d", borderRadius: 8, color: "#8b949e", padding: "10px 20px", fontSize: 14, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "#161b22", border: "1px solid #21262d", borderRadius: 14, padding: 28, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" },
  field: { marginBottom: 14 },
  label: { display: "block", color: "#8b949e", fontSize: 12, fontWeight: 500, marginBottom: 5 },
  input: { width: "100%", padding: "9px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 7, color: "#e6edf3", fontSize: 13, outline: "none", boxSizing: "border-box" },
  closeBtn: { background: "transparent", border: "none", color: "#8b949e", fontSize: 18, cursor: "pointer" },
};
