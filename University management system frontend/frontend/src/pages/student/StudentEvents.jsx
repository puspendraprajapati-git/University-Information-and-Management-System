import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const StudentEvents = () => {
  const [events] = useState(db.events); // Students can see all university events

  const columns = [
    { 
      header: 'Title', 
      render: (row) => <span className="fw-bold">{row.title}</span>
    },
    { 
      header: 'Date & Time', 
      render: (row) => new Date(row.event_date).toLocaleString()
    },
    { 
      header: 'Venue', 
      accessor: 'venue'
    },
    {
      header: 'Type',
      render: (row) => (
        <span className={`badge ${row.type === 'event' ? 'bg-primary' : row.type === 'news' ? 'bg-info' : 'bg-secondary'}`}>
          {row.type.toUpperCase()}
        </span>
      )
    }
  ];

  const handleView = (row) => {
    toast.info(`Event: ${row.title} | ${row.description}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-body mb-1">University Events</h2>
          <p className="text-body-secondary mb-0">Stay updated with upcoming events, announcements, and university news.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={events} 
        searchPlaceholder="Search events..."
        onView={handleView}
      />
    </motion.div>
  );
};

export default StudentEvents;
