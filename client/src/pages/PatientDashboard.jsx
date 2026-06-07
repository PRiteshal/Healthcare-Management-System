import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doctorAPI, appointmentAPI, authAPI } from "../utils/api";

// ─── Helper: Get initials from name ──────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Badge Component ──────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const styles = {
    Scheduled: { bg: "#E1F5EE", color: "#0F6E56", label: "Scheduled" },
    Completed: { bg: "#EAF3DE", color: "#3B6D11", label: "Completed" },
    Cancelled: { bg: "#FCEBEB", color: "#A32D2D", label: "Cancelled" },
    "No-show": { bg: "#FFF3CD", color: "#856404", label: "No-show" },
  };
  const s = styles[status] || styles.Scheduled;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20 }}>
      {s.label}
    </span>
  );
};

// ─── Booking Modal ────────────────────────────────────────────────────────────
const BookingModal = ({ doctor, onClose, onConfirm, saving }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [type, setType] = useState("Consultation");

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
  const types = ["Consultation", "Follow-up", "Lab Review", "Emergency"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a1a" }}>Book an Appointment</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
        </div>

        {/* Doctor Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f7f7f5", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E6F1FB", color: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>
            {getInitials(doctor.name)}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{doctor.name}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{doctor.specialization}</p>
          </div>
        </div>

        {/* Appointment Type */}
        <label style={{ fontSize: 13, color: "#555", fontWeight: 500, display: "block", marginBottom: 6 }}>Appointment Type</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {types.map((t) => (
            <button key={t} onClick={() => setType(t)}
              style={{ padding: "6px 14px", borderRadius: 8, border: type === t ? "2px solid #1D9E75" : "1px solid #ddd", background: type === t ? "#E1F5EE" : "#fff", color: type === t ? "#0F6E56" : "#444", fontSize: 13, fontWeight: type === t ? 600 : 400, cursor: "pointer" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Date */}
        <label style={{ fontSize: 13, color: "#555", fontWeight: 500, display: "block", marginBottom: 6 }}>Select Date</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none" }} />

        {/* Time Slots */}
        <label style={{ fontSize: 13, color: "#555", fontWeight: 500, display: "block", marginBottom: 10 }}>Select Time Slot</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {timeSlots.map((slot) => (
            <button key={slot} onClick={() => setSelectedSlot(slot)}
              style={{ padding: "7px 14px", borderRadius: 8, border: selectedSlot === slot ? "2px solid #1D9E75" : "1px solid #ddd", background: selectedSlot === slot ? "#E1F5EE" : "#fff", color: selectedSlot === slot ? "#0F6E56" : "#444", fontSize: 13, fontWeight: selectedSlot === slot ? 600 : 400, cursor: "pointer" }}>
              {slot}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (!selectedDate || !selectedSlot) { alert("Please select a date and time slot."); return; }
            onConfirm({ doctor, date: selectedDate, slot: selectedSlot, type });
          }}
          disabled={saving}
          style={{ width: "100%", padding: "12px 0", background: saving ? "#aaa" : "#1D9E75", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Patient Dashboard ───────────────────────────────────────────────────
const PatientDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab]           = useState("overview");
  const [doctors, setDoctors]               = useState([]);
  const [appointments, setAppointments]     = useState([]);
  const [patientRecord, setPatientRecord]   = useState(null); // Patient model ka _id
  const [bookingDoctor, setBookingDoctor]   = useState(null);
  const [successMsg, setSuccessMsg]         = useState("");
  const [errorMsg, setErrorMsg]             = useState("");
  const [searchQuery, setSearchQuery]       = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppts, setLoadingAppts]     = useState(true);
  const [savingBooking, setSavingBooking]   = useState(false);

  // ── Fetch Patient record via dedicated auth route ──
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await authAPI.myPatientProfile();
        setPatientRecord(res.data || null);
      } catch (e) {
        console.error("Could not load patient record", e);
        setPatientRecord(null);
      }
    };
    if (user) fetchPatient();
  }, [user]);

  // ── Fetch Doctors ──
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorAPI.getAll();
        setDoctors(res.data?.doctors || res.data || []);
      } catch (e) {
        console.error("Could not load doctors", e);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // ── Fetch Appointments ──
  const fetchAppointments = async () => {
    if (!patientRecord?._id) return;
    try {
      const res = await appointmentAPI.getAll({ patientId: patientRecord._id });
      setAppointments(res.data?.appointments || res.data || []);
    } catch (e) {
      console.error("Could not load appointments", e);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    if (patientRecord) fetchAppointments();
    else setLoadingAppts(false);
  }, [patientRecord]);

  // ── Book Appointment ──
  const handleConfirmBooking = async ({ doctor, date, slot, type }) => {
    if (!patientRecord?._id) {
      setErrorMsg("Your patient profile was not found. Please contact admin.");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }
    setSavingBooking(true);
    try {
      await appointmentAPI.create({
        patient: patientRecord._id,  // ✅ Patient model ka _id
        doctor:  doctor._id,          // ✅ Doctor model ka _id
        date,
        time:    slot,
        type,                         // ✅ "Consultation", "Follow-up" etc.
        status:  "Scheduled",         // ✅ Correct enum value
      });
      await fetchAppointments();
      setBookingDoctor(null);
      setSuccessMsg(`Appointment booked successfully with ${doctor.name}!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setActiveTab("appointments");
    } catch (e) {
      setErrorMsg(e.response?.data?.message || "Booking failed. Please try again.");
      setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setSavingBooking(false);
    }
  };

  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: "overview",     label: "Overview" },
    { id: "doctors",      label: "Doctors" },
    { id: "appointments", label: "Appointments" },
  ];

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#888" }}>Loading your profile...</p>
    </div>
  );

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
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
            {getInitials(user.name)}
          </div>
          <span style={{ fontSize: 14, color: "#333", fontWeight: 500 }}>{user.name}</span>
          <button onClick={logout} style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "5px 12px", fontSize: 13, color: "#666", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Toast Messages ── */}
        {successMsg && (
          <div style={{ background: "#E1F5EE", color: "#0F6E56", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontWeight: 500, fontSize: 14, border: "1px solid #9FE1CB" }}>
            ✅ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontWeight: 500, fontSize: 14, border: "1px solid #F5BCBC" }}>
            ❌ {errorMsg}
          </div>
        )}

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
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid #e8e8e8" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
                  {getInitials(user.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>{user.name}</h2>
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: "#888" }}>Role: {user.role || "Patient"}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { label: "Age",         value: user.age        || patientRecord?.age        || "—" },
                      { label: "Gender",      value: user.gender     || patientRecord?.gender     || "—" },
                      { label: "Blood Group", value: user.bloodGroup || patientRecord?.bloodGroup || "—" },
                    ].map((item) => (
                      <div key={item.label} style={{ background: "#f7f7f5", borderRadius: 8, padding: "6px 14px", fontSize: 13 }}>
                        <span style={{ color: "#888" }}>{item.label}: </span>
                        <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, borderTop: "1px solid #f0f0f0", paddingTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {[
                  { icon: "📞", label: "Phone",   value: user.phone   || patientRecord?.phone   || "Not provided" },
                  { icon: "✉️", label: "Email",   value: user.email   || "Not provided" },
                  { icon: "📍", label: "Address", value: user.address || patientRecord?.address || "Not provided" },
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

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Total Appointments", value: appointments.length,                                           color: "#1D9E75" },
                { label: "Scheduled",          value: appointments.filter((a) => a.status === "Scheduled").length,   color: "#378ADD" },
                { label: "Completed",          value: appointments.filter((a) => a.status === "Completed").length,   color: "#639922" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e8e8e8" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888" }}>{stat.label}</p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ background: "linear-gradient(135deg, #1D9E75, #0F6E56)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", color: "#fff", fontSize: 16, fontWeight: 700 }}>Book a Doctor Appointment</h3>
                <p style={{ margin: 0, color: "#9FE1CB", fontSize: 13 }}>Consult with our expert doctors today</p>
              </div>
              <button onClick={() => setActiveTab("doctors")}
                style={{ background: "#fff", color: "#0F6E56", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                View Doctors →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            TAB 2: DOCTORS
        ════════════════════════════════════ */}
        {activeTab === "doctors" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <input type="text" placeholder="Search by doctor name or specialty..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, background: "#fff", outline: "none", boxSizing: "border-box" }} />
            </div>

            {loadingDoctors ? (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading doctors...</div>
            ) : filteredDoctors.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 14, padding: 40, textAlign: "center", border: "1px solid #e8e8e8" }}>
                <p style={{ fontSize: 36, margin: "0 0 10px" }}>🩺</p>
                <p style={{ fontSize: 15, color: "#888", margin: 0 }}>No doctors found. Ask admin to add doctors.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {filteredDoctors.map((doc) => (
                  <div key={doc._id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#E6F1FB", color: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        {getInitials(doc.name)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{doc.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{doc.specialization}</p>
                        {doc.qualification && <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{doc.qualification}</p>}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {doc.experience && <span style={{ background: "#f0f0f0", color: "#555", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>{doc.experience} yrs exp</span>}
                      {doc.department && <span style={{ background: "#f0f0f0", color: "#555", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>{doc.department}</span>}
                      <span style={{ background: doc.availability ? "#E1F5EE" : "#FCEBEB", color: doc.availability ? "#0F6E56" : "#A32D2D", fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 500, marginLeft: "auto" }}>
                        {doc.availability ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        {doc.phone && <p style={{ margin: 0, fontSize: 12, color: "#888" }}>📞 {doc.phone}</p>}
                        {doc.roomNumber && <p style={{ margin: 0, fontSize: 12, color: "#888" }}>🚪 Room {doc.roomNumber}</p>}
                      </div>
                      <button onClick={() => doc.availability && setBookingDoctor(doc)} disabled={!doc.availability}
                        style={{ background: doc.availability ? "#1D9E75" : "#e0e0e0", color: doc.availability ? "#fff" : "#999", border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: doc.availability ? "pointer" : "not-allowed" }}>
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════
            TAB 3: APPOINTMENTS
        ════════════════════════════════════ */}
        {activeTab === "appointments" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1a1a1a" }}>My Appointments ({appointments.length})</h3>
              <button onClick={() => setActiveTab("doctors")}
                style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + New Booking
              </button>
            </div>

            {!patientRecord && (
              <div style={{ background: "#FFF3CD", border: "1px solid #FBBF24", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400E" }}>
                ⚠️ Your patient profile was not found in the system. Please ask admin to add your profile to view and book appointments.
              </div>
            )}

            {loadingAppts ? (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 14, padding: 40, textAlign: "center", border: "1px solid #e8e8e8" }}>
                <p style={{ fontSize: 40, margin: "0 0 12px" }}>📅</p>
                <p style={{ fontSize: 16, color: "#888", margin: 0 }}>No appointments yet. Book a doctor now!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {appointments.map((appt) => (
                  <div key={appt._id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#E6F1FB", color: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🩺</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{appt.doctor?.name || "Doctor"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>{appt.doctor?.specialization || ""} {appt.type ? `• ${appt.type}` : ""}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Date</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>
                          {appt.date ? new Date(appt.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Time</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>{appt.time || "—"}</p>
                      </div>
                      <Badge status={appt.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {bookingDoctor && (
        <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onConfirm={handleConfirmBooking} saving={savingBooking} />
      )}
    </div>
  );
};

export default PatientDashboard;
