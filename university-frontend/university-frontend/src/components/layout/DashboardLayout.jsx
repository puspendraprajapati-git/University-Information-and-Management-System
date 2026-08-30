import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
const DashboardLayout = ({ children, links }) => {
  return (
    <div>

      {}
      <Navbar />

      {}
      <div className="d-flex">

        {}
        <Sidebar links={links} />

        {}
        <div
          className="flex-grow-1 p-4 p-md-5"
          style={{
            minHeight: "calc(100vh - 72px)",
          }}
        >
          {children}
        </div>
      </div>

    </div>
  );
};

export default DashboardLayout;
