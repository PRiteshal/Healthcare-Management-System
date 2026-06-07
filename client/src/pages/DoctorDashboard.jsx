import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doctorAPI } from "../utils/api";

// ─── Helper: Get initials from name ──────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const styles = {
    upcoming:  { bg: "#E1F5EE", color: "#0F6E56", label: "Upcoming" },
    completed: { bg: "#EAF3DE", color: "#3B6D11", label: "Completed" },
    cancelled: { bg: "#FCEBEB", color: "#A32D2D", label: "Cancelled" },
  };
  const s = styles[status] || styles.upcoming;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20 }}>
      {s.label}
    </span>
  );
};

// ─── Mock Appointments (Replace with real API later) ─────────────────────────
const mockAppointments = [
  { id: 1, patient: "Rahul Sharma",  age: 34, time: "10:00 AM", date: "08 Jun 2025", reason: "Chest pain checkup",   status: "upcoming" },
  { id: 2, patient: "Priya Verma",   age: 28, time: "11:30 AM", date: "08 Jun 2025", reason: "Routine checkup",      status: "upcoming" },
  { id: 3, patient: "Amit Gupta",    age: 45, time: "02:00 PM", date: "07 Jun 2025", reason: "Follow-up visit",      status: "completed" },
  { id: 4, patient: "Sunita Mishra", age: 52, time: "04:30 PM", date: "06 Jun 2025", reason: "Blood pressure review", status: "completed" },
];

