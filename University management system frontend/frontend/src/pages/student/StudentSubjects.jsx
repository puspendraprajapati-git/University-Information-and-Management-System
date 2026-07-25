import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';

const StudentSubjects = () => {
  const { user } = useAuth();
  
  // Find student and their subjects
  const student = db.students.find(s => s.user_id === user.user_id);
  const mySubjects = db.subjects.filter(s => 
    s.dept_id === student?.dept_id && s.semester === student?.current_semester
  );

  const columns = [
    { 
      header: 'Subject Code', 
      render: (row) => <span className="fw-bold text-primary">{row.subject_code}</span>
    },
    { 
      header: 'Subject Name', 
      accessor: 'subject_name'
    },
    { 
      header: 'Credits', 
      render: (row) => <span className="badge bg-secondary bg-opacity-10 text-body border">{row.credits} Credits</span>
    },
    {
      header: 'Faculty',
      render: (row) => {
        // Find faculty who teaches this (mock data mapping)
        const faculty = db.faculty.find(f => f.dept_id === row.dept_id);
        return <span className="text-body-secondary">{faculty?.full_name || 'TBA'}</span>;
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
        <h2 className="fw-bold text-body mb-1">My Enrolled Subjects</h2>
        <p className="text-body-secondary">Subjects you are currently taking for Semester {student?.current_semester}.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={mySubjects} 
        searchPlaceholder="Search your subjects..."
      />
    </motion.div>
  );
};

export default StudentSubjects;
