import DashboardLayout from "./components/layout/DashboardLayout";

import { adminLinks } from "./components/layout/Sidebar";

<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>

      {}
      <DashboardLayout links={adminLinks}>

        {}
        <h3>Welcome, Admin</h3>

        <p>
          Use the sidebar to manage departments, semesters,
          subjects, faculty, and students.
        </p>

      </DashboardLayout>
    </ProtectedRoute>
  }
/>
