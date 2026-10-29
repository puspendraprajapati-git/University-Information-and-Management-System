import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  MapPin,
  Printer,
  CheckCircle2,
  FileCheck2,
  Award,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getStudentByUserId } from '../../services/studentService';
import examService from '../../api/examService';

const StudentExams = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('hall-ticket'); // 'hall-ticket' | 'timetable'
  const [studentProfile, setStudentProfile] = useState(null);
  const [hallTickets, setHallTickets] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Admit Card Print Modal
  const [showAdmitCard, setShowAdmitCard] = useState(false);

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
      const stuRes = await getStudentByUserId(activeUser.userId);
      const student = stuRes.data;
      setStudentProfile(student);

      if (student?.studentId) {
        // 1. Fetch Hall Ticket & registered exams
        const ticketRes = await examService.getStudentHallTicket(student.studentId);
        setHallTickets(ticketRes.data || []);

        // 2. Fetch Weekly Timetable for student's current semester
        if (student.currentSemesterId) {
          const ttRes = await examService.getTimetableBySemester(student.currentSemesterId);
          setTimetableSlots(ttRes.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading student examination data:', err);
      toast.error('Failed to load examination schedule');
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
    <DashboardLayout links={studentLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FileCheck2 className="text-primary" size={26} />
              Examination & Timetable Portal
            </h3>
            <p className="text-muted mb-0">
              View your personalized examination schedule, download official admit cards, and review weekly lecture timetables.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {activeTab === 'hall-ticket' && hallTickets.length > 0 && (
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm px-3"
                onClick={() => setShowAdmitCard(true)}
              >
                <Printer size={16} />
                <span>View & Print Admit Card</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card shadow-sm border-0 mb-4 bg-white p-2">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'hall-ticket' ? 'active' : ''}`}
                onClick={() => setActiveTab('hall-ticket')}
              >
                🎓 Examination Hall Ticket & Schedules
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'timetable' ? 'active' : ''}`}
                onClick={() => setActiveTab('timetable')}
              >
                📅 Weekly Class Timetable
              </button>
            </li>
          </ul>
        </div>

        {/* TAB 1: Hall Ticket & Exams */}
        {activeTab === 'hall-ticket' && (
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-0">Registered Examinations</h5>
                <small className="text-muted">
                  Roll: <strong>{studentProfile?.enrollmentNo || 'N/A'}</strong> • Semester: {studentProfile?.currentSemesterId || '1'}
                </small>
              </div>
              <span className="badge bg-light text-dark border px-3 py-1.5">
                Total Exams: <strong>{hallTickets.length}</strong>
              </span>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="p-5 text-center text-muted">
                  <div className="spinner-border text-primary mb-2" role="status" />
                  <p className="mb-0">Loading examination records...</p>
                </div>
              ) : hallTickets.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <Calendar size={42} className="opacity-25 mx-auto mb-3" />
                  <h5>No Examinations Scheduled</h5>
                  <p className="mb-0">You currently have no registered exams for this term.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Subject & Code</th>
                        <th>Exam Type</th>
                        <th>Date</th>
                        <th>Session Timing</th>
                        <th>Assigned Hall</th>
                        <th>Seat Allocation</th>
                        <th>Status</th>
                        <th>Connected Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hallTickets.map((t) => (
                        <tr key={t.registrationId}>
                          <td>
                            <strong className="d-block text-dark">{t.subjectName}</strong>
                            <small className="text-muted font-monospace">{t.subjectCode}</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-primary border fw-semibold">
                              {t.examType}
                            </span>
                          </td>
                          <td>
                            <span className="fw-semibold text-dark">
                              {t.examDate ? new Date(t.examDate).toLocaleDateString() : 'TBA'}
                            </span>
                            <small className="d-block text-muted">{t.durationMinutes} mins</small>
                          </td>
                          <td>
                            {t.startTime ? (
                              <div className="small font-monospace text-dark">
                                {t.startTime} - {t.endTime}
                              </div>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary">TBA</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1.5">
                              <MapPin size={15} className="text-muted flex-shrink-0" />
                              <span className="fw-medium text-dark">{t.roomName}</span>
                            </div>
                            {t.building && <small className="text-muted d-block">{t.building}</small>}
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace px-2.5 py-1">
                              {t.seatNumber || 'Assigned on Entry'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              {t.registrationStatus}
                            </span>
                          </td>
                          <td>
                            {t.isResultPublished ? (
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-success d-flex align-items-center gap-1">
                                  <Award size={13} /> Grade {t.grade}
                                </span>
                                <small className="text-muted">({t.marksObtained}/{t.totalMarks})</small>
                              </div>
                            ) : (
                              <span className="text-muted small">Pending Evaluation</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Weekly Timetable */}
        {activeTab === 'timetable' && (
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold text-dark mb-0">Weekly Lecture & Lab Timetable</h5>
              <small className="text-muted">Department: {studentProfile?.deptName || 'Computer Science'} • Term: Semester {studentProfile?.currentSemesterId || '1'}</small>
            </div>

            <div className="card-body p-4">
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
                              No lectures scheduled
                            </div>
                          ) : (
                            slots.map((s) => (
                              <div
                                key={s.slotId}
                                className="p-3 bg-white border rounded-3 shadow-xs"
                                style={{ borderLeft: '4px solid #4f46e5' }}
                              >
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <strong className="text-dark small">{s.subjectName}</strong>
                                  <span className="badge bg-light text-dark font-monospace" style={{ fontSize: '0.7rem' }}>
                                    {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                                  </span>
                                </div>
                                <div className="text-muted small mb-1" style={{ fontSize: '0.78rem' }}>
                                  Instructor: {s.facultyName}
                                </div>
                                <div className="d-flex align-items-center gap-1 text-primary small" style={{ fontSize: '0.75rem' }}>
                                  <MapPin size={12} />
                                  <span>{s.roomName} ({s.building || 'Main Campus'})</span>
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
            </div>
          </div>
        )}

        {/* Official Admit Card / Hall Ticket Modal */}
        {showAdmitCard && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-primary text-white px-4 py-3">
                  <div className="d-flex align-items-center gap-2">
                    <GraduationCap size={22} />
                    <h5 className="modal-title fw-bold fs-6 mb-0">Official University Examination Admit Card</h5>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowAdmitCard(false)}
                  />
                </div>

                <div className="modal-body p-4" id="printable-admit-card">
                  {/* University Banner */}
                  <div className="text-center pb-3 border-bottom mb-3">
                    <h4 className="fw-bold text-primary mb-1">EduCore University</h4>
                    <p className="text-muted small mb-0">Office of the Controller of Examinations</p>
                    <span className="badge bg-light text-dark border px-3 py-1 mt-1 small">
                      End-Semester Examination Hall Ticket • 2026-2027
                    </span>
                  </div>

                  {/* Student Details Card */}
                  <div className="row g-2 bg-light p-3 rounded-3 border mb-3 small">
                    <div className="col-6">
                      <span className="text-muted">Candidate Name:</span>
                      <strong className="d-block text-dark">{studentProfile?.fullName || user?.username}</strong>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-muted">Enrollment / Roll No:</span>
                      <strong className="d-block font-monospace text-primary">{studentProfile?.enrollmentNo || 'STU178698'}</strong>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted">Academic Department:</span>
                      <strong className="d-block text-dark">{studentProfile?.deptName || 'Computer Science'}</strong>
                    </div>
                    <div className="col-6 text-end mt-2">
                      <span className="text-muted">Current Semester:</span>
                      <strong className="d-block text-dark">Semester {studentProfile?.currentSemesterId || '1'}</strong>
                    </div>
                  </div>

                  {/* Registered Exam Schedule */}
                  <h6 className="fw-bold text-dark mb-2">Examination Schedule & Room Allocations</h6>
                  <div className="table-responsive mb-3">
                    <table className="table table-bordered table-sm small align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Subject Code</th>
                          <th>Subject Name</th>
                          <th>Date</th>
                          <th>Session Time</th>
                          <th>Exam Hall</th>
                          <th>Allocated Seat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hallTickets.map((t) => (
                          <tr key={t.registrationId}>
                            <td className="font-monospace fw-bold">{t.subjectCode}</td>
                            <td>{t.subjectName}</td>
                            <td>{t.examDate}</td>
                            <td>{t.startTime} - {t.endTime}</td>
                            <td>{t.roomName} ({t.building})</td>
                            <td className="font-monospace fw-bold text-primary">{t.seatNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Exam Guidelines */}
                  <div className="p-3 bg-light-subtle border rounded-3 small text-muted">
                    <strong className="d-block text-dark mb-1">Candidate Instructions:</strong>
                    <ul className="mb-0 ps-3">
                      <li>Candidates must present this printed admit card and institutional ID card at the entry gate.</li>
                      <li>Reporting time is 30 minutes prior to the commencement of the examination.</li>
                      <li>Electronic gadgets, smartwatches, and programmable devices are strictly prohibited.</li>
                    </ul>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-2 border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowAdmitCard(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary fw-semibold px-4"
                    onClick={() => window.print()}
                  >
                    Print Admit Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentExams;
