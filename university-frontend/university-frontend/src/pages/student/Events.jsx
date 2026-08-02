import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getAllEvents } from '../../services/eventService';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllEvents();
        setEvents(res.data);
      } catch (err) {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = filterType === 'ALL' ? events : events.filter((e) => e.type === filterType);

  const typeBadge = (type) => {
    const colors = { EVENT: 'bg-primary', NEWS: 'bg-warning text-dark', SYLLABUS: 'bg-success' };
    return <span className={`badge ${colors[type] || 'bg-secondary'}`}>{type}</span>;
  };

  return (
    <DashboardLayout links={studentLinks}>
      <h3 className="mb-3">Events, News & Syllabus</h3>

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
      ) : filteredEvents.length === 0 ? (
        <div className="alert alert-info">No {filterType !== 'ALL' ? filterType.toLowerCase() : ''} items published yet.</div>
      ) : (
        <div className="row">
          {filteredEvents.map((ev) => (
            <div className="col-md-6 mb-3" key={ev.eventId}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{ev.title}</h5>
                    {typeBadge(ev.type)}
                  </div>
                  {ev.description && <p className="card-text">{ev.description}</p>}
                  <ul className="list-unstyled small text-muted mb-0">
                    {ev.eventDate && <li>📅 {ev.eventDate}</li>}
                    {ev.venue && <li>📍 {ev.venue}</li>}
                    <li>👤 {ev.organizerName}</li>
                    {ev.filePath && (
                      <li>
                        <a href={ev.filePath} target="_blank" rel="noopener noreferrer">View attachment</a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Events;