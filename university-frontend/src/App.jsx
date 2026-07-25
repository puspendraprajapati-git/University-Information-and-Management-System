import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import Layout from './layouts/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Students from './pages/admin/Students';
import Faculty from './pages/admin/Faculty';
import Departments from './pages/admin/Departments';
import Subjects from './pages/admin/Subjects';
import Semesters from './pages/admin/Semesters';
import Attendance from './pages/admin/Attendance';
import Results from './pages/admin/Results';
import Events from './pages/admin/Events';
import Reports from './pages/admin/Reports';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultySubjects from './pages/faculty/FacultySubjects';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyResults from './pages/faculty/FacultyResults';
import FacultyEvents from './pages/faculty/FacultyEvents';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentResults from './pages/student/StudentResults';
import StudentEvents from './pages/student/StudentEvents';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route element={<RoleRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/students" element={<Students />} />
                  <Route path="/admin/faculty" element={<Faculty />} />
                  <Route path="/admin/departments" element={<Departments />} />
                  <Route path="/admin/subjects" element={<Subjects />} />
                  <Route path="/admin/semesters" element={<Semesters />} />
                  <Route path="/admin/attendance" element={<Attendance />} />
                  <Route path="/admin/results" element={<Results />} />
                  <Route path="/admin/events" element={<Events />} />
                  <Route path="/admin/reports" element={<Reports />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/settings" element={<Settings />} />
                </Route>

                <Route element={<RoleRoute allowedRoles={['faculty']} />}>
                  <Route path="/faculty" element={<FacultyDashboard />} />
                  <Route path="/faculty/subjects" element={<FacultySubjects />} />
                  <Route path="/faculty/attendance" element={<FacultyAttendance />} />
                  <Route path="/faculty/results" element={<FacultyResults />} />
                  <Route path="/faculty/events" element={<FacultyEvents />} />
                </Route>

                <Route element={<RoleRoute allowedRoles={['student']} />}>
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/student/subjects" element={<StudentSubjects />} />
                  <Route path="/student/attendance" element={<StudentAttendance />} />
                  <Route path="/student/results" element={<StudentResults />} />
                  <Route path="/student/events" element={<StudentEvents />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


