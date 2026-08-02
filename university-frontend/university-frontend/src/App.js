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

function App() {
  return (
    // Provide authentication data to the entire application
    <AuthProvider>

      {/* Enable routing throughout the application */}
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

          {/* Admin Dashboard - Accessible only by ADMIN */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <div className="container mt-5">
                  <h2>Admin Dashboard (placeholder)</h2>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Faculty Dashboard - Accessible only by FACULTY */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={["FACULTY"]}>
                <div className="container mt-5">
                  <h2>Faculty Dashboard (placeholder)</h2>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Student Dashboard - Accessible only by STUDENT */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <div className="container mt-5">
                  <h2>Student Dashboard (placeholder)</h2>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Page shown when the user doesn't have permission */}
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