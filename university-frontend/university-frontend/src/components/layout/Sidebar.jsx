import React from "react";
import { NavLink } from "react-router-dom";

// Navigation links for the Admin dashboard
export const adminLinks = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/departments", label: "Departments" },
  { to: "/admin/semesters", label: "Semesters" },
  { to: "/admin/subjects", label: "Subjects" },
  { to: "/admin/faculty", label: "Faculty" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/fees", label: "Fee Management" },
];

// Navigation links for the Faculty dashboard
export const facultyLinks = [
  { to: "/faculty/dashboard", label: "Overview" },
  { to: "/faculty/profile", label: "My Profile" },
  { to: "/faculty/attendance", label: "Attendance" },
  { to: "/faculty/results", label: "Results" },
  { to: "/faculty/events", label: "Events & News" },
];

// Navigation links for the Student dashboard
export const studentLinks = [
  { to: "/student/dashboard", label: "Overview" },
  { to: "/student/profile", label: "My Profile" },
  { to: "/student/attendance", label: "My Attendance" },
  { to: "/student/results", label: "My Results" },
  { to: "/student/events", label: "Events & News" },
  { to: "/student/fees", label: "Financials" },
];

// Sidebar component
const Sidebar = ({ links = adminLinks }) => {
  return (
    // Sidebar container
    <div
      className="bg-light border-end vh-100 p-3"
      style={{ width: "220px" }}
    >
      {/* Navigation menu */}
      <ul className="nav nav-pills flex-column gap-1">

        {/* Generate menu items dynamically */}
        {links.map((link) => (
          <li className="nav-item" key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : "text-dark"}`
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