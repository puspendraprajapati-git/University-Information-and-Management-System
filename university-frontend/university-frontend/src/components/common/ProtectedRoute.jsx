import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// This component protects routes from unauthorized access
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get the logged-in user and loading status from AuthContext
  const { user, loading } = useAuth();

  // Show a loading message while checking authentication
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  // If no user is logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if the logged-in user has permission to access this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authentication and role checks pass, render the requested page
  return children;
};

export default ProtectedRoute;