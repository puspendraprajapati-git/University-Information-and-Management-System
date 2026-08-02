import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Import authentication context
import { AuthProvider } from "./context/AuthContext";

// Import authentication pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Import protected route component
import ProtectedRoute from "./components/common/ProtectedRoute";

// Import common dashboard layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Import sidebar links for different user roles
import {
  adminLinks,
  facultyLinks,
  studentLinks,
} from "./components/layout/Sidebar";

function App() {
  return (
    // Provide authentication data to the entire application
    <AuthProvider>

      {/* Enable routing */}
      <BrowserRouter>

        {/* Display toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
        />

        {/* Define all application routes */}
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout links={adminLinks}>
                  <h2>Admin Dashboard (coming in Phase 8)</h2>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Faculty Dashboard */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={["FACULTY"]}>
                <DashboardLayout links={facultyLinks}>
                  <h3>Welcome, Faculty</h3>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Dashboard */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <DashboardLayout links={studentLinks}>
                  <h3>Welcome, Student</h3>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Display when the user doesn't have permission */}
          <Route
            path="/unauthorized"
            element={
              <div className="container mt-5">
                <h3>403 - Unauthorized</h3>
              </div>
            }
          />

          {/* Redirect the default route to the login page */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;