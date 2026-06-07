import { useEffect, useState } from "react";
import { dashboardAPI, appointmentAPI, patientAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const statusColor = {
  Active:     { bg: "#00c9a720", color: "#00c9a7" },
  Discharged: { bg: "#4e8cff20", color: "#4e8cff" },
  Critical:   { bg: "#ff6b6b20", color: "#ff6b6b" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p, a] = await Promise.all([
          dashboardAPI.getStats(),
          patientAPI.getAll({ limit: 5 }),
          appointmentAPI.getToday(),
        ]);
        setStats(s.data);
        setPatients(p.data.patients || []);
        setAppts(a.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = stats
    ? [
        { label: "Total Patients",       value: stats.totalPatients,       icon: "👥", color: "#00c9a7", sub: `${stats.activePatients} active` },
        { label: "Appointments Today",   value: stats.todayAppointments,   icon: "📅", color: "#4e8cff", sub: `${stats.pendingAppointments} pending` },
        { label: "Active Doctors",       value: stats.availableDoctors,    icon: "🩺", color: "#f7c94b", sub: `${stats.totalDoctors} total` },
        { label: "Critical Patients",    value: stats.criticalPatients,    icon: "🚨", color: "#ff6b6b", sub: "need attention" },
      ]
    : [];

  if (loading) return <div style={S.loader}>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={S.h1}>Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
        <p style={S.sub}>{new Date().toDateString()} · Here's your hospital overview</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {cards.map((c) => (
          <div key={c.label} style={S.card}>
            <div style={{ height: 3, background: c.color, borderRadius: "10px 10px 0 0", position: "absolute", top: 0, left: 0, right: 0 }} />
            <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{c.value}</div>
            <div style={{ fontSize: 13, color: "#8b949e", marginTop: 2 }}>{c.label}</div>
            <div style={{ fontSize: 12, color: c.color, marginTop: 5, fontWeight: 500 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Two col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Patients */}
        <div style={S.panel}>
          <div style={S.panelHeader}><span>Recent Patients</span></div>
          {patients.length === 0 && <p style={{ color: "#8b949e", fontSize: 14 }}>No patients yet.</p>}
          {patients.map((p) => (
            <div key={p._id} style={S.row}>
              <div style={S.avatar}>{p.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#8b949e" }}>{p.condition} · {p.assignedDoctor?.name || "Unassigned"}</div>
              </div>
              <span style={{ ...S.badge, background: statusColor[p.status]?.bg, color: statusColor[p.status]?.color }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Today's Appointments */}
        <div style={S.panel}>
          <div style={S.panelHeader}><span>Today's Appointments</span></div>
          {appointments.length === 0 && <p style={{ color: "#8b949e", fontSize: 14 }}>No appointments today.</p>}
          {appointments.slice(0, 5).map((a) => (
            <div key={a._id} style={S.row}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4e8cff", background: "#4e8cff15", padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap", minWidth: 70, textAlign: "center" }}>{a.time}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.patient?.name}</div>
                <div style={{ fontSize: 12, color: "#8b949e" }}>{a.doctor?.name} · {a.type}</div>
              </div>
              <span style={{ ...S.badge, background: "#f7c94b20", color: "#f7c94b" }}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
};

const S = {
  loader: { height: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b949e" },
  h1:  { fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 },
  sub: { color: "#8b949e", fontSize: 14, margin: "4px 0 0" },
  card: { background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" },
  panel: { background: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 18 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 15, fontWeight: 600, color: "#fff" },
  row: { display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", background: "#0d1117", borderRadius: 8, marginBottom: 8, border: "1px solid #21262d20" },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4e8cff,#00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 },
  badge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
};