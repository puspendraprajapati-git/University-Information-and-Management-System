// Import the common dashboard layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Import admin sidebar links
import { adminLinks } from "./components/layout/Sidebar";

// Admin dashboard route
<Route
  path="/admin/dashboard"
  element={
    // Allow only ADMIN users to access this page
    <ProtectedRoute allowedRoles={["ADMIN"]}>

      {/* Display the common dashboard layout */}
      <DashboardLayout links={adminLinks}>

        {/* Dashboard content */}
        <h3>Welcome, Admin</h3>

        <p>
          Use the sidebar to manage departments, semesters,
          subjects, faculty, and students.
        </p>

      </DashboardLayout>
    </ProtectedRoute>
  }
/>