import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const Faculty = () => {
  // Mock State for faculty
  const [faculty, setFaculty] = useState(db.faculty);

  // Column definition for DataTable
  const columns = [
    { 
      header: 'ID / Code', 
      accessor: 'faculty_id',
      render: (row) => <span className="text-muted fw-medium">#{row.faculty_id}</span>
    },
    { 
      header: 'Faculty Name', 
      render: (row) => (
        <div className="d-flex align-items-center">
          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
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
        return <span className="badge bg-light text-body border">{dept?.dept_name || 'N/A'}</span>;
      }
    },
    { 
      header: 'Qualification', 
      accessor: 'qualification'
    },
    {
      header: 'Status',
      render: () => <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">Active</span>
    }
  ];

  // Actions handlers
  const handleView = (row) => toast.info(`Viewing details for ${row.full_name}`);
  const handleEdit = (row) => toast.warning(`Editing ${row.full_name}`);
  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete ${row.full_name}?`)) {
      setFaculty(prev => prev.filter(f => f.faculty_id !== row.faculty_id));
      toast.success('Faculty member deleted successfully.');
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
          <h2 className="fw-bold text-body mb-1">Faculty Management</h2>
          <p className="text-muted mb-0">Manage teaching staff, their assignments, and details.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={faculty} 
        searchPlaceholder="Search faculty by name..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </motion.div>
  );
};

export default Faculty;
