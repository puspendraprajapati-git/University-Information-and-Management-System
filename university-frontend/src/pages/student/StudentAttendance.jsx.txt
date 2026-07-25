import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';

const StudentAttendance = () => {
  const { user } = useAuth();
  
  // Find student and their attendance
  const student = db.students.find(s => s.user_id === user.user_id);
  const myAttendance = db.attendance.filter(a => a.student_id === student?.student_id);

  const columns = [
    { 
      header: 'Date', 
      render: (row) => new Date(row.attendance_date).toLocaleDateString()
    },
    { 
      header: 'Subject', 
      render: (row) => {
        const subject = db.subjects.find(s => s.subject_id === row.subject_id);
        return <span className="fw-medium text-body">{subject?.subject_name || 'N/A'}</span>;
      }
    },
    {
      header: 'Status',
      render: (row) => {
        let badgeColor = 'bg-secondary';
        if (row.status === 'Present') badgeColor = 'bg-success';
        if (row.status === 'Absent') badgeColor = 'bg-danger';
        if (row.status === 'Late') badgeColor = 'bg-warning';

        return <span className={`badge ${badgeColor}`}>{row.status}</span>;
      }
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-body mb-1">My Attendance Records</h2>
        <p className="text-body-secondary">Track your daily attendance and subject presence.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={myAttendance} 
        searchPlaceholder="Search by date or status..."
      />
    </motion.div>
  );
};

export default StudentAttendance;
