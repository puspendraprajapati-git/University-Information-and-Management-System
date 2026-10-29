import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { GraduationCap, UserCheck } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const CompleteProfile = ({ role }) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    deptId: '',
    currentSemesterId: '',
    dateOfBirth: '',
    qualification: '',
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
          userId: user?.userId || user?.id,
          enrollmentNo: "STU" + Date.now(),
          fullName: formData.fullName,
          deptId: Number(formData.deptId),
          currentSemesterId: formData.currentSemesterId ? Number(formData.currentSemesterId) : null,
          dateOfBirth: formData.dateOfBirth
        };
        await axiosInstance.post('/students', payload);
        toast.success("Profile completed successfully!");
        window.location.reload();
      } else if (role === 'FACULTY') {
        const payload = {
          userId: user?.userId || user?.id,
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
      const data = err.response?.data;
      if (data?.validationErrors) {
        Object.values(data.validationErrors).forEach(msg => toast.error(msg));
      } else {
        toast.error(data?.message || "Failed to complete profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: "520px" }}>
        <div className="text-center mb-4">
          <div className="auth-brand-badge mx-auto">
            <GraduationCap size={24} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Complete Your Profile</h3>
          <p className="text-muted small">
            Please provide the following details to access your {role?.toLowerCase()} dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="fullName"
              placeholder="e.g. Dr. John Doe"
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
                <option key={dept.deptId} value={dept.deptId}>
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
                    <option key={sem.semesterId} value={sem.semesterId}>
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
                placeholder="e.g. Ph.D. in Computer Science"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mt-4"
            disabled={loading}
          >
            <UserCheck size={18} />
            <span>{loading ? "Saving Profile..." : "Save Profile"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
