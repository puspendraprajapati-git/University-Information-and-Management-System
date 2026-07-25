import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const Students = () => {
  // Mock State for students
  const [students, setStudents] = useState(db.students);

  // Column definition for DataTable
  const columns = [
    { header: 'Enrollment No', accessor: 'enrollment_no' },
    { 
      header: 'Full Name', 
      render: (row) => (
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
            {row.full_name.charAt(0)}
          </div>
          <span className="fw-medium">{row.full_name}</span>
        </div>
      )
    },
    { 
      header: 'Department', 
      render: (row) => {
        const dept = db.departments.find(d => d.dept_id === row.dept_id);
        return <span className="badge bg-light text-body border">{dept?.dept_code || 'N/A'}</span>;
      }
    },
    { 
      header: 'Semester', 
      render: (row) => `Sem ${row.current_semester}`
    },
    { 
      header: 'DOB', 
      render: (row) => new Date(row.date_of_birth).toLocaleDateString()
    }
  ];

  // Actions handlers
  const handleView = (row) => toast.info(`Viewing details for ${row.full_name}`);
  const handleEdit = (row) => toast.warning(`Editing ${row.full_name}`);
  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete ${row.full_name}?`)) {
      setStudents(prev => prev.filter(s => s.student_id !== row.student_id));
      toast.success('Student deleted successfully.');
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
          <h2 className="fw-bold text-body mb-1">Students Management</h2>
          <p className="text-muted mb-0">Manage university student records, enrollments, and academic details.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={students} 
        searchPlaceholder="Search students by name, enrollment no..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </motion.div>
  );
};

export default Students;
