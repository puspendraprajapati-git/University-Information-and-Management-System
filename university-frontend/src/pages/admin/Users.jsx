import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/tables/DataTable';
import db from '../../data/db.json';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState(db.users);

  const columns = [
    { 
      header: 'ID', 
      accessor: 'user_id',
      render: (row) => <span className="text-body-secondary fw-medium">#{row.user_id}</span>
    },
    { 
      header: 'Username', 
      render: (row) => (
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
            {row.username.charAt(0).toUpperCase()}
          </div>
          <span className="fw-medium">{row.username}</span>
        </div>
      )
    },
    { 
      header: 'Email', 
      accessor: 'email'
    },
    {
      header: 'Role',
      render: (row) => {
        let badgeColor = 'bg-secondary';
        if (row.role === 'admin') badgeColor = 'bg-danger';
        if (row.role === 'faculty') badgeColor = 'bg-success';
        if (row.role === 'student') badgeColor = 'bg-info';

        return <span className={`badge ${badgeColor} text-uppercase`}>{row.role}</span>;
      }
    }
  ];

  const handleView = (row) => toast.info(`Viewing user: ${row.username}`);
  const handleEdit = (row) => toast.warning(`Editing user: ${row.username}`);
  const handleDelete = (row) => {
    if (window.confirm(`Are you sure you want to delete user ${row.username}?`)) {
      setUsers(prev => prev.filter(u => u.user_id !== row.user_id));
      toast.success('User deleted successfully.');
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
          <h2 className="fw-bold text-body mb-1">User Management</h2>
          <p className="text-body-secondary mb-0">Manage system access, roles, and user accounts.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        searchPlaceholder="Search by username or email..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </motion.div>
  );
};

export default Users;
