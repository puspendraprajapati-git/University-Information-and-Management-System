import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FaGraduationCap, FaBook, FaCalendarCheck, FaAward } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import db from '../../data/db.json';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  // Find student details
  const student = db.students.find(s => s.user_id === user.user_id);
  const dept = db.departments.find(d => d.dept_id === student?.dept_id);
  
  // Mock performance data over semesters
  const performanceData = [
    { name: 'Sem 1', cgpa: 7.5 },
    { name: 'Sem 2', cgpa: 8.0 },
    { name: 'Sem 3', cgpa: 7.8 },
    { name: 'Sem 4', cgpa: 8.5 },
    { name: 'Sem 5', cgpa: 8.2 },
    { name: 'Sem 6', cgpa: student?.current_semester >= 6 ? 8.8 : null },
  ].filter(d => d.cgpa !== null);

  const stats = [
    { title: 'Current Semester', value: `Sem ${student?.current_semester || 'N/A'}`, icon: <FaGraduationCap />, color: 'primary' },
    { title: 'Attendance', value: '85%', icon: <FaCalendarCheck />, color: 'success' },
    { title: 'Current CGPA', value: '8.2', icon: <FaAward />, color: 'warning' },
    { title: 'Active Subjects', value: '6', icon: <FaBook />, color: 'info' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-body">Welcome back, {student?.full_name}!</h2>
        <p className="text-muted">{student?.enrollment_no} • {dept?.dept_name}</p>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div className="col-12 col-md-6 col-xl-3" key={idx}>
            <div className={`premium-card p-3 border-start border-4 border-${stat.color}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.8rem' }}>{stat.title}</p>
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
        <div className="col-12 col-lg-7">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold mb-4">Academic Performance Trend</h5>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1565C0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="cgpa" stroke="#1565C0" fillOpacity={1} fill="url(#colorCgpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Recent Notices</h5>
              <button className="btn btn-sm btn-outline-primary">View All</button>
            </div>
            
            <div className="list-group list-group-flush">
              {db.events.filter(e => e.type === 'news').slice(0, 4).map((event, idx) => (
                <div className="list-group-item bg-transparent px-0 py-3 d-flex align-items-start border-bottom" key={idx}>
                  <div className="bg-body-tertiary rounded p-2 text-center me-3" style={{ minWidth: '60px' }}>
                    <div className="fw-bold text-primary">{new Date(event.event_date).getDate()}</div>
                    <div className="text-body-secondary small">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</div>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{event.title}</h6>
                    <p className="text-body-secondary mb-0 small line-clamp-2">{event.description.substring(0, 60)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
