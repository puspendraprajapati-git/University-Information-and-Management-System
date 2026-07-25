import React from 'react';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaChalkboardTeacher, FaBuilding, FaBook } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import db from '../../data/db.json';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Students', value: db.students.length, icon: <FaUserGraduate />, color: 'primary' },
    { title: 'Total Faculty', value: db.faculty.length, icon: <FaChalkboardTeacher />, color: 'success' },
    { title: 'Departments', value: db.departments.length, icon: <FaBuilding />, color: 'warning' },
    { title: 'Subjects', value: db.subjects.length, icon: <FaBook />, color: 'danger' },
  ];

  // Dummy data for charts
  const studentGrowthData = [
    { name: '2021', students: 400 },
    { name: '2022', students: 600 },
    { name: '2023', students: 800 },
    { name: '2024', students: 1000 },
  ];

  const facultyDistData = db.departments.map(dept => {
    return {
      name: dept.dept_code,
      value: db.faculty.filter(f => f.dept_id === dept.dept_id).length
    };
  });
  const COLORS = ['#0F4C81', '#1565C0', '#29B6F6', '#2E7D32', '#F9A825', '#D32F2F', '#8E44AD', '#E67E22', '#16A085', '#2C3E50'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-body">Admin Dashboard</h2>
        <button className="btn btn-primary">Generate Report</button>
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
        <div className="col-12 col-lg-8">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold mb-4">Student Enrollment Growth</h5>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                  <Bar dataKey="students" fill="#0F4C81" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold mb-4">Faculty Distribution</h5>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={facultyDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {facultyDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-3">
              <small className="text-muted">Distribution across {db.departments.length} departments</small>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
