import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const Results = () => {
  const [results, setResults] = useState(db.results);

  const columns = [
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
      header: 'Semester',
      render: (row) => `Sem ${row.semester_id}`
    },
    {
      header: 'Marks',
      render: (row) => (
        <span className="text-body-secondary small">
          T: {row.theory_marks} | P: {row.practical_marks} | <strong className="text-body">Tot: {row.total_marks}</strong>
        </span>
      )
    },
    {
      header: 'Grade',
      render: (row) => {
        let badgeColor = 'bg-secondary';
        if (row.grade === 'O' || row.grade === 'A+') badgeColor = 'bg-success';
        else if (row.grade === 'A' || row.grade === 'B+') badgeColor = 'bg-primary';
        else if (row.grade === 'B' || row.grade === 'C') badgeColor = 'bg-warning';
        else if (row.grade === 'F') badgeColor = 'bg-danger';

        return <span className={`badge ${badgeColor} text-white`}>{row.grade}</span>;
      }
    }
  ];

  const handleView = (row) => toast.info(`Viewing result details.`);
  const handleEdit = (row) => toast.warning(`Editing marks.`);
  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete this result?`)) {
      setResults(prev => prev.filter(r => r.result_id !== row.result_id));
      toast.success('Result deleted successfully.');
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
          <h2 className="fw-bold text-body mb-1">Results Management</h2>
          <p className="text-body-secondary mb-0">Manage and verify academic examination results.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={results} 
        searchPlaceholder="Search by grade, subject..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </motion.div>
  );
};

export default Results;
