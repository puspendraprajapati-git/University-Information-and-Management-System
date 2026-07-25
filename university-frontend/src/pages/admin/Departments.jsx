import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const Departments = () => {
  const [departments, setDepartments] = useState(db.departments);

  const columns = [
    { 
      header: 'Code', 
      accessor: 'dept_code',
      render: (row) => <span className="badge bg-primary px-2 py-1">{row.dept_code}</span>
    },
    { 
      header: 'Department Name', 
      render: (row) => <span className="fw-medium">{row.dept_name}</span>
    },
    { 
      header: 'HOD', 
      render: (row) => {
        const hod = db.faculty.find(f => f.faculty_id === row.hod_id);
        return hod ? hod.full_name : <span className="text-muted">Not Assigned</span>;
      }
    },
    {
      header: 'Total Faculty',
      render: (row) => {
        const count = db.faculty.filter(f => f.dept_id === row.dept_id).length;
        return <span>{count} Members</span>;
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
          <h2 className="fw-bold text-body mb-1">Departments</h2>
          <p className="text-muted mb-0">Manage university departments and HOD assignments.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={departments} 
        searchPlaceholder="Search departments..."
        onView={(row) => toast.info(`Viewing ${row.dept_name}`)}
        onEdit={(row) => toast.warning(`Editing ${row.dept_name}`)}
        onDelete={(row) => toast.success(`Deleted ${row.dept_name}`)}
      />
    </motion.div>
  );
};

export default Departments;
