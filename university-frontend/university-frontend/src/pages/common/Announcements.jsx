import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Filter,
  RefreshCw,
  BellRing,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminLinks, facultyLinks, studentLinks } from '../../components/layout/Sidebar';
import notificationService from '../../api/notificationService';

const Announcements = () => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Create Announcement Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: 'ALL',
    priority: 'MEDIUM',
    expiresAt: '',
  });

  // Trigger Schedulers State
  const [runningTrigger, setRunningTrigger] = useState(false);

  const getLinks = () => {
    if (user?.role === 'ADMIN') return adminLinks;
    if (user?.role === 'FACULTY') return facultyLinks;
    return studentLinks;
  };

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res =
        user?.role === 'ADMIN' || user?.role === 'FACULTY'
          ? await notificationService.getAllAnnouncements()
          : await notificationService.getAnnouncements();
      setAnnouncements(res.data || []);
    } catch (err) {
      toast.error('Failed to load campus announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [user]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please provide a title and message');
      return;
    }

    setCreating(true);
    try {
      await notificationService.createAnnouncement({
        title: form.title,
        message: form.message,
        targetRole: form.targetRole,
        priority: form.priority,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });

      toast.success('Announcement broadcasted to campus portal!');
      setShowCreateModal(false);
      setForm({
        title: '',
        message: '',
        targetRole: 'ALL',
        priority: 'MEDIUM',
        expiresAt: '',
      });
      loadAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await notificationService.deleteAnnouncement(id);
      toast.success('Announcement removed');
      setAnnouncements((prev) => prev.filter((a) => a.announcement_id !== id));
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  const handleTriggerAttendance = async () => {
    setRunningTrigger(true);
    try {
      const res = await notificationService.triggerAttendanceCheck();
      const count = res.data?.result?.alertsCreated || 0;
      toast.success(`Attendance check completed: ${count} student alert(s) dispatched!`);
    } catch (err) {
      toast.error('Failed to run attendance check');
    } finally {
      setRunningTrigger(false);
    }
  };

  const handleTriggerAssignments = async () => {
    setRunningTrigger(true);
    try {
      const res = await notificationService.triggerAssignmentReminders();
      const count = res.data?.result?.remindersSent || 0;
      toast.success(`Assignment check completed: ${count} reminder(s) dispatched!`);
    } catch (err) {
      toast.error('Failed to run assignment reminders');
    } finally {
      setRunningTrigger(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT':
        return <span className="badge bg-danger">URGENT</span>;
      case 'HIGH':
        return <span className="badge bg-warning text-dark">HIGH PRIORITY</span>;
      case 'LOW':
        return <span className="badge bg-secondary">NOTICE</span>;
      default:
        return <span className="badge bg-primary">GENERAL</span>;
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    filterPriority === 'ALL' ? true : a.priority === filterPriority
  );

  const canManage = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  return (
    <DashboardLayout links={getLinks()}>
      <div className="container-fluid p-4">
        {/* Top Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <Megaphone className="text-primary" size={26} />
              Campus Bulletin & Communication
            </h3>
            <p className="text-muted mb-0">
              Official university notices, automated alerts, and campus-wide communications.
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {canManage && (
              <>
                <button
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm"
                  onClick={handleTriggerAttendance}
                  disabled={runningTrigger}
                  title="Check attendance percentage across students and notify anyone below threshold"
                >
                  <RefreshCw size={14} className={runningTrigger ? 'spin' : ''} />
                  <span>Scan Low Attendance</span>
                </button>

                <button
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 shadow-sm"
                  onClick={handleTriggerAssignments}
                  disabled={runningTrigger}
                  title="Scan upcoming assignment deadlines and notify pending students"
                >
                  <BellRing size={14} />
                  <span>Send Assignment Reminders</span>
                </button>

                <button
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={16} />
                  <span>Publish Notice</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Priority Filter Bar */}
        <div className="card shadow-sm border-0 mb-4 bg-white p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <Filter size={16} className="text-muted" />
              <span className="small fw-bold text-dark">Filter Priority:</span>
              <div className="btn-group btn-group-sm">
                {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`btn ${filterPriority === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilterPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-muted small">
              Showing <strong>{filteredAnnouncements.length}</strong> notice(s)
            </span>
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-primary mb-2" role="status" />
            <p className="mb-0">Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="card shadow-sm border-0 bg-white p-5 text-center text-muted">
            <Megaphone size={40} className="opacity-25 mx-auto mb-3" />
            <h5>No Announcements Found</h5>
            <p className="mb-0">There are currently no notices matching your filter criteria.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredAnnouncements.map((a) => (
              <div key={a.announcement_id} className="col-12 col-lg-6">
                <div
                  className="card shadow-sm border-0 h-100 bg-white p-4 d-flex flex-column justify-content-between"
                  style={{
                    borderLeft: `4px solid ${
                      a.priority === 'URGENT'
                        ? '#dc2626'
                        : a.priority === 'HIGH'
                        ? '#f59e0b'
                        : '#4f46e5'
                    }`,
                    borderRadius: '12px',
                  }}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div className="d-flex align-items-center gap-2">
                        {getPriorityBadge(a.priority)}
                        <span className="badge bg-light text-dark border small">
                          Target: {a.target_role}
                        </span>
                      </div>
                      {canManage && (
                        <button
                          className="btn btn-sm text-danger p-0 border-0 bg-transparent"
                          onClick={() => handleDeleteAnnouncement(a.announcement_id)}
                          title="Delete notice"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{a.title}</h5>
                    <p className="text-muted small mb-3" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                      {a.message}
                    </p>
                  </div>

                  <div className="pt-3 border-top d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '0.78rem' }}>
                    <div className="d-flex align-items-center gap-1">
                      <Calendar size={13} />
                      <span>{new Date(a.published_at).toLocaleDateString()}</span>
                      {a.author_name && <span>• by {a.author_name}</span>}
                    </div>
                    {a.expires_at && (
                      <span className="text-danger small">
                        Expires: {new Date(a.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Publish Announcement Modal */}
        {showCreateModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '540px' }}>
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-primary text-white px-4 py-3">
                  <div className="d-flex align-items-center gap-2">
                    <Sparkles size={20} />
                    <h5 className="modal-title fw-bold fs-6 mb-0">Publish Campus Announcement</h5>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowCreateModal(false)}
                  />
                </div>

                <form onSubmit={handleCreateAnnouncement}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Notice Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. End-Semester Examination Schedule Released"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Target Audience</label>
                        <select
                          className="form-select"
                          value={form.targetRole}
                          onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                        >
                          <option value="ALL">Everyone (All Campus)</option>
                          <option value="STUDENT">Students Only</option>
                          <option value="FACULTY">Faculty Only</option>
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label fw-semibold small">Priority Level</label>
                        <select
                          className="form-select"
                          value={form.priority}
                          onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        >
                          <option value="LOW">Low (FYI)</option>
                          <option value="MEDIUM">Medium (General)</option>
                          <option value="HIGH">High Priority</option>
                          <option value="URGENT">Urgent Alert</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Expiry Date (Optional)</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.expiresAt}
                        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                      />
                      <small className="text-muted">Notices will automatically expire after this date.</small>
                    </div>

                    <div className="mb-2">
                      <label className="form-label fw-semibold small">Message Content *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Type the full announcement content here..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                      />
                    </div>

                    <div className="alert alert-info py-2 px-3 small mt-3 mb-0">
                      <strong>Broadcast:</strong> Publishing will automatically create an in-app notification for all matching users.
                    </div>
                  </div>

                  <div className="modal-footer bg-light px-4 py-2 border-top">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary fw-semibold px-4"
                      disabled={creating}
                    >
                      {creating ? 'Publishing...' : 'Broadcast Announcement'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Announcements;
