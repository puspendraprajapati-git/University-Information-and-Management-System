import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-body mb-1">System Settings</h2>
        <p className="text-muted">Manage global portal configurations.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="premium-card p-4">
            <h5 className="fw-bold mb-4">Appearance</h5>
            <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-3">
              <div>
                <h6 className="fw-bold mb-1">Theme Mode</h6>
                <small className="text-muted">Toggle between Light and Dark mode.</small>
              </div>
              <div className="form-check form-switch fs-4 mb-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="premium-card p-4">
            <h5 className="fw-bold mb-4">Profile Information</h5>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label text-muted small">Username</label>
                <input type="text" className="form-control" defaultValue={user?.username} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Email Address</label>
                <input type="email" className="form-control" defaultValue={user?.email} />
              </div>
              <div className="text-end mt-4">
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
