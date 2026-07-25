import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to respective dashboard if unauthorized for the current route
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'faculty') return <Navigate to="/faculty" replace />;
    if (user?.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
