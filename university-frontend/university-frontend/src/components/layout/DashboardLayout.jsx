import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// Common layout used by all dashboards
const DashboardLayout = ({ children, links }) => {
  return (
    <div>

      {/* Display the navigation bar at the top */}
      <Navbar />

      {/* Arrange the sidebar and page content side by side */}
      <div className="d-flex">

        {/* Display sidebar navigation links */}
        <Sidebar links={links} />

        {/* Main content area */}
        <div
          className="flex-grow-1 p-4"
          style={{
            backgroundColor: "#f8f9fa",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          {children}
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;