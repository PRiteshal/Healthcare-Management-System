import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { icon: "⊞", label: "Dashboard",    path: "/dashboard",    roles: ["admin", "doctor", "patient"] },
  { icon: "👥", label: "Patients",     path: "/patients",     roles: ["admin", "doctor"] },
  { icon: "📅", label: "Appointments", path: "/appointments", roles: ["admin", "doctor", "patient"] },
  { icon: "🩺", label: "Doctors",      path: "/doctors",      roles: ["admin", "doctor"] },
  { icon: "⚙️", label: "Settings",     path: "/settings",     roles: ["admin", "doctor", "patient"] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleLogout = () => { logout(); navigate("/login"); };
  const allowed = navItems.filter((n) => n.roles.includes(user?.role));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: open ? 240 : 68, transition: "width 0.25s", background: "#161b22", borderRight: "1px solid #21262d", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "18px 14px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00c9a7,#4e8cff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>+</div>
          {open && <div><div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>MedCore</div><div style={{ fontSize: 11, color: "#8b949e" }}>Healthcare Suite</div></div>}
        </div>

        {/* Nav */}
        <nav style={{ padding: "10px 8px", flex: 1 }}>
          {allowed.map((item) => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 11, padding: "10px 11px",
              borderRadius: 8, marginBottom: 3, textDecoration: "none",
              background: isActive ? "#21262d" : "transparent",
              color: isActive ? "#fff" : "#8b949e",
              borderLeft: isActive ? "3px solid #00c9a7" : "3px solid transparent",
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              whiteSpace: "nowrap", overflow: "hidden",
            })}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
              {open && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: 12, borderTop: "1px solid #21262d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4e8cff,#00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.charAt(0) || "U"}
            </div>
            {open && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: "#00c9a7", textTransform: "capitalize" }}>{user?.role}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} style={{ width: "100%", padding: open ? "8px" : "8px 0", background: "#ff6b6b15", border: "1px solid #ff6b6b30", borderRadius: 7, color: "#ff6b6b", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {open ? "🚪 Logout" : "🚪"}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ padding: "13px 22px", background: "#161b22", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setOpen(!open)} style={{ background: "#21262d", border: "1px solid #30363d", borderRadius: 7, color: "#8b949e", width: 34, height: 34, cursor: "pointer", fontSize: 15 }}>☰</button>
          <div style={{ flex: 1, fontSize: 15, color: "#fff", fontWeight: 600 }}>
            {allowed.find((n) => window.location.pathname.startsWith(n.path))?.label || "MedCore"}
          </div>
          <div style={{ fontSize: 12, color: "#8b949e" }}>{new Date().toDateString()}</div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto", padding: 22 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
