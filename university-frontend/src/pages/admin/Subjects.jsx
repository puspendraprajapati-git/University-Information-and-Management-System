import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const Subjects = () => {
  const [subjects, setSubjects] = useState(db.subjects);

  const columns = [
    { 
      header: 'Subject Code', 
      accessor: 'subject_code',
      render: (row) => <span className="fw-bold">{row.subject_code}</span>
    },
    { 
      header: 'Subject Name', 
      accessor: 'subject_name'
    },
    { 
      header: 'Department', 
      render: (row) => {
        const dept = db.departments.find(d => d.dept_id === row.dept_id);
        return <span className="text-muted">{dept?.dept_code || 'N/A'}</span>;
      }
    },
    {
      header: 'Semester',
      render: (row) => `Sem ${row.semester_id}`
    },
    {
      header: 'Credits',
      render: (row) => <span className="badge bg-secondary">{row.credits} Credits</span>
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
          <h2 className="fw-bold text-body mb-1">Subjects Management</h2>
          <p className="text-muted mb-0">Manage course catalog, credits, and syllabus files.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={subjects} 
        searchPlaceholder="Search subjects by code or name..."
        onView={(row) => toast.info(`Viewing ${row.subject_name}`)}
        onEdit={(row) => toast.warning(`Editing ${row.subject_name}`)}
        onDelete={(row) => toast.success(`Deleted ${row.subject_name}`)}
      />
    </motion.div>
  );
};

export default Subjects;
