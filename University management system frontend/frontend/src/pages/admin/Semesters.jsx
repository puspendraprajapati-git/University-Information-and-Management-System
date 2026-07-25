import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const Semesters = () => {
  const [semesters, setSemesters] = useState(db.semesters);

  const columns = [
    { 
      header: 'Semester Name', 
      render: (row) => <span className="fw-bold">{row.semester_name}</span>
    },
    { 
      header: 'Year', 
      render: (row) => `Year ${row.year}`
    },
    { 
      header: 'Start Date', 
      render: (row) => new Date(row.start_date).toLocaleDateString()
    },
    { 
      header: 'End Date', 
      render: (row) => new Date(row.end_date).toLocaleDateString()
    },
    {
      header: 'Status',
      render: (row) => {
        const now = new Date();
        const start = new Date(row.start_date);
        const end = new Date(row.end_date);
        
        if (now >= start && now <= end) {
          return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">Active</span>;
        } else if (now > end) {
          return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">Completed</span>;
        } else {
          return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1">Upcoming</span>;
        }
      }
    }
  ];

  const handleView = (row) => toast.info(`Viewing details for ${row.semester_name}`);
  const handleEdit = (row) => toast.warning(`Editing ${row.semester_name}`);
  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete ${row.semester_name}?`)) {
      setSemesters(prev => prev.filter(s => s.semester_id !== row.semester_id));
      toast.success('Semester deleted successfully.');
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
          <h2 className="fw-bold text-body mb-1">Academic Semesters</h2>
          <p className="text-body-secondary mb-0">Manage university terms, durations, and academic years.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={semesters} 
        searchPlaceholder="Search semesters..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </motion.div>
  );
};

export default Semesters;
