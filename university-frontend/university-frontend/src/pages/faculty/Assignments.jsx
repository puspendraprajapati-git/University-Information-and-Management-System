import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { facultyLinks } from '../../components/layout/Sidebar';
import { getAllSubjects } from '../../services/subjectService';
import { getFacultyByUserId } from '../../services/facultyService';
import { getAllStudents } from '../../services/studentService';
import {
  createAssignment,
  deleteAssignment,
  getAllAssignments,
  getSubmissionsByAssignment,
  evaluateSubmission,
} from '../../services/lmsService';

const emptyForm = {
  subjectId: '',
  title: '',
  description: '',
  dueDate: '',
  maxMarks: 100,
};

const FacultyAssignments = () => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  // Create Assignment Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // View & Grade Submissions Modal
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  // Grade Form State
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const loadInitialData = async () => {
    try {
      const [subRes, stuRes, facRes] = await Promise.all([
        getAllSubjects(),
        getAllStudents(),
        getFacultyByUserId(user.userId),
      ]);
      setSubjects(subRes.data || []);
      setStudents(stuRes.data || []);
      setFacultyProfile(facRes.data);
    } catch (err) {
      toast.error('Failed to load profile and subject records');
    }
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await getAllAssignments();
      setAssignments(res.data || []);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    loadAssignments();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.title) {
      toast.error('Please choose a subject and enter an assignment title');
      return;
    }

    try {
      await createAssignment({
        subjectId: Number(formData.subjectId),
        facultyId: facultyProfile?.facultyId || user.userId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate ? formData.dueDate : null,
        maxMarks: Number(formData.maxMarks),
      });

      toast.success('Assignment published successfully!');
      setShowCreateModal(false);
      setFormData(emptyForm);
      loadAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      toast.success('Assignment deleted');
      loadAssignments();
    } catch (err) {
      toast.error('Failed to delete assignment');
    }
  };

  const handleOpenSubmissions = async (assignment) => {
    setActiveAssignment(assignment);
    setShowSubmissionsModal(true);
    setSubLoading(true);
    try {
      const res = await getSubmissionsByAssignment(assignment.assignmentId);
      setSubmissions(res.data || []);
    } catch (err) {
      toast.error('Failed to load student submissions');
    } finally {
      setSubLoading(false);
    }
  };

  const handleGradeSubmit = async (submissionId) => {
    if (!gradeMarks && gradeMarks !== 0) {
      toast.error('Please enter marks');
      return;
    }
    if (activeAssignment?.maxMarks && Number(gradeMarks) > activeAssignment.maxMarks) {
      toast.error(`Marks cannot exceed ${activeAssignment.maxMarks}`);
      return;
    }

    try {
      await evaluateSubmission({
        submissionId: submissionId,
        evaluatorId: facultyProfile?.facultyId || user.userId,
        marks: Number(gradeMarks),
        feedback: gradeFeedback,
      });

      toast.success('Submission evaluated successfully!');
      setGradingSubmissionId(null);
      setGradeMarks('');
      setGradeFeedback('');

      // Refresh submissions
      const res = await getSubmissionsByAssignment(activeAssignment.assignmentId);
      setSubmissions(res.data || []);
    } catch (err) {
      toast.error('Failed to save evaluation');
    }
  };

  const filteredAssignments = selectedSubject
    ? assignments.filter((a) => String(a.subjectId) === String(selectedSubject))
    : assignments;

  const getSubjectName = (id) => {
    const s = subjects.find((sub) => String(sub.subjectId) === String(id));
    return s ? `${s.subjectCode} - ${s.subjectName}` : `Subject #${id}`;
  };

  const getStudentName = (id) => {
    const st = students.find((s) => String(s.studentId) === String(id));
    return st ? `${st.fullName} (${st.enrollmentNo || 'ID: ' + st.studentId})` : `Student #${id}`;
  };

  return (
    <DashboardLayout links={facultyLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h3 className="fw-bold mb-1">Assignment Management</h3>
            <p className="text-muted mb-0">Publish assignments, review code & file submissions, and grade students.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Create Assignment
          </button>
        </div>

        {/* Filter bar */}
        <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <label className="form-label small fw-semibold text-muted">Filter by Subject</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-7 text-md-end mt-md-4">
              <span className="badge bg-light text-dark border px-3 py-2">
                Total Assignments: <strong>{filteredAssignments.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="card shadow-sm border-0 bg-white">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4 text-center text-muted">Loading assignments...</div>
            ) : filteredAssignments.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h5>No assignments found</h5>
                <p className="mb-0">Click "+ Create Assignment" to publish your first assignment.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Due Date</th>
                      <th>Max Marks</th>
                      <th>Submissions</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((a) => (
                      <tr key={a.assignmentId}>
                        <td>
                          <div className="fw-bold">{a.title}</div>
                          {a.description && (
                            <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                              {a.description}
                            </small>
                          )}
                        </td>
                        <td>{getSubjectName(a.subjectId)}</td>
                        <td>
                          {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : <span className="text-muted">No deadline</span>}
                        </td>
                        <td>
                          <span className="badge bg-secondary">{a.maxMarks || 100} pts</span>
                        </td>
                        <td>
                          <span className="badge bg-info text-dark px-2 py-1">
                            {a.submissionCount || 0} Submissions
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleOpenSubmissions(a)}
                          >
                            Review & Grade
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteAssignment(a.assignmentId)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <form onSubmit={handleCreateSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Create New Assignment</h5>
                    <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Subject *</label>
                      <select
                        className="form-select"
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => (
                          <option key={sub.subjectId} value={sub.subjectId}>
                            {sub.subjectCode} - {sub.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Assignment Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Java OOP Lab Assignment 1"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Description & Instructions</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Instructions for students (e.g. submit .java files or zip package)..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="row g-2">
                      <div className="col-md-7 mb-3">
                        <label className="form-label small fw-semibold">Due Date & Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="col-md-5 mb-3">
                        <label className="form-label small fw-semibold">Max Marks</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.maxMarks}
                          onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Publish Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View & Grade Submissions Modal */}
        {showSubmissionsModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title fw-bold">{activeAssignment?.title}</h5>
                    <small className="text-muted">
                      Max Marks: {activeAssignment?.maxMarks} pts | Subject: {getSubjectName(activeAssignment?.subjectId)}
                    </small>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowSubmissionsModal(false)} />
                </div>
                <div className="modal-body">
                  {subLoading ? (
                    <div className="text-center py-4 text-muted">Loading submissions...</div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-4 text-muted">No student submissions received yet.</div>
                  ) : (
                    <div className="list-group">
                      {submissions.map((sub) => (
                        <div key={sub.submissionId} className="list-group-item p-3 mb-2 border rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold mb-1">{getStudentName(sub.studentId)}</h6>
                              <small className="text-muted">
                                Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                              </small>
                            </div>
                            <span
                              className={`badge ${
                                sub.status === 'EVALUATED'
                                  ? 'bg-success'
                                  : sub.status === 'LATE'
                                  ? 'bg-warning text-dark'
                                  : 'bg-primary'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="text-muted small">File:</span>
                            <a
                              href={`http://localhost:5000${sub.downloadUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-secondary"
                            >
                              Download {sub.fileName || 'Submission File'}
                            </a>
                          </div>

                          {/* Evaluation Status */}
                          {sub.status === 'EVALUATED' && (
                            <div className="p-2 bg-light rounded border mb-2">
                              <div className="d-flex justify-content-between">
                                <span className="fw-semibold text-success">
                                  Grade: {sub.marks} / {sub.maxMarks || activeAssignment?.maxMarks} pts
                                </span>
                                <small className="text-muted">
                                  Evaluated on {new Date(sub.evaluatedAt).toLocaleDateString()}
                                </small>
                              </div>
                              {sub.feedback && <p className="small mb-0 mt-1 text-muted">Feedback: {sub.feedback}</p>}
                            </div>
                          )}

                          {/* Inline Grading Form */}
                          {gradingSubmissionId === sub.submissionId ? (
                            <div className="mt-3 p-3 bg-light rounded border">
                              <h6 className="fw-bold small mb-2">Grade Student Submission</h6>
                              <div className="row g-2 mb-2">
                                <div className="col-4">
                                  <label className="form-label small mb-1">Marks (out of {activeAssignment?.maxMarks})</label>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={gradeMarks}
                                    onChange={(e) => setGradeMarks(e.target.value)}
                                    max={activeAssignment?.maxMarks}
                                    min="0"
                                  />
                                </div>
                                <div className="col-8">
                                  <label className="form-label small mb-1">Feedback Comments</label>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="e.g. Well written logic, good error handling."
                                    value={gradeFeedback}
                                    onChange={(e) => setGradeFeedback(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleGradeSubmit(sub.submissionId)}
                                >
                                  Save Grade
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => setGradingSubmissionId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-primary mt-1"
                              onClick={() => {
                                setGradingSubmissionId(sub.submissionId);
                                setGradeMarks(sub.marks !== undefined && sub.marks !== null ? sub.marks : '');
                                setGradeFeedback(sub.feedback || '');
                              }}
                            >
                              {sub.status === 'EVALUATED' ? 'Update Grade & Feedback' : 'Grade Submission'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSubmissionsModal(false)}>
                    Close
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

export default FacultyAssignments;
