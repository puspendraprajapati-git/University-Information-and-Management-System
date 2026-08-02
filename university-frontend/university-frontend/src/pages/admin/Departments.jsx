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

// Default form values used while creating a new department
const emptyForm = {
  deptName: "",
  deptCode: "",
  hodId: "",
};

const Departments = () => {
  // Store department list received from backend
  const [departments, setDepartments] = useState([]);

  // Show loading status while fetching data
  const [loading, setLoading] = useState(true);

  // Controls create/update modal visibility
  const [showModal, setShowModal] = useState(false);

  // Stores form input values
  const [formData, setFormData] = useState(emptyForm);

  // Stores department id while editing
  const [editingId, setEditingId] = useState(null);

  // Stores department id selected for deletion
  const [deleteId, setDeleteId] = useState(null);


  // Fetch all departments from backend
  const fetchDepartments = async () => {
    setLoading(true);

    try {
      const res = await getAllDepartments();

      // Save department data in state
      setDepartments(res.data);
    } catch (err) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };


  // Load departments when component is mounted
  useEffect(() => {
    fetchDepartments();
  }, []);


  // Open modal for creating a new department
  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };


  // Open modal with existing department data for editing
  const openEditModal = (dept) => {
    setFormData({
      deptName: dept.deptName,
      deptCode: dept.deptCode,
      hodId: dept.hodId || "",
    });

    setEditingId(dept.deptId);
    setShowModal(true);
  };


  // Update form values when user types
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // Handle create and update operations
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert HOD id from string to number before sending
    const payload = {
      ...formData,
      hodId: formData.hodId ? Number(formData.hodId) : null,
    };

    try {
      if (editingId) {
        // Update existing department
        await updateDepartment(editingId, payload);
        toast.success("Department updated");
      } else {
        // Create new department
        await createDepartment(payload);
        toast.success("Department created");
      }

      // Close modal and refresh table data
      setShowModal(false);
      fetchDepartments();

    } catch (err) {
      const message =
        err.response?.data?.message || "Operation failed";

      toast.error(message);
    }
  };


  // Store department id before showing delete confirmation
  const confirmDelete = (id) => {
    setDeleteId(id);
  };


  // Delete selected department
  const handleDelete = async () => {
    try {
      await deleteDepartment(deleteId);

      toast.success("Department deleted");

      setDeleteId(null);

      // Refresh department list after deletion
      fetchDepartments();

    } catch (err) {
      toast.error("Failed to delete department");
      setDeleteId(null);
    }
  };


  return (
    <DashboardLayout>

      {/* Page header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Departments</h3>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          + Add Department
        </button>
      </div>


      {/* Display loading message or department table */}
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


            {/* Show message when no departments exist */}
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


      {/* Create and update department modal */}
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


      {/* Delete confirmation modal */}
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