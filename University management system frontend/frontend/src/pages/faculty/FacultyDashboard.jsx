import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaClipboardCheck, FaFileAlt, FaBullhorn } from 'react-icons/fa';
import db from '../../data/db.json';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const faculty = db.faculty.find(f => f.user_id === user.user_id);
  const dept = db.departments.find(d => d.dept_id === faculty?.dept_id);

  const stats = [
    { title: 'My Subjects', value: '3', icon: <FaFileAlt />, color: 'primary' },
    { title: 'Total Students', value: '120', icon: <FaUsers />, color: 'success' },
    { title: 'Pending Attendance', value: '2', icon: <FaClipboardCheck />, color: 'warning' },
    { title: 'Notices Posted', value: '5', icon: <FaBullhorn />, color: 'danger' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-body">Welcome, Prof. {faculty?.full_name}</h2>
        <p className="text-body-secondary">{dept?.dept_name} • {faculty?.qualification}</p>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div className="col-12 col-md-6 col-xl-3" key={idx}>
            <div className={`premium-card p-3 border-start border-4 border-${stat.color}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-body-secondary mb-1 text-uppercase fw-bold" style={{ fontSize: '0.8rem' }}>{stat.title}</p>
                  <h3 className="fw-bold mb-0">{stat.value}</h3>
                </div>
                <div className={`text-${stat.color} fs-1 opacity-50`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Today's Schedule</h5>
              <button className="btn btn-sm btn-primary">Mark Attendance</button>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="bg-body-tertiary text-body-secondary">
                  <tr>
                    <th className="bg-transparent border-bottom">Time</th>
                    <th className="bg-transparent border-bottom">Subject</th>
                    <th className="bg-transparent border-bottom">Semester</th>
                    <th className="bg-transparent border-bottom">Action</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: 'none' }}>
                  <tr>
                    <td>09:00 AM</td>
                    <td><span className="fw-bold">Database Management</span></td>
                    <td>Semester 3</td>
                    <td><button className="btn btn-sm btn-outline-success">Done</button></td>
                  </tr>
                  <tr>
                    <td>11:30 AM</td>
                    <td><span className="fw-bold">Operating Systems</span></td>
                    <td>Semester 4</td>
                    <td><button className="btn btn-sm btn-primary">Pending</button></td>
                  </tr>
                  <tr>
                    <td>02:00 PM</td>
                    <td><span className="fw-bold">Computer Networks</span></td>
                    <td>Semester 5</td>
                    <td><button className="btn btn-sm btn-secondary" disabled>Upcoming</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold mb-4">Quick Actions</h5>
            <div className="d-grid gap-3">
              <button className="btn bg-body-tertiary text-body border py-3 text-start d-flex align-items-center">
                <div className="bg-primary text-white rounded p-2 me-3"><FaClipboardCheck /></div>
                <div className="fw-bold">Upload Results</div>
              </button>
              <button className="btn bg-body-tertiary text-body border py-3 text-start d-flex align-items-center">
                <div className="bg-success text-white rounded p-2 me-3"><FaFileAlt /></div>
                <div className="fw-bold">Upload Notes / Syllabus</div>
              </button>
              <button className="btn bg-body-tertiary text-body border py-3 text-start d-flex align-items-center">
                <div className="bg-warning text-white rounded p-2 me-3"><FaBullhorn /></div>
                <div className="fw-bold">Make Announcement</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyDashboard;
