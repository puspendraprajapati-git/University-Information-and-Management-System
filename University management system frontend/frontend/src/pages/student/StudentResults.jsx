import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';

const StudentResults = () => {
  const { user } = useAuth();
  
  // Find student and their results
  const student = db.students.find(s => s.user_id === user.user_id);
  const myResults = db.results.filter(r => r.student_id === student?.student_id);

  const columns = [
    { 
      header: 'Semester', 
      render: (row) => <span className="fw-medium">Sem {row.semester_id}</span>
    },
    { 
      header: 'Subject', 
      render: (row) => {
        const subject = db.subjects.find(s => s.subject_id === row.subject_id);
        return <span className="text-body-secondary">{subject?.subject_name || 'N/A'}</span>;
      }
    },
    {
      header: 'Marks Breakdown',
      render: (row) => (
        <span className="small text-body-secondary">
          Theory: {row.theory_marks} <br />
          Practical: {row.practical_marks}
        </span>
      )
    },
    {
      header: 'Total Marks',
      render: (row) => <span className="fw-bold text-primary">{row.total_marks}</span>
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-body mb-1">My Academic Results</h2>
        <p className="text-body-secondary">View your grades and marks across all semesters.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={myResults} 
        searchPlaceholder="Search by subject or grade..."
      />
    </motion.div>
  );
};

export default StudentResults;
