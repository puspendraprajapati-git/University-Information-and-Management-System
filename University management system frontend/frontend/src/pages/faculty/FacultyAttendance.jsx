import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const FacultyAttendance = () => {
  // In a real app, faculty would only see attendance for their own classes
  const [attendance, setAttendance] = useState(db.attendance);

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
        return <span className="text-body-secondary">{subject?.subject_code || 'N/A'}</span>;
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

  const handleEdit = (row) => toast.info(`Editing attendance for student ID: ${row.student_id}`);
  const handleDelete = (row) => {
    if (window.confirm('Are you sure you want to remove this attendance record?')) {
      setAttendance(prev => prev.filter(a => a.attendance_id !== row.attendance_id));
      toast.success('Record removed.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-body mb-1">Class Attendance</h2>
          <p className="text-body-secondary mb-0">Mark and manage daily attendance for your subjects.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={attendance} 
        searchPlaceholder="Search attendance records..."
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </motion.div>
  );
};

export default FacultyAttendance;
