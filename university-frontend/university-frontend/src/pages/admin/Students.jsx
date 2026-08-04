import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/common/ConfirmModal";

import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
} from "../../services/studentService";

import { getAllDepartments } from "../../services/departmentService";
import { getAllUsers } from "../../services/userService";

const emptyForm = {
  userId: "",
  enrollmentNo: "",
  fullName: "",
  deptId: "",
  currentSemester: "",
  dateOfBirth: "",
};

const Students = () => {

  const [students, setStudents] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [availableUsers, setAvailableUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch latest data from server
  const fetchAll = async () => {

    setLoading(true);

    try {

      const [stuRes, deptRes, userRes] = await Promise.all([
        getAllStudents(),
        getAllDepartments(),
        getAllUsers(),
      ]);

      setStudents(stuRes.data);

      setDepartments(deptRes.data);

      const existingStudentIds = stuRes.data.map(
        (student) => student.studentId
      );

      setAvailableUsers(
        userRes.data.filter(
          (user) =>
            user.role === "STUDENT" &&
            !existingStudentIds.includes(user.userId)
        )
      );

    } catch (err) {

      toast.error("Failed to load students data");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchAll();

  }, []);

  // Handle search action
  const handleSearch = async (e) => {

    e.preventDefault();

    if (!searchTerm.trim()) {

      fetchAll();

      return;

    }

    try {

      const res = await searchStudents(searchTerm);

      setStudents(res.data);

    } catch (err) {

      toast.error("Search failed");

    }

  };

  // Open create modal dialog
  const openCreateModal = () => {

    setFormData(emptyForm);

    setEditingId(null);

    setShowModal(true);

  };

  // Open edit modal dialog
  const openEditModal = (stu) => {

    setFormData({

      userId: stu.studentId,

      enrollmentNo: stu.enrollmentNo,

      fullName: stu.fullName,

      deptId: stu.deptId,

      currentSemester: stu.currentSemester || "",

      dateOfBirth: stu.dateOfBirth || "",

    });

    setEditingId(stu.studentId);

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

      userId: Number(formData.userId),

      enrollmentNo: formData.enrollmentNo,

      fullName: formData.fullName,

      deptId: Number(formData.deptId),

      currentSemester: formData.currentSemester
        ? Number(formData.currentSemester)
        : null,

      dateOfBirth: formData.dateOfBirth || null,

    };

    try {

      if (editingId) {

        await updateStudent(editingId, payload);

        toast.success("Student updated");

      } else {

        await createStudent(payload);

        toast.success("Student created");

      }

      setShowModal(false);

      fetchAll();

    } catch (err) {

      toast.error(
        err.response?.data?.message || "Operation failed"
      );

    }

  };

  // Handle delete action 
  const handleDelete = async () => {

    try {

      await deleteStudent(deleteId);

      toast.success("Student deleted");

      setDeleteId(null);

      fetchAll();

    } catch (err) {

      toast.error("Failed to delete student");

      setDeleteId(null);

    }

  };

  return (

    <DashboardLayout>

      {}
      <div className="d-flex justify-content-between align-items-center mb-3">

        <h3>
          Students
        </h3>

        <button

          className="btn btn-primary"

          onClick={openCreateModal}

        >

          + Add Student

        </button>

      </div>

      {}
      <form

        className="d-flex mb-3"

        onSubmit={handleSearch}

      >

        <input

          type="text"

          className="form-control me-2"

          placeholder="Search by name..."

          value={searchTerm}

          onChange={(e) => setSearchTerm(e.target.value)}

        />

        <button

          type="submit"

          className="btn btn-outline-secondary"

        >

          Search

        </button>

      </form>

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

              <th>Enrollment No</th>

              <th>Name</th>

              <th>Department</th>

              <th>Semester</th>

              <th>DOB</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {students.map((stu) => (

              <tr key={stu.studentId}>

                <td>
                  {stu.studentId}
                </td>

                <td>
                  {stu.enrollmentNo}
                </td>

                <td>
                  {stu.fullName}
                </td>

                <td>
                  {stu.deptName}
                </td>

                <td>
                  {stu.currentSemester}
                </td>

                <td>
                  {stu.dateOfBirth}
                </td>

                <td>

                  <button

                    className="btn btn-sm btn-outline-primary me-2"

                    onClick={() => openEditModal(stu)}

                  >

                    Edit

                  </button>

                  <button

                    className="btn btn-sm btn-outline-danger"

                    onClick={() => setDeleteId(stu.studentId)}

                  >

                    Delete

                  </button>

                </td>

              </tr>

            ))}

            {students.length === 0 && (

              <tr>

                <td

                  colSpan="7"

                  className="text-center"

                >

                  No students found

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
                      ? "Edit Student"
                      : "Add Student"}

                  </h5>

                  <button

                    type="button"

                    className="btn-close"

                    onClick={() => setShowModal(false)}

                  ></button>

                </div>

                <div className="modal-body">

                  {!editingId && (

                    <div className="mb-3">

                      <label className="form-label">

                        User Account (must have role STUDENT)

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

                    </div>

                  )}

                  <div className="mb-3">

                    <label className="form-label">

                      Enrollment No

                    </label>

                    <input

                      type="text"

                      className="form-control"

                      name="enrollmentNo"

                      value={formData.enrollmentNo}

                      onChange={handleChange}

                      required

                    />

                  </div>

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

                      {departments.map((d) => (

                        <option

                          key={d.deptId}

                          value={d.deptId}

                        >

                          {d.deptName}

                        </option>

                      ))}

                    </select>

                  </div>

                  <div className="mb-3">

                    <label className="form-label">

                      Current Semester

                    </label>

                    <input

                      type="number"

                      className="form-control"

                      name="currentSemester"

                      value={formData.currentSemester}

                      onChange={handleChange}

                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label">

                      Date of Birth

                    </label>

                    <input

                      type="date"

                      className="form-control"

                      name="dateOfBirth"

                      value={formData.dateOfBirth}

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

        title="Delete Student"

        message="Are you sure you want to delete this student?"

        onConfirm={handleDelete}

        onCancel={() => setDeleteId(null)}

      />

    </DashboardLayout>

  );

};

export default Students;
