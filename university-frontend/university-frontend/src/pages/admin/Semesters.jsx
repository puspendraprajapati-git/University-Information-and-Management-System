import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/common/ConfirmModal";

import {
  getAllSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../../services/semesterService";

const emptyForm = {
  semesterName: "",
  startDate: "",
  endDate: "",
  year: "",
};

const Semesters = () => {

  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  // Fetch latest data from server
  const fetchSemesters = async () => {

    setLoading(true);

    try {

      const res = await getAllSemesters();

      setSemesters(res.data);

    } catch (err) {

      toast.error("Failed to load semesters");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchSemesters();

  }, []);

  // Open create modal dialog
  const openCreateModal = () => {

    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);

  };

  // Open edit modal dialog
  const openEditModal = (sem) => {

    setFormData({
      semesterName: sem.semesterName,
      startDate: sem.startDate,
      endDate: sem.endDate,
      year: sem.year,
    });

    setEditingId(sem.semesterId);
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
      year: Number(formData.year),
    };

    try {

      if (editingId) {

        await updateSemester(editingId, payload);

        toast.success("Semester updated");

      } else {

        await createSemester(payload);

        toast.success("Semester created");

      }

      setShowModal(false);
      fetchSemesters();

    } catch (err) {

      toast.error(
        err.response?.data?.message || "Operation failed"
      );

    }

  };

  // Handle delete action 
  const handleDelete = async () => {

    try {

      await deleteSemester(deleteId);

      toast.success("Semester deleted");

      setDeleteId(null);

      fetchSemesters();

    } catch (err) {

      toast.error("Failed to delete semester");

      setDeleteId(null);

    }

  };

  return (

    <DashboardLayout>

      {}
      <div className="d-flex justify-content-between align-items-center mb-3">

        <h3>
          Semesters
        </h3>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          + Add Semester
        </button>

      </div>

      {}
      {loading ? (

        <p>
          Loading...
        </p>

      ) : (

        <table className="table table-striped table-bordered bg-white">

          <thead className="table-dark">

            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {semesters.map((sem) => (

              <tr key={sem.semesterId}>

                <td>
                  {sem.semesterId}
                </td>

                <td>
                  {sem.semesterName}
                </td>

                <td>
                  {sem.startDate}
                </td>

                <td>
                  {sem.endDate}
                </td>

                <td>
                  {sem.year}
                </td>

                <td>

                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openEditModal(sem)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeleteId(sem.semesterId)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

            {}
            {semesters.length === 0 && (

              <tr>

                <td
                  colSpan="6"
                  className="text-center"
                >
                  No semesters found
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

                    {editingId
                      ? "Edit Semester"
                      : "Add Semester"}

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
                      Semester Name
                    </label>

                    <input

                      type="text"

                      className="form-control"

                      name="semesterName"

                      value={formData.semesterName}

                      onChange={handleChange}

                      required

                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      Start Date
                    </label>

                    <input

                      type="date"

                      className="form-control"

                      name="startDate"

                      value={formData.startDate}

                      onChange={handleChange}

                      required

                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      End Date
                    </label>

                    <input

                      type="date"

                      className="form-control"

                      name="endDate"

                      value={formData.endDate}

                      onChange={handleChange}

                      required

                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      Year
                    </label>

                    <input

                      type="number"

                      className="form-control"

                      name="year"

                      value={formData.year}

                      onChange={handleChange}

                      required

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

        title="Delete Semester"

        message="Are you sure you want to delete this semester?"

        onConfirm={handleDelete}

        onCancel={() => setDeleteId(null)}

      />

    </DashboardLayout>

  );

};

export default Semesters;
