import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { facultyLinks } from '../../components/layout/Sidebar';
import {
  getAttendanceBySubjectAndSemester,
  markAttendance,
  updateAttendance,
} from '../../services/attendanceService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllSemesters } from '../../services/semesterService';
import { getAllStudents } from '../../services/studentService';
import { getFacultyByUserId } from '../../services/facultyService';

const emptyForm = {
  studentId: '',
  subjectId: '',
  facultyId: '',
  semesterId: '',
  attendanceDate: '',
  status: 'PRESENT',
};

const Attendance = () => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);

  const [records, setRecords] = useState([]);

  const [filterSubject, setFilterSubject] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = creating new, else editing this record
  const [loading, setLoading] = useState(false);
  const [facultyProfile, setFacultyProfile] = useState(null);

  // Fetch latest data from server
  const fetchDropdownData = async () => {
    try {
      const [subRes, semRes, stuRes, facRes] = await Promise.all([
        getAllSubjects(),
        getAllSemesters(),
        getAllStudents(),
        getFacultyByUserId(user.userId),
      ]);
      setSubjects(subRes.data);
      setSemesters(semRes.data);
      setStudents(stuRes.data);
      setFacultyProfile(facRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
         toast.error('Faculty profile not found. Please complete your profile.');
      } else {
         toast.error('Failed to load dropdown data');
      }
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []); // run only on first mount

  // Fetch latest data from server
  const fetchRecords = async () => {
    if (!filterSubject || !filterSemester) {
      toast.info('Select a subject and semester to view attendance');
      return;
    }

    setLoading(true);
    try {
      const res = await getAttendanceBySubjectAndSemester(filterSubject, filterSemester);
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Open create modal dialog
  const openCreateModal = () => {
    if (!facultyProfile) {
      toast.error("Please complete your faculty profile first.");
      return;
    }
    setFormData({
      ...emptyForm,
      facultyId: facultyProfile.facultyId,
      subjectId: filterSubject,
      semesterId: filterSemester,
      attendanceDate: new Date().toISOString().split('T')[0], // yyyy-mm-dd
    });
    setEditingId(null);
    setShowModal(true);
  };

  // Open edit modal dialog
  const openEditModal = (record) => {
    setFormData({
      studentId: record.studentId,
      subjectId: record.subjectId,
      facultyId: record.facultyId,
      semesterId: record.semesterId,
      attendanceDate: record.attendanceDate,
      status: record.status,
    });
    setEditingId(record.attendanceId);
    setShowModal(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      studentId: Number(formData.studentId),
      subjectId: Number(formData.subjectId),
      facultyId: Number(formData.facultyId),
      semesterId: Number(formData.semesterId),
      attendanceDate: formData.attendanceDate,
      status: formData.status,
    };

    try {
      if (editingId) {
        await updateAttendance(editingId, payload);
        toast.success('Attendance updated');
      } else {
        await markAttendance(payload);
        toast.success('Attendance marked');
      }

      setShowModal(false);
      fetchRecords(); // refresh the table so the change is visible immediately
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <DashboardLayout links={facultyLinks}>
      <h3 className="mb-3">Attendance</h3>

      {}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.subjectId} value={s.subjectId}>
                {s.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
          >
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s.semesterId} value={s.semesterId}>
                {s.semesterName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <button className="btn btn-outline-primary w-100" onClick={fetchRecords}>
            View
          </button>
        </div>

        <div className="col-md-2">
          {}
          <button
            className="btn btn-primary w-100"
            onClick={openCreateModal}
            disabled={!filterSubject || !filterSemester}
          >
            + Mark
          </button>
        </div>
      </div>

      {}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-striped table-bordered bg-white">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.attendanceId}>
                <td>{r.attendanceId}</td>
                <td>{r.studentName}</td>
                <td>{r.subjectName}</td>
                <td>{r.attendanceDate}</td>
                <td>
                  {}
                  <span className={`badge ${r.status === 'PRESENT' ? 'bg-success' : 'bg-danger'}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(r)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {}
            {records.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No records — select subject & semester, then click View
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingId ? 'Edit Attendance' : 'Mark Attendance'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Student</label>
                    {}
                    <select
                      className="form-select"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      disabled={!!editingId}
                    >
                      <option value="">Select student</option>
                      {students.map((s) => (
                        <option key={s.studentId} value={s.studentId}>
                          {s.fullName} ({s.enrollmentNo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="attendanceDate"
                      value={formData.attendanceDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update' : 'Mark'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Attendance;
