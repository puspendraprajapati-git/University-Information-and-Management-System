import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/common/ConfirmModal";

import {
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "../../services/facultyService";

import { getAllDepartments } from "../../services/departmentService";
import { getAllUsers } from "../../services/userService";

// Default values for faculty form
const emptyForm = {
  userId: "",
  fullName: "",
  deptId: "",
  qualification: "",
};


const Faculty = () => {

  // Store faculty records
  const [facultyList, setFacultyList] = useState([]);

  // Store department list for dropdown
  const [departments, setDepartments] = useState([]);

  // Store users who can be assigned as faculty
  const [availableUsers, setAvailableUsers] = useState([]);

  // Show loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Control add/edit modal visibility
  const [showModal, setShowModal] = useState(false);

  // Store form values
  const [formData, setFormData] = useState(emptyForm);

  // Store faculty id while editing
  const [editingId, setEditingId] = useState(null);

  // Store selected faculty id for deletion
  const [deleteId, setDeleteId] = useState(null);


  // Fetch faculty, department and user data
  const fetchAll = async () => {
    setLoading(true);

    try {
      const [facRes, deptRes, userRes] = await Promise.all([
        getAllFaculty(),
        getAllDepartments(),
        getAllUsers(),
      ]);

      setFacultyList(facRes.data);
      setDepartments(deptRes.data);

      // Find users who have FACULTY role but no faculty profile yet
      const existingFacultyIds = facRes.data.map(
        (faculty) => faculty.facultyId
      );

      setAvailableUsers(
        userRes.data.filter(
          (user) =>
            user.role === "FACULTY" &&
            !existingFacultyIds.includes(user.userId)
        )
      );

    } catch (err) {
      toast.error("Failed to load faculty data");
    } finally {
      setLoading(false);
    }
  };


  // Load data when component starts
  useEffect(() => {
    fetchAll();
  }, []);


  // Open modal for adding new faculty
  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };


  // Open modal with existing faculty details
  const openEditModal = (fac) => {
    setFormData({
      userId: fac.facultyId,
      fullName: fac.fullName,
      deptId: fac.deptId,
      qualification: fac.qualification || "",
    });

    setEditingId(fac.facultyId);
    setShowModal(true);
  };


  // Update form values when user enters data
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // Handle create and update faculty operations
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data before sending to backend
    const payload = {
      userId: Number(formData.userId),
      fullName: formData.fullName,
      deptId: Number(formData.deptId),
      qualification: formData.qualification,
    };

    try {

      if (editingId) {
        // Update existing faculty
        await updateFaculty(editingId, payload);
        toast.success("Faculty updated");

      } else {
        // Create new faculty
        await createFaculty(payload);
        toast.success("Faculty created");
      }

      setShowModal(false);
      fetchAll();

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Operation failed"
      );
    }
  };


  // Delete selected faculty member
  const handleDelete = async () => {
    try {
      await deleteFaculty(deleteId);

      toast.success("Faculty deleted");

      setDeleteId(null);

      fetchAll();

    } catch (err) {
      toast.error("Failed to delete faculty");
      setDeleteId(null);
    }
  };


  return (
    <DashboardLayout>

      {/* Page header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Faculty</h3>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          + Add Faculty
        </button>
      </div>


      {/* Faculty table */}
      {loading ? (
        <p>Loading...</p>
      ) : (

        <table className="table table-striped table-bordered bg-white">

          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Qualification</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>


          <tbody>

            {facultyList.map((fac) => (
              <tr key={fac.facultyId}>

                <td>{fac.facultyId}</td>
                <td>{fac.fullName}</td>
                <td>{fac.deptName}</td>
                <td>{fac.qualification}</td>
                <td>{fac.username}</td>

                <td>

                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openEditModal(fac)}
                  >
                    Edit
                  </button>


                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeleteId(fac.facultyId)}
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}


            {/* Show message when faculty list is empty */}
            {facultyList.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No faculty found
                </td>
              </tr>
            )}

          </tbody>

        </table>
      )}


      {/* Add and update faculty modal */}
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
                    {editingId ? "Edit Faculty" : "Add Faculty"}
                  </h5>


                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>

                </div>


                <div className="modal-body">

                  {/* User selection only required while creating */}
                  {!editingId && (
                    <div className="mb-3">

                      <label className="form-label">
                        User Account (must have role FACULTY)
                      </label>


                      <select
                        className="form-select"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                      >

                        <option value="">
                          Select user
                        </option>

                        {availableUsers.map((u) => (
                          <option
                            key={u.userId}
                            value={u.userId}
                          >
                            {u.username} ({u.email})
                          </option>
                        ))}

                      </select>


                      {availableUsers.length === 0 && (
                        <small className="text-danger">
                          No unassigned FACULTY-role users. Register one first.
                        </small>
                      )}

                    </div>
                  )}


                  <div className="mb-3">

                    <label className="form-label">
                      Full Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="mb-3">

                    <label className="form-label">
                      Department
                    </label>


                    <select
                      className="form-select"
                      name="deptId"
                      value={formData.deptId}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select department
                      </option>

                      {departments.map((dept) => (
                        <option
                          key={dept.deptId}
                          value={dept.deptId}
                        >
                          {dept.deptName}
                        </option>
                      ))}

                    </select>

                  </div>


                  <div className="mb-3">

                    <label className="form-label">
                      Qualification
                    </label>


                    <input
                      type="text"
                      className="form-control"
                      name="qualification"
                      value={formData.qualification}
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


      {/* Delete confirmation */}
      <ConfirmModal
        show={!!deleteId}
        title="Delete Faculty"
        message="Are you sure you want to delete this faculty member?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

    </DashboardLayout>
  );
};

export default Faculty;