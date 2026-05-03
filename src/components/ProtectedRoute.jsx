// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute component to guard sensitive pages
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.role] - Optional role requirement (e.g. 'admin')
 */
const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();
  
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  
  const user = userStr ? JSON.parse(userStr) : null;

  // Check if authenticated and token exists
  if (!isAuthenticated || !token || !user) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement if specified
  if (role && user.role !== role) {
    // If user is not admin and trying to access admin page, redirect to their default dashboard
    if (user.role === "store_keeper") {
      return <Navigate to="/storekeeper/dashboard" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/manager/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
