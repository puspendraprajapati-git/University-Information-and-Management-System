import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const Events = () => {
  const [events, setEvents] = useState(db.events);

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
    },
    {
      header: 'Organizer',
      render: (row) => {
        const organizer = db.users.find(u => u.user_id === row.organizer_id);
        return <span>{organizer?.username || 'System'}</span>;
      }
    }
  ];

  const handleView = (row) => toast.info(`Viewing event: ${row.title}`);
  const handleEdit = (row) => toast.warning(`Editing event: ${row.title}`);
  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.title}"?`)) {
      setEvents(prev => prev.filter(e => e.event_id !== row.event_id));
      toast.success('Event deleted successfully.');
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
          <h2 className="fw-bold text-body mb-1">University Events</h2>
          <p className="text-muted mb-0">Manage upcoming events, announcements, and university news.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={events} 
        searchPlaceholder="Search events..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </motion.div>
  );
};

export default Events;
