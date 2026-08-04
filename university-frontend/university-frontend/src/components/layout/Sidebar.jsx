import React from "react";
import { NavLink } from "react-router-dom";

export const adminLinks = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/departments", label: "Departments" },
  { to: "/admin/semesters", label: "Semesters" },
  { to: "/admin/subjects", label: "Subjects" },
  { to: "/admin/faculty", label: "Faculty" },
  { to: "/admin/students", label: "Students" },
];

export const facultyLinks = [
  { to: "/faculty/dashboard", label: "Overview" },
  { to: "/faculty/profile", label: "My Profile" },
  { to: "/faculty/attendance", label: "Attendance" },
  { to: "/faculty/results", label: "Results" },
  { to: "/faculty/events", label: "Events & News" },
];

export const studentLinks = [
  { to: "/student/dashboard", label: "Overview" },
  { to: "/student/profile", label: "My Profile" },
  { to: "/student/attendance", label: "My Attendance" },
  { to: "/student/results", label: "My Results" },
  { to: "/student/events", label: "Events & News" },
];

const Sidebar = ({ links = adminLinks }) => {
  return (
    <div
      className="bg-white border-end vh-100 p-3 shadow-sm"
      style={{ width: "240px" }}
    >
      <div className="mb-4 mt-2 px-2 text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
        Navigation
      </div>
      <ul className="nav nav-pills flex-column gap-2">
        {links.map((link) => (
          <li className="nav-item" key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `nav-link px-3 py-2 fw-medium rounded-3 ${isActive
                  ? "active bg-primary text-white shadow-sm"
                  : "text-secondary bg-transparent"
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
