import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const ProtectedRoutes = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
    // Redirect user to their role's default dashboard
    if (user.userType === "Client") return <Navigate to="/client/dashboard" replace />;
    if (user.userType === "Freelancer") return <Navigate to="/freelancer/dashboard" replace />;
    if (user.userType === "Admin") return <Navigate to="/admin/overview" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
