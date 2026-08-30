import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import CompleteProfile from "../../pages/auth/CompleteProfile";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user || (user.role !== 'STUDENT' && user.role !== 'FACULTY')) {
        setProfileLoading(false);
        return;
      }
      try {
        if (user.role === 'STUDENT') {
          await axiosInstance.get(`/students/user/${user.userId}`);
        } else if (user.role === 'FACULTY') {
          await axiosInstance.get(`/faculty/user/${user.userId}`);
        }
        setNeedsProfile(false);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNeedsProfile(true);
        }
      } finally {
        setProfileLoading(false);
      }
    };
    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  if (loading || profileLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (needsProfile) {
    return <CompleteProfile role={user.role} />;
  }

  return children;
};

export default ProtectedRoute;
