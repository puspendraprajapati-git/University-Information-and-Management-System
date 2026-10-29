import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import {
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
  Briefcase,
  BookMarked,
} from 'lucide-react';

import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ProtectedRoute from './components/common/ProtectedRoute';
import Chatbot from './components/common/Chatbot';
import DashboardOverview from './components/common/DashboardOverview';

import DashboardLayout from './components/layout/DashboardLayout';

import { adminLinks, facultyLinks, studentLinks } from './components/layout/Sidebar';

import AdminDepartments from './pages/admin/Departments';
import AdminSemesters from './pages/admin/Semesters';
import AdminSubjects from './pages/admin/Subjects';
import AdminFaculty from './pages/admin/Faculty';
import AdminStudents from './pages/admin/Students';
import AdminFees from './pages/admin/Fees';

import FacultyProfile from './pages/faculty/Profile';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyResult from './pages/faculty/Result';
import FacultyEvents from './pages/faculty/Events';
import FacultyAssignments from './pages/faculty/Assignments';
import FacultyResources from './pages/faculty/Resources';

import StudentProfile from './pages/student/Profile';
import StudentAttendance from './pages/student/Attendance';
import StudentResults from './pages/student/Results';
import StudentEvents from './pages/student/Events';
import StudentAssignments from './pages/student/Assignments';
import StudentResources from './pages/student/Resources';
import StudentFees from './pages/student/Fees';
import StudentExams from './pages/student/Exams';
import StudentPlacements from './pages/student/Placements';
import FacultyTimetable from './pages/faculty/Timetable';
import AdminExams from './pages/admin/Exams';
import AdminPlacements from './pages/admin/Placements';
import AdminLibrary from './pages/admin/Library';
import StudentLibrary from './pages/student/Library';
import Announcements from './pages/common/Announcements';