// ─── Main Doctor Dashboard ────────────────────────────────────────────────────
const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab]     = useState("overview");
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [appointments]                = useState(mockAppointments);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch doctor profile from Doctor model using doctorAPI
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorAPI.getAll();
        const doctors = res.data || [];
        // Match by email or name to find this logged-in doctor's profile
        const mine = doctors.find(
          (d) => d.email === user?.email || d.name === user?.name
        );
        setDoctorProfile(mine || null);
      } catch (e) {
        console.error("Could not load doctor profile", e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const filteredAppointments = appointments.filter((a) =>
    a.patient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: "overview",     label: "Overview" },
    { id: "appointments", label: "Appointments" },
    { id: "schedule",     label: "My Schedule" },
  ];

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Segoe UI, sans-serif" }}>
        <p style={{ color: "#888", fontSize: 16 }}>Loading your profile...</p>
      </div>
    );
  }

  // Use doctorProfile data if available, fallback to user data
  const profile = {
    name:           doctorProfile?.name           || user.name,
    email:          doctorProfile?.email          || user.email,
    phone:          doctorProfile?.phone          || user.phone || "Not provided",
    specialization: doctorProfile?.specialization || "Not provided",
    qualification:  doctorProfile?.qualification  || "Not provided",
    department:     doctorProfile?.department     || "Not provided",
    experience:     doctorProfile?.experience     || "—",
    roomNumber:     doctorProfile?.roomNumber     || "—",
    availability:   doctorProfile?.availability   ?? true,
    doctorId:       doctorProfile?.doctorId       || "—",
    schedule:       doctorProfile?.schedule       || [],
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Top Navigation ── */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#1D9E75", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16 }}>🏥</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>HealthCare</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, background: "#E1F5EE", color: "#0F6E56", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
            Doctor
          </span>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E6F1FB", color: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
            {getInitials(profile.name)}
          </div>
          <span style={{ fontSize: 14, color: "#333", fontWeight: 500 }}>{profile.name}</span>
          <button onClick={logout}
            style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "5px 12px", fontSize: 13, color: "#666", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 12, padding: 5, marginBottom: 24, border: "1px solid #e8e8e8", width: "fit-content" }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: activeTab === tab.id ? "#1D9E75" : "transparent", color: activeTab === tab.id ? "#fff" : "#555", fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════
            TAB 1: OVERVIEW
        ════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div>
            {loading ? (
              <p style={{ color: "#888", textAlign: "center", padding: 40 }}>Loading profile...</p>
            ) : (
              <>
                {/* Doctor Profile Card */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid #e8e8e8" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    {/* Avatar */}
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E6F1FB", color: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
                      {getInitials(profile.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>{profile.name}</h2>
                      <p style={{ margin: "0 0 4px", fontSize: 14, color: "#378ADD", fontWeight: 500 }}>{profile.specialization}</p>
                      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#888" }}>{profile.qualification}</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ background: profile.availability ? "#E1F5EE" : "#FCEBEB", color: profile.availability ? "#0F6E56" : "#A32D2D", fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>
                          {profile.availability ? "✓ Available" : "✗ Unavailable"}
                        </span>
                        <span style={{ background: "#f0f0f0", color: "#555", fontSize: 12, padding: "4px 12px", borderRadius: 20 }}>
                          ID: {profile.doctorId}
                        </span>
                        {profile.experience !== "—" && (
                          <span style={{ background: "#FAEEDA", color: "#854F0B", fontSize: 12, padding: "4px 12px", borderRadius: 20 }}>
                            {profile.experience} yrs experience
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ marginTop: 20, borderTop: "1px solid #f0f0f0", paddingTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                    {[
                      { icon: "📞", label: "Phone",      value: profile.phone },
                      { icon: "✉️", label: "Email",      value: profile.email },
                      { icon: "🏢", label: "Department", value: profile.department },
                      { icon: "🚪", label: "Room No.",   value: profile.roomNumber },
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</p>
                          <p style={{ margin: 0, fontSize: 13, color: "#333", fontWeight: 500 }}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
                  {[
                    { label: "Total Patients",    value: appointments.length,                                        color: "#1D9E75" },
                    { label: "Today's Appointments", value: appointments.filter((a) => a.status === "upcoming").length, color: "#378ADD" },
                    { label: "Completed",         value: appointments.filter((a) => a.status === "completed").length, color: "#639922" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e8e8e8" }}>
                      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888" }}>{stat.label}</p>
                      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════
            TAB 2: APPOINTMENTS
        ════════════════════════════════════ */}
        {activeTab === "appointments" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <input type="text" placeholder="Search patient name..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, background: "#fff", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredAppointments.map((appt) => (
                <div key={appt.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      {getInitials(appt.patient)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{appt.patient}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>Age {appt.age} &bull; {appt.reason}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Date</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>{appt.date}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Time</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>{appt.time}</p>
                    </div>
                    <Badge status={appt.status} />
                  </div>
                </div>
              ))}
              {filteredAppointments.length === 0 && (
                <div style={{ background: "#fff", borderRadius: 14, padding: 40, textAlign: "center", border: "1px solid #e8e8e8" }}>
                  <p style={{ fontSize: 40, margin: "0 0 12px" }}>📅</p>
                  <p style={{ fontSize: 16, color: "#888", margin: 0 }}>No appointments found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            TAB 3: SCHEDULE
        ════════════════════════════════════ */}
        {activeTab === "schedule" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#1a1a1a" }}>Weekly Schedule</h3>

              {profile.schedule.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <p style={{ fontSize: 36, margin: "0 0 10px" }}>📋</p>
                  <p style={{ color: "#888", fontSize: 14, margin: 0 }}>No schedule added yet. Ask admin to set your schedule.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {profile.schedule.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f7f7f5", borderRadius: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a", width: 100 }}>{s.day}</span>
                      <span style={{ fontSize: 13, color: "#555" }}>{s.start} — {s.end}</span>
                      <span style={{ fontSize: 12, background: "#E1F5EE", color: "#0F6E56", padding: "3px 10px", borderRadius: 20 }}>Active</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Today's slots */}
              <div style={{ marginTop: 24, borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
                <h4 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Today's Appointment Slots</h4>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"].map((slot) => {
                    const booked = appointments.some((a) => a.time === slot && a.status === "upcoming");
                    return (
                      <div key={slot} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${booked ? "#FBBF24" : "#ddd"}`, background: booked ? "#FEFCE8" : "#f7f7f5", fontSize: 13, fontWeight: 500, color: booked ? "#92400E" : "#555" }}>
                        {slot} {booked ? "• Booked" : "• Free"}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
