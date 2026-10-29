import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  Users,
  CheckCircle,
  FileCheck,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminLinks } from '../../components/layout/Sidebar';
import { getAllSubjects } from '../../services/subjectService';
import { getAllSemesters } from '../../services/semesterService';
import { getAllFaculty } from '../../services/facultyService';
import { getAllStudents } from '../../services/studentService';
import examService from '../../api/examService';

const AdminExams = () => {
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'rooms' | 'timetable'

  // Master Academic Data
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Exams State
  const [exams, setExams] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({
    subjectId: '',
    semesterId: '',
    examType: 'FINAL',
    examDate: '',
    durationMinutes: 180,
    totalMarks: 100,
  });

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    examId: '',
    roomId: '',
    startTime: '09:30',
    endTime: '12:30',
  });

  // Room Modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomName: '',
    building: '',
    capacity: 60,
  });

  // Timetable State
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('');
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotForm, setSlotForm] = useState({
    subjectId: '',
    facultyId: '',
    semesterId: '',
    roomId: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
  });

  const [loading, setLoading] = useState(false);

  const loadDropdowns = async () => {
    try {
      const [subRes, semRes, facRes, stuRes, roomRes] = await Promise.all([
        getAllSubjects(),
        getAllSemesters(),
        getAllFaculty(),
        getAllStudents(),
        examService.getAllRooms(),
      ]);
      setSubjects(subRes.data || []);
      setSemesters(semRes.data || []);
      setFacultyList(facRes.data || []);
      setStudents(stuRes.data || []);
      setRooms(roomRes.data || []);
    } catch {
      toast.error('Failed to load academic options');
    }
  };

  const loadExamsAndSlots = async () => {
    setLoading(true);
    try {
      const [examRes, slotRes, roomRes] = await Promise.all([
        examService.getAllExams(selectedSemester || null),
        examService.getAllTimetableSlots(),
        examService.getAllRooms(),
      ]);
      setExams(examRes.data || []);
      setTimetableSlots(slotRes.data || []);
      setRooms(roomRes.data || []);
    } catch {
      toast.error('Failed to load exams or timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropdowns();

    // Check URL parameters for tab and faculty preselection
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const facIdParam = params.get('facultyId');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (facIdParam) {
      setSelectedFacultyFilter(facIdParam);
      setSlotForm((prev) => ({ ...prev, facultyId: facIdParam }));
      setShowSlotModal(true);
    }
  }, []);

  useEffect(() => {
    loadExamsAndSlots();
  }, [selectedSemester]);

  // Create Exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await examService.createExam({
        subjectId: Number(examForm.subjectId),
        semesterId: Number(examForm.semesterId),
        examType: examForm.examType,
        examDate: examForm.examDate,
        durationMinutes: Number(examForm.durationMinutes),
        totalMarks: Number(examForm.totalMarks),
      });
      toast.success('Examination created successfully!');
      setShowExamModal(false);
      setExamForm({
        subjectId: '',
        semesterId: '',
        examType: 'FINAL',
        examDate: '',
        durationMinutes: 180,
        totalMarks: 100,
      });
      loadExamsAndSlots();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create exam');
    }
  };

  // Schedule Exam Session (with Room Conflict Prevention)
  const handleScheduleExam = async (e) => {
    e.preventDefault();
    try {
      await examService.scheduleExam({
        examId: Number(scheduleForm.examId),
        roomId: Number(scheduleForm.roomId),
        startTime: scheduleForm.startTime + ':00',
        endTime: scheduleForm.endTime + ':00',
      });
      toast.success('Exam room & timing allocated successfully!');
      setShowScheduleModal(false);
      loadExamsAndSlots();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to schedule exam';
      toast.error(errMsg);
    }
  };

  // Auto Enroll Students into Exam
  const handleAutoEnroll = async (exam) => {
    const semStudents = students.filter((s) => Number(s.currentSemesterId) === Number(exam.semesterId));
    if (semStudents.length === 0) {
      toast.warn('No students found enrolled in this semester');
      return;
    }

    try {
      let registered = 0;
      for (const st of semStudents) {
        await examService.registerStudent(exam.examId, st.studentId || st.id);
        registered++;
      }
      toast.success(`Registered ${registered} students with assigned seat numbers!`);
    } catch {
      toast.error('Failed to register students for exam');
    }
  };

  // Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await examService.createRoom({
        roomName: roomForm.roomName,
        building: roomForm.building,
        capacity: Number(roomForm.capacity),
      });
      toast.success('Exam room created!');
      setShowRoomModal(false);
      setRoomForm({ roomName: '', building: '', capacity: 60 });
      loadDropdowns();
      loadExamsAndSlots();
    } catch {
      toast.error('Failed to create room');
    }
  };

  // Create Timetable Slot (with Room & Faculty Clash Prevention)
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await examService.createTimetableSlot({
        subjectId: Number(slotForm.subjectId),
        facultyId: Number(slotForm.facultyId),
        semesterId: Number(slotForm.semesterId),
        roomId: Number(slotForm.roomId),
        dayOfWeek: slotForm.dayOfWeek,
        startTime: slotForm.startTime + ':00',
        endTime: slotForm.endTime + ':00',
      });
      toast.success('Weekly timetable slot allocated!');
      setShowSlotModal(false);
      loadExamsAndSlots();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Schedule Conflict Detected';
      toast.error(errMsg);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Remove this timetable slot?')) return;
    try {
      await examService.deleteTimetableSlot(id);
      toast.success('Slot removed');
      loadExamsAndSlots();
    } catch {
      toast.error('Failed to remove slot');
    }
  };

  return (
    <DashboardLayout links={adminLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <Calendar className="text-primary" size={26} />
              Examination & Timetable Management
            </h3>
            <p className="text-muted mb-0">
              Schedule end-term exams, allocate halls with automated room conflict detection, and manage weekly class slots.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-success btn-sm d-flex align-items-center gap-1.5 shadow-sm text-white"
              onClick={() => {
                setShowSlotModal(true);
              }}
              title="Assign a teaching faculty member to a subject, classroom, and weekly schedule"
            >
              <UserCheck size={16} />
              <span>Assign Faculty to Class</span>
            </button>

            {activeTab === 'exams' && (
              <>
                <button
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm"
                  onClick={() => setShowExamModal(true)}
                >
                  <Plus size={16} />
                  <span>Create Exam</span>
                </button>
                <button
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <Clock size={16} />
                  <span>Schedule Room Session</span>
                </button>
              </>
            )}

            {activeTab === 'rooms' && (
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm"
                onClick={() => setShowRoomModal(true)}
              >
                <Plus size={16} />
                <span>Add Exam Room</span>
              </button>
            )}

            {activeTab === 'timetable' && (
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm"
                onClick={() => setShowSlotModal(true)}
              >
                <Plus size={16} />
                <span>Add Timetable Slot</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card shadow-sm border-0 mb-4 bg-white p-2">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'exams' ? 'active' : ''}`}
                onClick={() => setActiveTab('exams')}
              >
                📝 Examination Sessions ({exams.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                🏢 Exam Halls & Classrooms ({rooms.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'timetable' ? 'active' : ''}`}
                onClick={() => setActiveTab('timetable')}
              >
                👥 Faculty Class Allocations & Timetable ({timetableSlots.length})
              </button>
            </li>
          </ul>
        </div>

        {/* TAB 1: Exams */}
        {activeTab === 'exams' && (
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0">Scheduled Examinations</h5>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Filter Semester:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '160px' }}
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.semesterName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="p-5 text-center text-muted">Loading exams...</div>
              ) : exams.length === 0 ? (
                <div className="p-5 text-center text-muted">No examinations found. Create one above!</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Subject & Code</th>
                        <th>Semester</th>
                        <th>Type</th>
                        <th>Exam Date</th>
                        <th>Duration</th>
                        <th>Allocated Room</th>
                        <th>Timing</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((ex) => (
                        <tr key={ex.examId}>
                          <td>
                            <strong className="d-block text-dark">{ex.subjectName}</strong>
                            <small className="text-muted font-monospace">{ex.subjectCode}</small>
                          </td>
                          <td>{ex.semesterName}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                              {ex.examType}
                            </span>
                          </td>
                          <td>
                            <span className="fw-medium text-dark">
                              {ex.examDate ? new Date(ex.examDate).toLocaleDateString() : 'TBA'}
                            </span>
                          </td>
                          <td>{ex.durationMinutes} mins</td>
                          <td>
                            {ex.roomName ? (
                              <div className="d-flex align-items-center gap-1 text-dark">
                                <MapPin size={14} className="text-primary" />
                                <strong>{ex.roomName}</strong>
                                <small className="text-muted">({ex.building})</small>
                              </div>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning border">Not Scheduled</span>
                            )}
                          </td>
                          <td>
                            {ex.startTime ? (
                              <span className="font-monospace small text-dark">
                                {ex.startTime} - {ex.endTime}
                              </span>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-success me-2"
                              onClick={() => handleAutoEnroll(ex)}
                              title="Register semester students and assign seat numbers"
                            >
                              Enroll Students
                            </button>
                            {!ex.scheduleId && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setScheduleForm({ ...scheduleForm, examId: ex.examId });
                                  setShowScheduleModal(true);
                                }}
                              >
                                Allocate Room
                              </button>
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

        {/* TAB 2: Exam Rooms */}
        {activeTab === 'rooms' && (
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold text-dark mb-0">Halls & Classroom Facilities</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Room ID</th>
                      <th>Room Name / Number</th>
                      <th>Building / Block</th>
                      <th>Seating Capacity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((r) => (
                      <tr key={r.roomId}>
                        <td>#{r.roomId}</td>
                        <td>
                          <strong>{r.roomName}</strong>
                        </td>
                        <td>{r.building}</td>
                        <td>
                          <span className="badge bg-light text-dark border px-2.5 py-1">
                            {r.capacity} Seats
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success border">Available</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Faculty Class Allocations & Master Timetable */}
        {activeTab === 'timetable' && (
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <UserCheck className="text-primary" size={20} />
                  Faculty Class Allocations & Weekly Timetable
                </h5>
                <p className="text-muted small mb-0">
                  Assign faculty to classes, designate lecture halls, and prevent room/faculty double-booking.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="d-flex align-items-center gap-1.5">
                  <span className="small text-muted fw-semibold">Filter Faculty:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ minWidth: '180px' }}
                    value={selectedFacultyFilter}
                    onChange={(e) => setSelectedFacultyFilter(e.target.value)}
                  >
                    <option value="">All Faculty Members</option>
                    {facultyList.map((f) => {
                      const fid = f.facultyId || f.id;
                      return (
                        <option key={fid} value={fid}>
                          {f.fullName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 shadow-sm"
                  onClick={() => setShowSlotModal(true)}
                >
                  <Plus size={16} />
                  <span>Assign Faculty to Class</span>
                </button>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Day</th>
                      <th>Class Timing</th>
                      <th>Subject & Code</th>
                      <th>Semester</th>
                      <th>Assigned Faculty</th>
                      <th>Classroom / Lab</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetableSlots
                      .filter((s) => !selectedFacultyFilter || String(s.facultyId) === String(selectedFacultyFilter))
                      .map((s) => (
                        <tr key={s.slotId}>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">
                              {s.dayOfWeek}
                            </span>
                          </td>
                          <td className="font-monospace fw-semibold text-dark">
                            {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                          </td>
                          <td>
                            <strong className="text-dark">{s.subjectName}</strong>
                            <small className="d-block text-muted">{s.subjectCode}</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-secondary border">{s.semesterName}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                style={{ width: '28px', height: '28px', fontSize: '12px' }}
                              >
                                {(s.facultyName || 'F').charAt(0).toUpperCase()}
                              </div>
                              <span className="fw-semibold text-dark">{s.facultyName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-primary fw-medium">{s.roomName}</span>
                            <small className="text-muted d-block">{s.building}</small>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteSlot(s.slotId)}
                              title="Delete class allocation"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}

                    {timetableSlots.filter((s) => !selectedFacultyFilter || String(s.facultyId) === String(selectedFacultyFilter)).length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          <UserCheck className="mx-auto mb-2 text-muted opacity-50" size={36} />
                          <p className="mb-2 fw-medium">No Class Allocations Found</p>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setShowSlotModal(true)}
                          >
                            + Assign Faculty to Class
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Create Exam */}
        {showExamModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold fs-6 mb-0">Create Examination</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowExamModal(false)} />
                </div>
                <form onSubmit={handleCreateExam}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Subject *</label>
                      <select
                        className="form-select"
                        value={examForm.subjectId}
                        onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.subjectName} ({sub.subjectCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Semester *</label>
                        <select
                          className="form-select"
                          value={examForm.semesterId}
                          onChange={(e) => setExamForm({ ...examForm, semesterId: e.target.value })}
                          required
                        >
                          <option value="">Select Semester</option>
                          {semesters.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.semesterName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Exam Type *</label>
                        <select
                          className="form-select"
                          value={examForm.examType}
                          onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                        >
                          <option value="MID_TERM">Mid Term</option>
                          <option value="FINAL">Final Semester</option>
                          <option value="PRACTICAL">Practical / Lab</option>
                          <option value="QUIZ">Quiz / Unit Test</option>
                        </select>
                      </div>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Exam Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={examForm.examDate}
                          onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Duration (Minutes)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={examForm.durationMinutes}
                          onChange={(e) => setExamForm({ ...examForm, durationMinutes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowExamModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary">
                      Create Exam
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Schedule Room Session with Conflict Detection */}
        {showScheduleModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold fs-6 mb-0">Allocate Room & Timing</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowScheduleModal(false)} />
                </div>
                <form onSubmit={handleScheduleExam}>
                  <div className="modal-body p-4">
                    <div className="alert alert-info py-2 px-3 small mb-3">
                      <strong>Conflict Validator:</strong> The system automatically verifies that the chosen room is not booked for another exam at this time.
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Exam *</label>
                      <select
                        className="form-select"
                        value={scheduleForm.examId}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, examId: e.target.value })}
                        required
                      >
                        <option value="">Select Exam</option>
                        {exams.map((ex) => (
                          <option key={ex.examId} value={ex.examId}>
                            {ex.subjectName} ({ex.examType}) - {ex.examDate}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Exam Room / Hall *</label>
                      <select
                        className="form-select"
                        value={scheduleForm.roomId}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, roomId: e.target.value })}
                        required
                      >
                        <option value="">Select Room</option>
                        {rooms.map((r) => (
                          <option key={r.roomId} value={r.roomId}>
                            {r.roomName} ({r.building}) - Capacity: {r.capacity}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Start Time *</label>
                        <input
                          type="time"
                          className="form-control"
                          value={scheduleForm.startTime}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">End Time *</label>
                        <input
                          type="time"
                          className="form-control"
                          value={scheduleForm.endTime}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowScheduleModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary">
                      Validate & Schedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Add Room */}
        {showRoomModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold fs-6 mb-0">Add Classroom / Exam Hall</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowRoomModal(false)} />
                </div>
                <form onSubmit={handleCreateRoom}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Room Name / Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Hall-A, Lab 201"
                        value={roomForm.roomName}
                        onChange={(e) => setRoomForm({ ...roomForm, roomName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Building / Wing</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Science Block, Engineering Wing"
                        value={roomForm.building}
                        onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Seating Capacity *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={roomForm.capacity}
                        onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowRoomModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary">
                      Save Room
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal 4: Assign Faculty to Class */}
        {showSlotModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title fw-bold fs-6 mb-0 d-flex align-items-center gap-2">
                    <UserCheck size={20} />
                    Assign Faculty to Class & Schedule
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowSlotModal(false)} />
                </div>
                <form onSubmit={handleCreateSlot}>
                  <div className="modal-body p-4">
                    <div className="alert alert-info py-2 px-3 small mb-3">
                      <strong>Automated Clash Check:</strong> Ensures neither the selected faculty member nor the classroom is double-booked on this day and time.
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Teaching Faculty *</label>
                      <select
                        className="form-select"
                        value={slotForm.facultyId}
                        onChange={(e) => setSlotForm({ ...slotForm, facultyId: e.target.value })}
                        required
                      >
                        <option value="">Select Faculty Member</option>
                        {facultyList.map((f) => {
                          const fid = f.facultyId || f.id;
                          return (
                            <option key={fid} value={fid}>
                              {f.fullName} {f.qualification ? `(${f.qualification})` : ''} - ID: #{fid}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Subject *</label>
                      <select
                        className="form-select"
                        value={slotForm.subjectId}
                        onChange={(e) => setSlotForm({ ...slotForm, subjectId: e.target.value })}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => {
                          const sid = sub.subjectId || sub.id;
                          return (
                            <option key={sid} value={sid}>
                              {sub.subjectName} ({sub.subjectCode})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Semester *</label>
                        <select
                          className="form-select"
                          value={slotForm.semesterId}
                          onChange={(e) => setSlotForm({ ...slotForm, semesterId: e.target.value })}
                          required
                        >
                          <option value="">Select Semester</option>
                          {semesters.map((s) => {
                            const semId = s.semesterId || s.id;
                            return (
                              <option key={semId} value={semId}>
                                {s.semesterName}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Classroom / Lab *</label>
                        <select
                          className="form-select"
                          value={slotForm.roomId}
                          onChange={(e) => setSlotForm({ ...slotForm, roomId: e.target.value })}
                          required
                        >
                          <option value="">Select Room</option>
                          {rooms.map((r) => (
                            <option key={r.roomId} value={r.roomId}>
                              {r.roomName} ({r.building}) - Cap: {r.capacity}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Day of Week *</label>
                      <select
                        className="form-select"
                        value={slotForm.dayOfWeek}
                        onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: e.target.value })}
                      >
                        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Class Start Time *</label>
                        <input
                          type="time"
                          className="form-control"
                          value={slotForm.startTime}
                          onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Class End Time *</label>
                        <input
                          type="time"
                          className="form-control"
                          value={slotForm.endTime}
                          onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowSlotModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-sm btn-success text-white">
                      Assign Faculty & Save Slot
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

export default AdminExams;