function App() {
  const adminCards = [
    {
      title: "Departments",
      description: "Manage academic departments, department codes, and assigned Heads of Department.",
      to: "/admin/departments",
      icon: Building2,
      bgColor: "#eef2ff",
      color: "#4f46e5",
      badge: "Structure",
    },
    {
      title: "Semesters",
      description: "Configure academic semesters, semester terms, and academic calendar sessions.",
      to: "/admin/semesters",
      icon: Calendar,
      bgColor: "#ecfdf5",
      color: "#059669",
      badge: "Curriculum",
    },
    {
      title: "Subjects",
      description: "Define subject syllabuses, course credits, and department subject allocations.",
      to: "/admin/subjects",
      icon: BookOpen,
      bgColor: "#fef3c7",
      color: "#d97706",
      badge: "Courses",
    },
    {
      title: "Faculty",
      description: "View and manage faculty records, department assignments, and contact details.",
      to: "/admin/faculty",
      icon: Users,
      bgColor: "#f3e8ff",
      color: "#9333ea",
      badge: "Staff",
    },
    {
      title: "Students",
      description: "Manage student enrollments, academic records, and student directory profiles.",
      to: "/admin/students",
      icon: GraduationCap,
      bgColor: "#e0f2fe",
      color: "#0284c7",
      badge: "Students",
    },
    {
      title: "Fees & Accounts",
      description: "Set course fee structures, bill semester invoices, and audit university receipts.",
      to: "/admin/fees",
      icon: CreditCard,
      bgColor: "#fef3c7",
      color: "#b45309",
      badge: "Finance",
    },
    {
      title: "Placements & Career",
      description: "Publish hiring drives, configure academic eligibility rules, and coordinate interview rounds.",
      to: "/admin/placements",
      icon: Briefcase,
      bgColor: "#e0e7ff",
      color: "#4338ca",
      badge: "Careers",
    },
    {
      title: "Library Management",
      description: "Manage book catalog, multi-copy physical inventory, circulation lending, overdue fines, and reservations.",
      to: "/admin/library",
      icon: BookMarked,
      bgColor: "#e0e7ff",
      color: "#4338ca",
      badge: "Library",
    },
  ];

  const facultyCards = [
    {
      title: "My Profile",
      description: "View and update your faculty profile details, specialization, and department information.",
      to: "/faculty/profile",
      icon: User,
      bgColor: "#eef2ff",
      color: "#4f46e5",
      badge: "Profile",
    },
    {
      title: "Attendance",
      description: "Record and manage student attendance daily across assigned semesters and subjects.",
      to: "/faculty/attendance",
      icon: ClipboardList,
      bgColor: "#ecfdf5",
      color: "#059669",
      badge: "Daily",
    },
    {
      title: "Student Results",
      description: "Enter semester exam scores, calculate GPA, and publish final student results.",
      to: "/faculty/results",
      icon: Award,
      bgColor: "#fef3c7",
      color: "#d97706",
      badge: "Grading",
    },
    {
      title: "Assignments",
      description: "Publish course assignments, review student code submissions, and grade submissions.",
      to: "/faculty/assignments",
      icon: FileText,
      bgColor: "#fef2f2",
      color: "#dc2626",
      badge: "Coursework",
    },
    {
      title: "Study Resources",
      description: "Upload lecture notes, sample code, presentations, and syllabus documents.",
      to: "/faculty/resources",
      icon: FolderGit2,
      bgColor: "#f0fdf4",
      color: "#16a34a",
      badge: "Materials",
    },
    {
      title: "Events & News",
      description: "Post university announcements, workshop notices, and view campus calendar events.",
      to: "/faculty/events",
      icon: Bell,
      bgColor: "#f3e8ff",
      color: "#9333ea",
      badge: "Updates",
    },
  ];

  const studentCards = [
    {
      title: "My Profile",
      description: "View your personal student record, enrollment details, and academic contacts.",
      to: "/student/profile",
      icon: User,
      bgColor: "#eef2ff",
      color: "#4f46e5",
      badge: "Profile",
    },
    {
      title: "My Attendance",
      description: "Check your subject-wise attendance percentage and track class participation.",
      to: "/student/attendance",
      icon: ClipboardList,
      bgColor: "#ecfdf5",
      color: "#059669",
      badge: "Records",
    },
    {
      title: "My Results",
      description: "View published semester grades, subject-wise marks, and overall GPA performance.",
      to: "/student/results",
      icon: Award,
      bgColor: "#fef3c7",
      color: "#d97706",
      badge: "Grades",
    },
    {
      title: "Assignments",
      description: "View active homework assignments, upload code solutions, and check grades.",
      to: "/student/assignments",
      icon: FileText,
      bgColor: "#fef2f2",
      color: "#dc2626",
      badge: "Coursework",
    },
    {
      title: "Study Resources",
      description: "Download lecture notes, reference PDFs, and source code samples.",
      to: "/student/resources",
      icon: FolderGit2,
      bgColor: "#f0fdf4",
      color: "#16a34a",
      badge: "Materials",
    },
    {
      title: "Fees & Payments",
      description: "View pending semester bills, pay via Razorpay, and download payment receipts.",
      to: "/student/fees",
      icon: CreditCard,
      bgColor: "#ecfdf5",
      color: "#059669",
      badge: "Finance",
    },
    {
      title: "Placements & Career",
      description: "Explore campus openings, check academic eligibility, apply for jobs, and view interview rounds.",
      to: "/student/placements",
      icon: Briefcase,
      bgColor: "#ecfdf5",
      color: "#059669",
      badge: "Opportunities",
    },
    {
      title: "Library & Books",
      description: "Search textbook catalog, check shelf availability, manage borrowed book loans, and view overdue fines.",
      to: "/student/library",
      icon: BookMarked,
      bgColor: "#eef2ff",
      color: "#4f46e5",
      badge: "Catalog",
    },
    {
      title: "Events & Announcements",
      description: "Stay up-to-date with upcoming campus activities, workshops, and exam schedules.",
      to: "/student/events",
      icon: Bell,
      bgColor: "#f3e8ff",
      color: "#9333ea",
      badge: "Campus",
    },
  ];

  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout links={adminLinks}>
                  <DashboardOverview
                    title="Admin Dashboard"
                    subtitle="Manage university departments, courses, faculty, and student directories."
                    cards={adminCards}
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDepartments /></ProtectedRoute>} />
          <Route path="/admin/semesters" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSemesters /></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSubjects /></ProtectedRoute>} />
          <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFaculty /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFees /></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminExams /></ProtectedRoute>} />
          <Route path="/admin/placements" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPlacements /></ProtectedRoute>} />
          <Route path="/admin/library" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLibrary /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['ADMIN']}><Announcements /></ProtectedRoute>} />

          {/* Faculty Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <DashboardLayout links={facultyLinks}>
                  <DashboardOverview
                    title="Faculty Portal"
                    subtitle="Manage student attendance records, exam grades, and upcoming campus events."
                    cards={facultyCards}
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/faculty/profile" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyProfile /></ProtectedRoute>} />
          <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyAttendance /></ProtectedRoute>} />
          <Route path="/faculty/results" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyResult /></ProtectedRoute>} />
          <Route path="/faculty/assignments" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyAssignments /></ProtectedRoute>} />
          <Route path="/faculty/resources" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyResources /></ProtectedRoute>} />
          <Route path="/faculty/timetable" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyTimetable /></ProtectedRoute>} />
          <Route path="/faculty/announcements" element={<ProtectedRoute allowedRoles={['FACULTY']}><Announcements /></ProtectedRoute>} />
          <Route path="/faculty/events" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyEvents /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout links={studentLinks}>
                  <DashboardOverview
                    title="Student Portal"
                    subtitle="Monitor your attendance, view semester results, and stay informed on campus updates."
                    cards={studentCards}
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentAttendance /></ProtectedRoute>} />
          <Route path="/student/results" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentResults /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/resources" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentResources /></ProtectedRoute>} />
          <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentFees /></ProtectedRoute>} />
          <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentExams /></ProtectedRoute>} />
          <Route path="/student/placements" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentPlacements /></ProtectedRoute>} />
          <Route path="/student/library" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentLibrary /></ProtectedRoute>} />
          <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={['STUDENT']}><Announcements /></ProtectedRoute>} />
          <Route path="/student/events" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentEvents /></ProtectedRoute>} />

          {/* Unauthorized & Fallback */}
          <Route
            path="/unauthorized"
            element={
              <div className="container py-5 text-center">
                <h3 className="fw-bold text-danger">403 - Unauthorized Access</h3>
                <p className="text-muted">You do not have permission to view this page.</p>
              </div>
            }
          />

          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <Chatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
