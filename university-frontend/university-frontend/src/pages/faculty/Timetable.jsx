import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  CalendarDays,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { facultyLinks } from '../../components/layout/Sidebar';
import { getFacultyByUserId } from '../../services/facultyService';
import examService from '../../api/examService';

const FacultyTimetable = () => {
  const { user } = useAuth();

  const [facultyProfile, setFacultyProfile] = useState(null);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const getResolvedUser = () => {
    if (user && user.userId) return user;
    try {
      const stored = sessionStorage.getItem('user') || localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const loadData = async () => {
    const activeUser = getResolvedUser();
    if (!activeUser || !activeUser.userId) return;

    setLoading(true);
    try {
      const facRes = await getFacultyByUserId(activeUser.userId);
      const faculty = facRes.data;
      setFacultyProfile(faculty);

      const targetFacultyId = faculty?.facultyId || faculty?.id;
      if (targetFacultyId) {
        const slotsRes = await examService.getTimetableByFaculty(targetFacultyId);
        setTimetableSlots(slotsRes.data || []);
      }
    } catch (err) {
      console.error('Error loading faculty timetable:', err);
      toast.error('Failed to load teaching schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const getSlotsByDay = (day) => {
    return timetableSlots
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <DashboardLayout links={facultyLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <CalendarDays className="text-primary" size={26} />
              Faculty Teaching Timetable
            </h3>
            <p className="text-muted mb-0">
              Weekly class lectures, assigned laboratories, and designated teaching room locations.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border px-3 py-2">
              Faculty: <strong>{facultyProfile?.fullName || user?.username}</strong>
            </span>
            <span className="badge bg-primary text-white px-3 py-2">
              {timetableSlots.length} Weekly Lectures
            </span>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="card shadow-sm border-0 bg-white">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">Weekly Lecture Schedule</h5>
            <small className="text-muted">Academic Term 2026-2027</small>
          </div>

          <div className="card-body p-4">
            {loading ? (
              <div className="p-5 text-center text-muted">
                <div className="spinner-border text-primary mb-2" role="status" />
                <p className="mb-0">Loading schedule...</p>
              </div>
            ) : timetableSlots.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <Calendar size={42} className="opacity-25 mx-auto mb-3" />
                <h5>No Teaching Slots Assigned</h5>
                <p className="mb-0">You currently have no classes scheduled in the master timetable.</p>
              </div>
            ) : (
              <div className="row g-4">
                {daysOfWeek.map((day) => {
                  const slots = getSlotsByDay(day);
                  return (
                    <div key={day} className="col-12 col-md-6 col-xl-4">
                      <div className="card h-100 border bg-light-subtle shadow-none rounded-3">
                        <div className="card-header bg-white border-bottom py-2.5 d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-dark" style={{ letterSpacing: '0.5px' }}>
                            {day}
                          </span>
                          <span className="badge bg-secondary-subtle text-secondary small">
                            {slots.length} period(s)
                          </span>
                        </div>

                        <div className="card-body p-2.5 d-flex flex-column gap-2">
                          {slots.length === 0 ? (
                            <div className="py-4 text-center text-muted small">
                              No classes scheduled
                            </div>
                          ) : (
                            slots.map((s) => (
                              <div
                                key={s.slotId}
                                className="p-3 bg-white border rounded-3 shadow-xs"
                                style={{ borderLeft: '4px solid #10b981' }}
                              >
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <strong className="text-dark small">{s.subjectName}</strong>
                                  <span className="badge bg-light text-dark font-monospace" style={{ fontSize: '0.7rem' }}>
                                    {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                                  </span>
                                </div>
                                <div className="text-muted small mb-1" style={{ fontSize: '0.78rem' }}>
                                  Target: {s.semesterName}
                                </div>
                                <div className="d-flex align-items-center gap-1 text-success small" style={{ fontSize: '0.75rem' }}>
                                  <MapPin size={12} />
                                  <span>{s.roomName} ({s.building || 'Campus'})</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyTimetable;
