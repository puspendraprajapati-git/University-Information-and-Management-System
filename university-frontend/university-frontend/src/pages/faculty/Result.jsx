import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { facultyLinks } from '../../components/layout/Sidebar';
import { getAllResults, uploadResult, updateResult, deleteResult } from '../../services/resultService';
import { getAllStudents } from '../../services/studentService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllSemesters } from '../../services/semesterService';
import ConfirmModal from '../../components/common/ConfirmModal';

const emptyForm = { studentId: '', subjectId: '', semesterId: '', theoryMarks: '', practicalMarks: '' };

const Results = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch latest data from server
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resRes, stuRes, subRes, semRes] = await Promise.all([
        getAllResults(), getAllStudents(), getAllSubjects(), getAllSemesters(),
      ]);
      setResults(resRes.data);
      setStudents(stuRes.data);
      setSubjects(subRes.data);
      setSemesters(semRes.data);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to load data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Open create modal dialog
  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  // Open edit modal dialog
  const openEditModal = (r) => {
    setFormData({
      studentId: r.studentId,
      subjectId: r.subjectId,
      semesterId: r.semesterId,
      theoryMarks: r.theoryMarks,
      practicalMarks: r.practicalMarks,
    });
    setEditingId(r.resultId);
    setShowModal(true);
  };

  // Handle input changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      studentId: Number(formData.studentId),
      subjectId: Number(formData.subjectId),
      semesterId: Number(formData.semesterId),
      theoryMarks: Number(formData.theoryMarks),
      practicalMarks: Number(formData.practicalMarks),
    };
    try {
      if (editingId) {
        await updateResult(editingId, payload);
        toast.success('Result updated');
      } else {
        await uploadResult(payload);
        toast.success('Result uploaded');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  // Handle delete action 
  const handleDelete = async () => {
    try {
      await deleteResult(deleteId);
      toast.success('Result deleted');
      setDeleteId(null);
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete result');
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout links={facultyLinks}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Results</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Upload Marks</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="table table-striped table-bordered bg-white">
          <thead className="table-dark">
            <tr><th>ID</th><th>Student</th><th>Subject</th><th>Semester</th><th>Theory</th><th>Practical</th><th>Total</th><th>Grade</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.resultId}>
                <td>{r.resultId}</td>
                <td>{r.studentName}</td>
                <td>{r.subjectName}</td>
                <td>{r.semesterName}</td>
                <td>{r.theoryMarks}</td>
                <td>{r.practicalMarks}</td>
                <td>{r.totalMarks}</td>
                <td><span className="badge bg-info text-dark">{r.grade}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(r)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(r.resultId)}>Delete</button>
                </td>
              </tr>
            ))}
            {results.length === 0 && <tr><td colSpan="9" className="text-center">No results found</td></tr>}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingId ? 'Edit Result' : 'Upload Marks'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Student</label>
                    <select className="form-select" name="studentId" value={formData.studentId} onChange={handleChange} required>
                      <option value="">Select student</option>
                      {students.map((s) => <option key={s.studentId} value={s.studentId}>{s.fullName} ({s.enrollmentNo})</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <select className="form-select" name="subjectId" value={formData.subjectId} onChange={handleChange} required>
                      <option value="">Select subject</option>
                      {subjects.map((s) => <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Semester</label>
                    <select className="form-select" name="semesterId" value={formData.semesterId} onChange={handleChange} required>
                      <option value="">Select semester</option>
                      {semesters.map((s) => <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>)}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Theory Marks (/100)</label>
                      <input type="number" className="form-control" name="theoryMarks" value={formData.theoryMarks} onChange={handleChange} min="0" max="100" required />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">Practical Marks (/100)</label>
                      <input type="number" className="form-control" name="practicalMarks" value={formData.practicalMarks} onChange={handleChange} min="0" max="100" required />
                    </div>
                  </div>
                  <small className="text-muted">Total marks and grade are calculated automatically.</small>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Upload'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={!!deleteId}
        title="Delete Result"
        message="Are you sure you want to delete this result?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
};

export default Results;
