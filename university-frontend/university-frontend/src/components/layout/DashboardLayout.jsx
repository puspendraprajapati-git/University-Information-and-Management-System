import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children, links }) => {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f8fafc" }}>
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar links={links} />
        <div className="flex-grow-1 p-4 p-lg-5" style={{ minWidth: 0 }}>
          <div className="container-fluid px-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
