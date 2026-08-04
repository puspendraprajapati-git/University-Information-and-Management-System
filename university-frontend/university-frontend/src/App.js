import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ProtectedRoute from './components/common/ProtectedRoute';

import DashboardLayout from './components/layout/DashboardLayout';

import { adminLinks, facultyLinks, studentLinks } from './components/layout/Sidebar';

import AdminDepartments from './pages/admin/Departments';
import AdminSemesters from './pages/admin/Semesters';
import AdminSubjects from './pages/admin/Subjects';
import AdminFaculty from './pages/admin/Faculty';
import AdminStudents from './pages/admin/Students';

import FacultyProfile from './pages/faculty/Profile';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyResult from './pages/faculty/Result';
import FacultyEvents from './pages/faculty/Events';

import StudentProfile from './pages/student/Profile';
import StudentAttendance from './pages/student/Attendance';
import StudentResults from './pages/student/Results';
import StudentEvents from './pages/student/Events';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        {}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
        />

        <Routes>

          {}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout links={adminLinks}>
                  <h2>Admin Dashboard</h2>
                  <p>
                    Manage departments, semesters, subjects, faculty, students,
                    and other university modules.
                  </p>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDepartments /></ProtectedRoute>} />
          <Route path="/admin/semesters" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSemesters /></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSubjects /></ProtectedRoute>} />
          <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFaculty /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStudents /></ProtectedRoute>} />

          {}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <DashboardLayout links={facultyLinks}>
                  <h3>Welcome, Faculty</h3>
                  <p>
                    Manage attendance, results, events, and student-related
                    academic activities.
                  </p>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/faculty/profile" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyProfile /></ProtectedRoute>} />
          <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyAttendance /></ProtectedRoute>} />
          <Route path="/faculty/results" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyResult /></ProtectedRoute>} />
          <Route path="/faculty/events" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyEvents /></ProtectedRoute>} />

          {}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout links={studentLinks}>
                  <h3>Welcome, Student</h3>
                  <p>
                    View profile, attendance, results, fees, and university
                    updates.
                  </p>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentAttendance /></ProtectedRoute>} />
          <Route path="/student/results" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentResults /></ProtectedRoute>} />
          <Route path="/student/events" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentEvents /></ProtectedRoute>} />

          {}
          <Route
            path="/unauthorized"
            element={
              <div className="container mt-5">
                <h3>403 - Unauthorized Access</h3>
              </div>
            }
          />

          {}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;