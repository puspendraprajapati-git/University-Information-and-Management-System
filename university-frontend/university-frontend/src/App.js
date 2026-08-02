import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { AuthProvider } from './context/AuthContext';

// Authentication pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Route protection for role-based access
import ProtectedRoute from './components/common/ProtectedRoute';

// Common dashboard layout
import DashboardLayout from './components/layout/DashboardLayout';

// Sidebar menu links for different user roles
import { adminLinks, facultyLinks, studentLinks } from './components/layout/Sidebar';


function App() {
  return (
    // AuthProvider makes login user data available throughout the application
    <AuthProvider>
      <BrowserRouter>

        {/* Global toast notification container */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
        />

        <Routes>

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          {/* Admin dashboard - accessible only for ADMIN role */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout links={adminLinks}>
                  <h2>Admin Dashboard</h2>
                  <p>
                    Manage departments, semesters, subjects, faculty, students,
                    and other university modules.
                  </p>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          {/* Faculty dashboard - accessible only for FACULTY role */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <DashboardLayout links={facultyLinks}>
                  <h3>Welcome, Faculty</h3>
                  <p>
                    Manage attendance, results, events, and student-related
                    academic activities.
                  </p>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          {/* Student dashboard - accessible only for STUDENT role */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout links={studentLinks}>
                  <h3>Welcome, Student</h3>
                  <p>
                    View profile, attendance, results, fees, and university
                    updates.
                  </p>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          {/* Access denied page */}
          <Route
            path="/unauthorized"
            element={
              <div className="container mt-5">
                <h3>403 - Unauthorized Access</h3>
              </div>
            }
          />


          {/* Redirect unknown paths to login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;