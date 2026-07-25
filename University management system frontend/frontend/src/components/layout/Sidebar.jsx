import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, FaUsers, FaUserGraduate, FaChalkboardTeacher, 
  FaBuilding, FaBook, FaCalendarAlt, FaClipboardList, 
  FaChartBar, FaCog, FaSignOutAlt, FaAward, FaFileAlt, FaLayerGroup
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Sidebar = ({ isCollapsed, role }) => {
  const { logout } = useAuth();

  const adminLinks = [
    { path: '/admin', icon: <FaHome />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/students', icon: <FaUserGraduate />, label: 'Students' },
    { path: '/admin/faculty', icon: <FaChalkboardTeacher />, label: 'Faculty' },
    { path: '/admin/departments', icon: <FaBuilding />, label: 'Departments' },
    { path: '/admin/subjects', icon: <FaBook />, label: 'Subjects' },
    { path: '/admin/semesters', icon: <FaLayerGroup />, label: 'Semesters' },
    { path: '/admin/attendance', icon: <FaClipboardList />, label: 'Attendance' },
    { path: '/admin/results', icon: <FaAward />, label: 'Results' },
    { path: '/admin/events', icon: <FaCalendarAlt />, label: 'Events' },
    { path: '/admin/reports', icon: <FaFileAlt />, label: 'Reports' },
    { path: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  const facultyLinks = [
    { path: '/faculty', icon: <FaHome />, label: 'Dashboard' },
    { path: '/faculty/subjects', icon: <FaBook />, label: 'My Subjects' },
    { path: '/faculty/attendance', icon: <FaClipboardList />, label: 'Attendance' },
    { path: '/faculty/results', icon: <FaChartBar />, label: 'Results' },
    { path: '/faculty/events', icon: <FaCalendarAlt />, label: 'Events' },
  ];

  const studentLinks = [
    { path: '/student', icon: <FaHome />, label: 'Dashboard' },
    { path: '/student/subjects', icon: <FaBook />, label: 'Subjects' },
    { path: '/student/attendance', icon: <FaClipboardList />, label: 'Attendance' },
    { path: '/student/results', icon: <FaChartBar />, label: 'Results' },
    { path: '/student/events', icon: <FaCalendarAlt />, label: 'Events' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 250 }}
      className="border-end d-flex flex-column flex-shrink-0"
      style={{ backgroundColor: 'var(--sidebar-bg)', height: '100vh', position: 'sticky', top: 0, zIndex: 1000, overflowY: 'auto', overflowX: 'hidden', whiteSpace: 'nowrap' }}
    >
      <div className="p-3 d-flex align-items-center justify-content-center border-bottom" style={{ height: '70px' }}>
        <h4 className="m-0 fw-bold text-primary">
          {isCollapsed ? 'U' : 'UIMS'}
        </h4>
      </div>

      <div className="flex-grow-1 p-2">
        <ul className="nav nav-pills flex-column mb-auto">
          {links.map((link, idx) => (
            <li className="nav-item mb-1" key={idx}>
              <NavLink 
                to={link.path} 
                end={link.path === '/admin' || link.path === '/faculty' || link.path === '/student'}
                className={({ isActive }) => 
                  `nav-link d-flex align-items-center py-3 ${isActive ? 'active shadow-sm' : 'text-body'}`
                }
                style={{ borderRadius: '8px', transition: 'all 0.2s' }}
                title={isCollapsed ? link.label : ''}
              >
                <span className="fs-5">{link.icon}</span>
                {!isCollapsed && <span className="ms-3 fw-medium">{link.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 border-top">
        <button 
          onClick={logout} 
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
        >
          <FaSignOutAlt />
          {!isCollapsed && <span className="ms-2">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
