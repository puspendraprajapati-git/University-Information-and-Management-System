import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getAllSubjects } from '../../services/subjectService';
import { getStudentByUserId } from '../../services/studentService';
import {
  getAllAssignments,
  getSubmissionsByStudent,
  submitAssignment,
} from '../../services/lmsService';

const StudentAssignments = () => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, stuRes, assignRes] = await Promise.all([
        getAllSubjects(),
        getStudentByUserId(user.userId),
        getAllAssignments(),
      ]);

      setSubjects(subRes.data || []);
      const stu = stuRes.data;
      setStudentProfile(stu);
      setAssignments(assignRes.data || []);

      if (stu?.studentId) {
        const subs = await getSubmissionsByStudent(stu.studentId);
        setMySubmissions(subs.data || []);
      }
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenSubmit = (assignment) => {
    setActiveAssignment(assignment);
    setSelectedFile(null);
    setShowSubmitModal(true);
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to submit');
      return;
    }
    if (!studentProfile?.studentId) {
      toast.error('Student profile not found. Please complete your profile.');
      return;
    }

    const formData = new FormData();
    formData.append('assignmentId', activeAssignment.assignmentId);
    formData.append('studentId', studentProfile.studentId);
    formData.append('file', selectedFile);

    setSubmitting(true);
    try {
      await submitAssignment(formData);
      toast.success('Assignment submitted successfully!');
      setShowSubmitModal(false);
      setSelectedFile(null);

      // Refresh submissions
      const subs = await getSubmissionsByStudent(studentProfile.studentId);
      setMySubmissions(subs.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return mySubmissions.find((s) => String(s.assignmentId) === String(assignmentId));
  };

  const filteredAssignments = selectedSubject
    ? assignments.filter((a) => String(a.subjectId) === String(selectedSubject))
    : assignments;

  const getSubjectName = (id) => {
    const s = subjects.find((sub) => String(sub.subjectId) === String(id));
    return s ? `${s.subjectCode} - ${s.subjectName}` : `Subject #${id}`;
  };

  return (
    <DashboardLayout links={studentLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h3 className="fw-bold mb-1">My Course Assignments</h3>
            <p className="text-muted mb-0">View assigned coursework, submit programming code or PDF reports, and check evaluations.</p>
          </div>
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
                Assignments Available: <strong>{filteredAssignments.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Assignments Cards */}
        {loading ? (
          <div className="p-4 text-center text-muted">Loading assignments...</div>
        ) : filteredAssignments.length === 0 ? (
          <div className="card shadow-sm border-0 bg-white p-5 text-center text-muted">
            <h5>No assignments found</h5>
            <p className="mb-0">Your instructors have not published any assignments for this selection.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredAssignments.map((a) => {
              const sub = getSubmissionForAssignment(a.assignmentId);
              const isPastDue = a.dueDate && new Date() > new Date(a.dueDate);

              return (
                <div key={a.assignmentId} className="col-md-6 col-lg-6">
                  <div className="card shadow-sm border-0 h-100 bg-white">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-primary-subtle text-primary border">
                          {getSubjectName(a.subjectId)}
                        </span>
                        <span className="badge bg-secondary">{a.maxMarks || 100} Marks</span>
                      </div>

                      <h5 className="fw-bold mb-2">{a.title}</h5>

                      {a.description && (
                        <p className="text-muted small flex-grow-1 mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                          {a.description}
                        </p>
                      )}

                      <div className="small text-muted mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Deadline:</span>
                          <strong className={isPastDue ? 'text-danger' : 'text-dark'}>
                            {a.dueDate ? new Date(a.dueDate).toLocaleString() : 'No deadline'}
                          </strong>
                        </div>
                      </div>

                      {/* Submission / Grade status banner */}
                      {sub ? (
                        <div className="p-3 bg-light rounded border mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small fw-semibold">Status:</span>
                            <span
                              className={`badge ${
                                sub.status === 'EVALUATED'
                                  ? 'bg-success'
                                  : sub.status === 'LATE'
                                  ? 'bg-warning text-dark'
                                  : 'bg-info text-dark'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>

                          <div className="small text-muted mb-2">
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString()} ({sub.fileName})
                          </div>

                          {sub.status === 'EVALUATED' && (
                            <div className="mt-2 pt-2 border-top">
                              <div className="d-flex justify-content-between">
                                <span className="fw-bold text-success">Grade Obtained:</span>
                                <span className="fw-bold text-success fs-6">
                                  {sub.marks} / {sub.maxMarks || a.maxMarks} pts
                                </span>
                              </div>
                              {sub.feedback && (
                                <p className="small text-muted mb-0 mt-1">
                                  <strong>Faculty Feedback:</strong> {sub.feedback}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="alert alert-warning py-2 px-3 small mb-3">
                          Not submitted yet
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-auto d-flex gap-2">
                        <button
                          className={`btn btn-sm ${sub ? 'btn-outline-primary' : 'btn-primary'} flex-grow-1`}
                          onClick={() => handleOpenSubmit(a)}
                        >
                          {sub ? 'Resubmit Work' : 'Submit Assignment'}
                        </button>
                        {sub && (
                          <a
                            href={`http://localhost:5000${sub.downloadUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Download Submitted
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <form onSubmit={handleSubmitFile}>
                  <div className="modal-header">
                    <div>
                      <h5 className="modal-title fw-bold">Submit Assignment</h5>
                      <small className="text-muted">{activeAssignment?.title}</small>
                    </div>
                    <button type="button" className="btn-close" onClick={() => setShowSubmitModal(false)} />
                  </div>
                  <div className="modal-body">
                    <p className="small text-muted mb-3">
                      Upload your solution file. Supported formats include source code (e.g. <code>.java</code>, <code>.py</code>, <code>.cpp</code>), compressed archives (<code>.zip</code>), or documents (<code>.pdf</code>, <code>.docx</code>).
                    </p>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Choose Solution File *</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSubmitModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Uploading...' : 'Upload & Submit'}
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

export default StudentAssignments;
