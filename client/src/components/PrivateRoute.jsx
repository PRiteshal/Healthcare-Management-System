import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PrivateRoute: requires login
export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loader}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

// RoleRoute: requires specific role(s)
export const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loader}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const styles = {
  loader: {
    height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0d1117", color: "#8b949e", fontSize: 16,
  },
};
