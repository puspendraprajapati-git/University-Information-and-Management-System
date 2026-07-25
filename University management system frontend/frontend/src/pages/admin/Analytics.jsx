import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';

const Analytics = () => {
  const resultTrend = [
    { sem: 'Sem 1', passRate: 85, avgMarks: 70 },
    { sem: 'Sem 2', passRate: 88, avgMarks: 72 },
    { sem: 'Sem 3', passRate: 82, avgMarks: 68 },
    { sem: 'Sem 4', passRate: 90, avgMarks: 75 },
    { sem: 'Sem 5', passRate: 92, avgMarks: 78 },
    { sem: 'Sem 6', passRate: 89, avgMarks: 76 },
  ];

  const attendanceTrend = [
    { month: 'Jan', attendance: 92 },
    { month: 'Feb', attendance: 89 },
    { month: 'Mar', attendance: 85 },
    { month: 'Apr', attendance: 88 },
    { month: 'May', attendance: 90 },
    { month: 'Jun', attendance: 94 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-body mb-1">University Analytics</h2>
        <p className="text-muted">In-depth academic and operational metrics.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold mb-4">Overall Pass Rate Trend (by Semester)</h5>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resultTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="sem" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="passRate" stroke="#2E7D32" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="avgMarks" stroke="#F9A825" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold mb-4">Monthly Attendance Average</h5>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#29B6F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#29B6F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="attendance" stroke="#29B6F6" fillOpacity={1} fill="url(#colorAtt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
