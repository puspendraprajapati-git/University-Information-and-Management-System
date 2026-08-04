import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/common/ConfirmModal";

import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../services/subjectService";

const emptyForm = {
  subjectName: "",
  subjectCode: "",
  deptId: "",
  semesterId: "",
  credits: "",
  syllabusPath: "",
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch latest data from server
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await getAllSubjects();
      setSubjects(res.data);
    } catch (err) {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Open create modal dialog
  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  // Open edit modal dialog
  const openEditModal = (subject) => {
    setFormData({
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      deptId: subject.deptId || "",
      semesterId: subject.semesterId || "",
      credits: subject.credits || "",
      syllabusPath: subject.syllabusPath || "",
    });
    setEditingId(subject.subjectId);
    setShowModal(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      deptId: formData.deptId ? Number(formData.deptId) : null,
      semesterId: formData.semesterId ? Number(formData.semesterId) : null,
      credits: formData.credits ? Number(formData.credits) : null,
    };

    try {
      if (editingId) {
        await updateSubject(editingId, payload);
        toast.success("Subject updated");
      } else {
        await createSubject(payload);
        toast.success("Subject created");
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      const message = err.response?.data?.message || "Operation failed";
      toast.error(message);
    }
  };

  // Execute confirm delete function
  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  // Handle delete action 
  const handleDelete = async () => {
    try {
      await deleteSubject(deleteId);
      toast.success("Subject deleted");
      setDeleteId(null);
      fetchSubjects();
    } catch (err) {
      toast.error("Failed to delete subject");
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Subjects</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add Subject
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-striped table-bordered bg-white">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Dept ID</th>
              <th>Semester ID</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => (
              <tr key={sub.subjectId}>
                <td>{sub.subjectId}</td>
                <td>{sub.subjectCode}</td>
                <td>{sub.subjectName}</td>
                <td>{sub.deptId || "-"}</td>
                <td>{sub.semesterId || "-"}</td>
                <td>{sub.credits || "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openEditModal(sub)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => confirmDelete(sub.subjectId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">
                  No subjects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId ? "Edit Subject" : "Add Subject"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Subject Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subjectCode"
                      value={formData.subjectCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subject Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subjectName"
                      value={formData.subjectName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department ID</label>
                    <input
                      type="number"
                      className="form-control"
                      name="deptId"
                      value={formData.deptId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Semester ID</label>
                    <input
                      type="number"
                      className="form-control"
                      name="semesterId"
                      value={formData.semesterId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Credits</label>
                    <input
                      type="number"
                      className="form-control"
                      name="credits"
                      value={formData.credits}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={!!deleteId}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
};

export default Subjects;
