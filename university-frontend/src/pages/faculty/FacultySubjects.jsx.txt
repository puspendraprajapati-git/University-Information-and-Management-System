import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const FacultySubjects = () => {
  const { user } = useAuth();
  
  // Find faculty and the subjects they teach
  const faculty = db.faculty.find(f => f.user_id === user.user_id);
  const mySubjects = db.subjects.filter(s => s.dept_id === faculty?.dept_id); // In a real app, there would be a junction table

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
      header: 'Semester', 
      render: (row) => `Sem ${row.semester}`
    },
    { 
      header: 'Credits', 
      render: (row) => <span className="badge bg-secondary bg-opacity-10 text-body border">{row.credits} Credits</span>
    }
  ];

  const handleView = (row) => toast.info(`Viewing details and enrolled students for ${row.subject_name}`);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-body mb-1">My Teaching Subjects</h2>
        <p className="text-body-secondary">Subjects assigned to you for the current academic year.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={mySubjects} 
        searchPlaceholder="Search your subjects..."
        onView={handleView}
      />
    </motion.div>
  );
};

export default FacultySubjects;
