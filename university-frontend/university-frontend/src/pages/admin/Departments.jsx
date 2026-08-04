import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/common/ConfirmModal";

import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentService";

const emptyForm = {
  deptName: "",
  deptCode: "",
  hodId: "",
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  // Fetch latest data from server
  const fetchDepartments = async () => {
    setLoading(true);

    try {
      const res = await getAllDepartments();

      setDepartments(res.data);
    } catch (err) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Open create modal dialog
  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  // Open edit modal dialog
  const openEditModal = (dept) => {
    setFormData({
      deptName: dept.deptName,
      deptCode: dept.deptCode,
      hodId: dept.hodId || "",
    });

    setEditingId(dept.deptId);
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
      hodId: formData.hodId ? Number(formData.hodId) : null,
    };

    try {
      if (editingId) {
        await updateDepartment(editingId, payload);
        toast.success("Department updated");
      } else {
        await createDepartment(payload);
        toast.success("Department created");
      }

      setShowModal(false);
      fetchDepartments();

    } catch (err) {
      const message =
        err.response?.data?.message || "Operation failed";

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
      await deleteDepartment(deleteId);

      toast.success("Department deleted");

      setDeleteId(null);

      fetchDepartments();

    } catch (err) {
      toast.error("Failed to delete department");
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>

      {}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Departments</h3>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          + Add Department
        </button>
      </div>

      {}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-striped table-bordered bg-white">

          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>HOD ID</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {departments.map((dept) => (
              <tr key={dept.deptId}>

                <td>{dept.deptId}</td>
                <td>{dept.deptName}</td>
                <td>{dept.deptCode}</td>
                <td>{dept.hodId || "-"}</td>

                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openEditModal(dept)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => confirmDelete(dept.deptId)}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}

            {}
            {departments.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">
                  No departments found
                </td>
              </tr>
            )}

          </tbody>

        </table>
      )}

      {}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >

          <div className="modal-dialog">

            <div className="modal-content">

              <form onSubmit={handleSubmit}>

                <div className="modal-header">

                  <h5 className="modal-title">
                    {editingId ? "Edit Department" : "Add Department"}
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>

                </div>

                <div className="modal-body">

                  <div className="mb-3">
                    <label className="form-label">
                      Department Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="deptName"
                      value={formData.deptName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Department Code
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="deptCode"
                      value={formData.deptCode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      HOD ID (optional)
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      name="hodId"
                      value={formData.hodId}
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

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingId ? "Update" : "Create"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {}
      <ConfirmModal
        show={!!deleteId}
        title="Delete Department"
        message="Are you sure you want to delete this department? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

    </DashboardLayout>
  );
};

export default Departments;
