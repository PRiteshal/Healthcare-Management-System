import { useEffect, useState } from "react";
import { patientAPI, doctorAPI } from "../utils/api";

const statusColor = {
  Active:     { bg: "#00c9a720", color: "#00c9a7" },
  Discharged: { bg: "#4e8cff20", color: "#4e8cff" },
  Critical:   { bg: "#ff6b6b20", color: "#ff6b6b" },
};

const empty = { name: "", age: "", gender: "Male", phone: "", email: "", address: "", bloodGroup: "O+", condition: "", status: "Active", ward: "", notes: "" };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors]   = useState([]);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(empty);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([patientAPI.getAll({ search }), doctorAPI.getAll()]);
      setPatients(p.data.patients || []);
      setDoctors(d.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const openAdd  = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = (p) => { setForm({ ...p, assignedDoctor: p.assignedDoctor?._id || "" }); setEditId(p._id); setModal(true); };
  const closeModal = () => setModal(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await patientAPI.update(editId, form);
      else await patientAPI.create(form);
      closeModal(); load();
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient record?")) return;
    await patientAPI.delete(id); load();
  };

  const F = (label, key, type = "text", opts = null) => (
    <div style={S.field} key={key}>
      <label style={S.label}>{label}</label>
      {opts ? (
        <select style={S.input} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
          {opts.map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input style={S.input} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={S.h1}>Patients</h1>
          <p style={S.sub}>{patients.length} records</p>
        </div>
        <button style={S.btnPrimary} onClick={openAdd}>+ Add Patient</button>
      </div>

      {/* Search */}
      <input style={{ ...S.searchInput, marginBottom: 16 }} placeholder="Search by name, condition, ID..."
        value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Table */}
      {loading ? <div style={S.loader}>Loading...</div> : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{["ID","Name","Age","Condition","Doctor","Status","Actions"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} style={S.tr}
                  onMouseEnter={e => e.currentTarget.style.background = "#21262d"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={S.td}><span style={{ fontFamily: "monospace", color: "#8b949e" }}>{p.patientId}</span></td>
                  <td style={S.td}><span style={{ fontWeight: 600, color: "#fff" }}>{p.name}</span></td>
                  <td style={S.td}>{p.age}</td>
                  <td style={S.td}>{p.condition}</td>
                  <td style={S.td}><span style={{ color: "#4e8cff" }}>{p.assignedDoctor?.name || "—"}</span></td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background: statusColor[p.status]?.bg, color: statusColor[p.status]?.color }}>{p.status}</span>
                  </td>
                  <td style={S.td}>
                    <button style={S.btnEdit} onClick={() => openEdit(p)}>Edit</button>
                    <button style={S.btnDel}  onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {patients.length === 0 && <div style={S.empty}>No patients found.</div>}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#fff", margin: 0, fontSize: 18 }}>{editId ? "Edit Patient" : "Add New Patient"}</h2>
              <button style={S.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div style={S.grid2}>
              {F("Full Name", "name")}
              {F("Age", "age", "number")}
              {F("Gender", "gender", "text", ["Male","Female","Other"])}
              {F("Blood Group", "bloodGroup", "text", ["A+","A-","B+","B-","AB+","AB-","O+","O-"])}
              {F("Phone", "phone", "tel")}
              {F("Email", "email", "email")}
              {F("Condition / Diagnosis", "condition")}
              {F("Status", "status", "text", ["Active","Discharged","Critical"])}
              {F("Ward", "ward")}
              <div style={S.field}>
                <label style={S.label}>Assigned Doctor</label>
                <select style={S.input} value={form.assignedDoctor || ""} onChange={(e) => setForm({ ...form, assignedDoctor: e.target.value })}>
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Address</label>
              <input style={S.input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Notes</label>
              <textarea style={{ ...S.input, height: 70, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={{ ...S.btnPrimary, flex: 1, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editId ? "Update Patient" : "Add Patient"}
              </button>
              <button style={S.btnCancel} onClick={closeModal}>Cancel</button>
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
  empty: { textAlign: "center", padding: 30, color: "#8b949e", fontSize: 14 },
  btnPrimary: { background: "linear-gradient(135deg,#00c9a7,#4e8cff)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnEdit: { background: "#4e8cff20", border: "1px solid #4e8cff40", color: "#4e8cff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, marginRight: 6 },
  btnDel:  { background: "#ff6b6b20", border: "1px solid #ff6b6b40", color: "#ff6b6b", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 },
  btnCancel: { background: "#21262d", border: "1px solid #30363d", borderRadius: 8, color: "#8b949e", padding: "10px 20px", fontSize: 14, cursor: "pointer" },
  badge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  searchInput: { width: "100%", maxWidth: 400, padding: "9px 14px", background: "#161b22", border: "1px solid #30363d", borderRadius: 8, color: "#e6edf3", fontSize: 14, outline: "none", boxSizing: "border-box" },
  tableWrap: { background: "#161b22", border: "1px solid #21262d", borderRadius: 12, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "10px 14px", textAlign: "left", color: "#8b949e", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #21262d" },
  tr: { borderBottom: "1px solid #21262d20", transition: "background 0.1s" },
  td: { padding: "12px 14px", color: "#e6edf3" },
  overlay: { position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "#161b22", border: "1px solid #21262d", borderRadius: 14, padding: 28, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" },
  field: { marginBottom: 14 },
  label: { display: "block", color: "#8b949e", fontSize: 12, fontWeight: 500, marginBottom: 5 },
  input: { width: "100%", padding: "9px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 7, color: "#e6edf3", fontSize: 13, outline: "none", boxSizing: "border-box" },
  closeBtn: { background: "transparent", border: "none", color: "#8b949e", fontSize: 18, cursor: "pointer" },
};
