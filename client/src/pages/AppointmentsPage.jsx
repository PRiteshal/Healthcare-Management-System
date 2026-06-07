import { useEffect, useState } from "react";
import { appointmentAPI, patientAPI, doctorAPI } from "../utils/api";

const statusColors = {
  Scheduled: { bg: "#4e8cff20", color: "#4e8cff" },
  Completed: { bg: "#00c9a720", color: "#00c9a7" },
  Cancelled: { bg: "#ff6b6b20", color: "#ff6b6b" },
  "No-show": { bg: "#f7c94b20", color: "#f7c94b" },
};

const emptyForm = { patient: "", doctor: "", date: "", time: "", type: "Consultation", room: "", notes: "", status: "Scheduled" };

export default function AppointmentsPage() {
  const [appointments, setAppts] = useState([]);
  const [patients, setPatients]  = useState([]);
  const [doctors, setDoctors]    = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [modal, setModal]  = useState(false);
  const [form, setForm]    = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = filterDate ? { date: filterDate } : {};
      const [a, p, d] = await Promise.all([
        appointmentAPI.getAll(params),
        patientAPI.getAll({ limit: 200 }),
        doctorAPI.getAll(),
      ]);
      setAppts(a.data || []);
      setPatients(p.data.patients || []);
      setDoctors(d.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterDate]);

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (a) => { setForm({ ...a, patient: a.patient?._id, doctor: a.doctor?._id }); setEditId(a._id); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await appointmentAPI.update(editId, form);
      else await appointmentAPI.create(form);
      setModal(false); load();
    } catch (e) { alert(e.response?.data?.message || "Error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    await appointmentAPI.delete(id); load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={S.h1}>Appointments</h1>
          <p style={S.sub}>{appointments.length} records</p>
        </div>
        <button style={S.btnPrimary} onClick={openAdd}>+ Book Appointment</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <input type="date" style={S.input} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        {filterDate && <button style={S.btnCancel} onClick={() => setFilterDate("")}>Clear</button>}
      </div>

      {/* Table */}
      {loading ? <div style={S.loader}>Loading...</div> : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{["ID","Patient","Doctor","Date","Time","Type","Status","Room","Actions"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} style={S.tr}
                  onMouseEnter={e => e.currentTarget.style.background = "#21262d"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={S.td}><span style={{ fontFamily: "monospace", color: "#8b949e", fontSize: 11 }}>{a.appointmentId}</span></td>
                  <td style={S.td}><span style={{ fontWeight: 600, color: "#fff" }}>{a.patient?.name}</span></td>
                  <td style={S.td}><span style={{ color: "#4e8cff" }}>{a.doctor?.name}</span></td>
                  <td style={S.td}>{new Date(a.date).toLocaleDateString()}</td>
                  <td style={S.td}>{a.time}</td>
                  <td style={S.td}>{a.type}</td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background: statusColors[a.status]?.bg, color: statusColors[a.status]?.color }}>{a.status}</span>
                  </td>
                  <td style={S.td}>{a.room || "—"}</td>
                  <td style={S.td}>
                    <button style={S.btnEdit} onClick={() => openEdit(a)}>Edit</button>
                    <button style={S.btnDel}  onClick={() => handleDelete(a._id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && <div style={S.empty}>No appointments found.</div>}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#fff", margin: 0, fontSize: 18 }}>{editId ? "Edit Appointment" : "Book Appointment"}</h2>
              <button style={S.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={S.grid2}>
              {/* Patient */}
              <div style={S.field}>
                <label style={S.label}>Patient</label>
                <select style={S.input} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                  <option value="">-- Select Patient --</option>
                  {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
                </select>
              </div>
              {/* Doctor */}
              <div style={S.field}>
                <label style={S.label}>Doctor</label>
                <select style={S.input} value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Date</label>
                <input type="date" style={S.input} value={form.date?.split("T")[0]} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Time</label>
                <input type="time" style={S.input} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Type</label>
                <select style={S.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {["Consultation","Follow-up","Surgery","Lab Review","Emergency"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Status</label>
                <select style={S.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["Scheduled","Completed","Cancelled","No-show"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Room</label>
                <input style={S.input} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Notes</label>
              <textarea style={{ ...S.input, height: 65, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={{ ...S.btnPrimary, flex: 1, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editId ? "Update" : "Book Appointment"}
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
  empty: { textAlign: "center", padding: 30, color: "#8b949e", fontSize: 14 },
  btnPrimary: { background: "linear-gradient(135deg,#00c9a7,#4e8cff)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnEdit: { background: "#4e8cff20", border: "1px solid #4e8cff40", color: "#4e8cff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, marginRight: 6 },
  btnDel:  { background: "#ff6b6b20", border: "1px solid #ff6b6b40", color: "#ff6b6b", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 },
  btnCancel: { background: "#21262d", border: "1px solid #30363d", borderRadius: 8, color: "#8b949e", padding: "10px 20px", fontSize: 14, cursor: "pointer" },
  badge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  input: { width: "100%", padding: "9px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: 7, color: "#e6edf3", fontSize: 13, outline: "none", boxSizing: "border-box" },
  tableWrap: { background: "#161b22", border: "1px solid #21262d", borderRadius: 12, overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "10px 14px", textAlign: "left", color: "#8b949e", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #21262d", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #21262d20", transition: "background 0.1s" },
  td: { padding: "11px 14px", color: "#e6edf3", whiteSpace: "nowrap" },
  overlay: { position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "#161b22", border: "1px solid #21262d", borderRadius: 14, padding: 28, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" },
  field: { marginBottom: 14 },
  label: { display: "block", color: "#8b949e", fontSize: 12, fontWeight: 500, marginBottom: 5 },
  closeBtn: { background: "transparent", border: "none", color: "#8b949e", fontSize: 18, cursor: "pointer" },
};
