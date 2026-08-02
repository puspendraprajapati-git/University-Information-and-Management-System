import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { facultyLinks } from '../../components/layout/Sidebar';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import ConfirmModal from '../../components/common/ConfirmModal';

// this same form doubles up for three different "types" of posts -
// events, news and syllabus uploads - so the fields cover all three
const emptyForm = {
  title: '',
  description: '',
  eventDate: '',
  venue: '',
  organizerId: '',
  type: 'EVENT',
  filePath: '',
};

const Events = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // create/edit modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null -> creating, otherwise editing this id

  // holds the id of the row pending deletion, used to drive the confirm modal
  const [deleteId, setDeleteId] = useState(null);

  // client-side filter for the type tabs (ALL / EVENT / NEWS / SYLLABUS)
  const [filterType, setFilterType] = useState('ALL');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getAllEvents();
      setEvents(res.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []); // just load everything once, filtering happens on the client

  const openCreateModal = () => {
    // organizer defaults to whoever is logged in
    setFormData({ ...emptyForm, organizerId: user.userId });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (ev) => {
    // fall back to empty strings for anything optional so the
    // controlled inputs don't flip from undefined -> value later
    setFormData({
      title: ev.title,
      description: ev.description || '',
      eventDate: ev.eventDate || '',
      venue: ev.venue || '',
      organizerId: ev.organizerId,
      type: ev.type,
      filePath: ev.filePath || '',
    });
    setEditingId(ev.eventId);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // organizerId comes back as a string from the hidden field, cast it before sending
    const payload = { ...formData, organizerId: Number(formData.organizerId) };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        toast.success('Updated successfully');
      } else {
        await createEvent(payload);
        toast.success('Published successfully');
      }
      setShowModal(false);
      fetchEvents(); // reload list so the new/edited row shows up
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  // actual delete only runs once the user confirms in ConfirmModal
  const handleDelete = async () => {
    try {
      await deleteEvent(deleteId);
      toast.success('Deleted successfully');
      setDeleteId(null);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete');
      setDeleteId(null);
    }
  };

  // simple client-side filter - fine here since the list isn't huge,
  // no need to hit the backend again just to switch tabs
  const filteredEvents = filterType === 'ALL' ? events : events.filter((e) => e.type === filterType);

  // small helper to keep the badge colors out of the JSX below
  const typeBadge = (type) => {
    const colors = { EVENT: 'bg-primary', NEWS: 'bg-warning text-dark', SYLLABUS: 'bg-success' };
    return <span className={`badge ${colors[type] || 'bg-secondary'}`}>{type}</span>;
  };

  return (
    <DashboardLayout links={facultyLinks}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Events, News & Syllabus</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Publish
        </button>
      </div>

      {/* type filter tabs */}
      <div className="btn-group mb-3">
        {['ALL', 'EVENT', 'NEWS', 'SYLLABUS'].map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${filterType === t ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setFilterType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-striped table-bordered bg-white">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Organizer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((ev) => (
              <tr key={ev.eventId}>
                <td>{ev.eventId}</td>
                <td>{ev.title}</td>
                <td>{typeBadge(ev.type)}</td>
                <td>{ev.eventDate || '-'}</td>
                <td>{ev.venue || '-'}</td>
                <td>{ev.organizerName}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(ev)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(ev.eventId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* create/edit modal - same form is reused for all 3 post types */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingId ? 'Edit' : 'Publish New'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select className="form-select" name="type" value={formData.type} onChange={handleChange} required>
                      <option value="EVENT">Event</option>
                      <option value="NEWS">News</option>
                      <option value="SYLLABUS">Syllabus</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    {/* not required - a syllabus upload doesn't really need a date */}
                    <input
                      type="date"
                      className="form-control"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Venue (if applicable)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">File Path / URL (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="filePath"
                      value={formData.filePath}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update' : 'Publish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* reusable confirm dialog, only rendered "open" when deleteId is set */}
      <ConfirmModal
        show={!!deleteId}
        title="Delete"
        message="Are you sure you want to delete this?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
};

export default Events;