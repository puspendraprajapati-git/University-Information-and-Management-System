import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const CompleteProfile = ({ role }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    deptId: '',
    currentSemesterId: '',
    dateOfBirth: '',
    qualification: '', // for faculty
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, semRes] = await Promise.all([
          axiosInstance.get('/departments'),
          axiosInstance.get('/semesters')
        ]);
        setDepartments(deptRes.data);
        setSemesters(semRes.data);
      } catch (err) {
        console.error("Failed to load initial data", err);
        toast.error("Failed to load form data");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'STUDENT') {
        const payload = {
          userId: user.userId,
          enrollmentNo: "STU" + Date.now(), // Auto-generate
          fullName: formData.fullName,
          deptId: Number(formData.deptId),
          currentSemesterId: formData.currentSemesterId ? Number(formData.currentSemesterId) : null,
          dateOfBirth: formData.dateOfBirth
        };
        await axiosInstance.post('/students', payload);
        toast.success("Profile completed successfully!");
        window.location.reload(); // Reload to trigger ProtectedRoute check again
      } else if (role === 'FACULTY') {
        const payload = {
          userId: user.userId,
          fullName: formData.fullName,
          deptId: Number(formData.deptId),
          qualification: formData.qualification
        };
        await axiosInstance.post('/faculty', payload);
        toast.success("Profile completed successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-sm p-4 w-50">
        <h3 className="text-center mb-4">Complete Your Profile</h3>
        <p className="text-center text-muted mb-4">
          Please provide the following details to access your dashboard.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
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
            <label className="form-label">Department</label>
            <select
              className="form-select"
              name="deptId"
              value={formData.deptId}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.deptName}
                </option>
              ))}
            </select>
          </div>

          {role === 'STUDENT' && (
            <>
              <div className="mb-3">
                <label className="form-label">Current Semester</label>
                <select
                  className="form-select"
                  name="currentSemesterId"
                  value={formData.currentSemesterId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.semesterName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {role === 'FACULTY' && (
            <div className="mb-3">
              <label className="form-label">Highest Qualification</label>
              <input
                type="text"
                className="form-control"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                placeholder="e.g., Ph.D. in Computer Science"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
