import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  BookOpen,
  Users,
  GraduationCap,
  User,
  ClipboardList,
  Award,
  Bell,
  FileText,
  FolderGit2,
  CreditCard,
  Megaphone,
  Briefcase,
  BookMarked,
} from "lucide-react";

export const adminLinks = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/semesters", label: "Semesters", icon: Calendar },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/faculty", label: "Faculty", icon: Users },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/fees", label: "Fees & Invoices", icon: CreditCard },
  { to: "/admin/exams", label: "Exams & Timetable", icon: Calendar },
  { to: "/admin/placements", label: "Placements & Career", icon: Briefcase },
  { to: "/admin/library", label: "Library Management", icon: BookMarked },
  { to: "/admin/announcements", label: "Campus Notices", icon: Megaphone },
];

export const facultyLinks = [
  { to: "/faculty/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/faculty/profile", label: "My Profile", icon: User },
  { to: "/faculty/attendance", label: "Attendance", icon: ClipboardList },
  { to: "/faculty/results", label: "Results", icon: Award },
  { to: "/faculty/assignments", label: "Assignments", icon: FileText },
  { to: "/faculty/resources", label: "Study Resources", icon: FolderGit2 },
  { to: "/faculty/timetable", label: "Teaching Timetable", icon: Calendar },
  { to: "/faculty/announcements", label: "Campus Notices", icon: Megaphone },
  { to: "/faculty/events", label: "Events & News", icon: Bell },
];

export const studentLinks = [
  { to: "/student/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/student/profile", label: "My Profile", icon: User },
  { to: "/student/attendance", label: "My Attendance", icon: ClipboardList },
  { to: "/student/results", label: "My Results", icon: Award },
  { to: "/student/assignments", label: "Assignments", icon: FileText },
  { to: "/student/resources", label: "Study Resources", icon: FolderGit2 },
  { to: "/student/fees", label: "Fees & Payments", icon: CreditCard },
  { to: "/student/exams", label: "Exams & Hall Ticket", icon: Calendar },
  { to: "/student/placements", label: "Placements & Career", icon: Briefcase },
  { to: "/student/library", label: "Library & Books", icon: BookMarked },
  { to: "/student/announcements", label: "Campus Notices", icon: Megaphone },
  { to: "/student/events", label: "Events & News", icon: Bell },
];

const Sidebar = ({ links = adminLinks }) => {
  return (
    <div
      className="bg-white border-end p-3 shadow-sm d-flex flex-column"
      style={{ width: "250px", minHeight: "calc(100vh - 65px)" }}
    >
      <div
        className="mb-3 mt-1 px-3 text-uppercase text-muted fw-bold"
        style={{ fontSize: "0.72rem", letterSpacing: "1.2px" }}
      >
        Menu
      </div>
      <ul className="nav nav-pills flex-column gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li className="nav-item" key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 px-3 py-2 fw-medium rounded-3 ${
                    isActive
                      ? "active text-white shadow-sm"
                      : "text-secondary"
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive
                    ? "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)"
                    : "transparent",
                  fontSize: "0.92rem",
                  transition: "all 0.15s ease",
                })}
              >
                {Icon && <Icon size={18} />}
                <span>{link.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
