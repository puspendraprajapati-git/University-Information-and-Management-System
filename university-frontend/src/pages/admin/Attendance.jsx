import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';

const Attendance = () => {
  const [attendance] = useState(db.attendance);

  const columns = [
    { 
      header: 'Date', 
      render: (row) => new Date(row.attendance_date).toLocaleDateString()
    },
    { 
      header: 'Student', 
      render: (row) => {
        const student = db.students.find(s => s.student_id === row.student_id);
        return <span className="fw-medium">{student?.full_name || 'N/A'}</span>;
      }
    },
    { 
      header: 'Subject', 
      render: (row) => {
        const subject = db.subjects.find(s => s.subject_id === row.subject_id);
        return <span className="text-muted">{subject?.subject_code || 'N/A'}</span>;
      }
    },
    {
      header: 'Semester',
      render: (row) => `Sem ${row.semester_id}`
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-body mb-1">Attendance Log</h2>
          <p className="text-muted mb-0">View all recorded attendance across the university.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={attendance} 
        searchPlaceholder="Search by status, date..."
      />
    </motion.div>
  );
};

export default Attendance;
