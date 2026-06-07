import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import Layout from "./components/Layout";

import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import DashboardPage    from "./pages/DashboardPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard  from "./pages/DoctorDashboard";   // ← Doctor dashboard
import PatientsPage     from "./pages/PatientsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorsPage      from "./pages/DoctorsPage";

// ─── Role ke hisaab se redirect ──────────────────────────────────────────────
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "patient") return <Navigate to="/my-dashboard" replace />;
  if (user.role === "doctor")  return <Navigate to="/doctor-dashboard" replace />;
  return <Navigate to="/dashboard" replace />; // admin
}

// ─── Role guard ───────────────────────────────────────────────────────────────
function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Admin Dashboard ── */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <RoleRoute roles={["admin"]}>
                <Layout><DashboardPage /></Layout>
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── Patient Dashboard ── */}
          <Route path="/my-dashboard" element={
            <PrivateRoute>
              <RoleRoute roles={["patient"]}>
                <Layout><PatientDashboard /></Layout>
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── Doctor Dashboard ── */}
          <Route path="/doctor-dashboard" element={
            <PrivateRoute>
              <RoleRoute roles={["doctor"]}>
                <Layout><DoctorDashboard /></Layout>
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── Appointments — sab ke liye ── */}
          <Route path="/appointments" element={
            <PrivateRoute>
              <Layout><AppointmentsPage /></Layout>
            </PrivateRoute>
          } />

          {/* ── Admin + Doctor only ── */}
          <Route path="/patients" element={
            <PrivateRoute>
              <RoleRoute roles={["admin", "doctor"]}>
                <Layout><PatientsPage /></Layout>
              </RoleRoute>
            </PrivateRoute>
          } />

          <Route path="/doctors" element={
            <PrivateRoute>
              <RoleRoute roles={["admin", "doctor"]}>
                <Layout><DoctorsPage /></Layout>
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* ── Default + 404 ── */}
          <Route path="/"  element={<HomeRedirect />} />
          <Route path="*"  element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
