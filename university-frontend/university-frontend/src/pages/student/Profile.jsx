import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getStudentByUserId, updateStudent } from '../../services/studentService';
import axiosInstance from '../../api/axiosInstance';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getStudentByUserId(user.userId);
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          toast.error('Failed to load profile. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.userId]);

  const handleEditClick = async () => {
    setEditData({
      fullName: profile.fullName,
      deptId: profile.deptId,
      currentSemesterId: profile.currentSemesterId || '',
      dateOfBirth: profile.dateOfBirth || '',
      enrollmentNo: profile.enrollmentNo
    });
    
    // Load options if not loaded
    if (departments.length === 0) {
      try {
        const [deptRes, semRes] = await Promise.all([
          axiosInstance.get('/departments'),
          axiosInstance.get('/semesters')
        ]);
        setDepartments(deptRes.data);
        setSemesters(semRes.data);
      } catch (err) {
        toast.error("Failed to load form options");
      }
    }
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        userId: user.userId,
        enrollmentNo: editData.enrollmentNo,
        fullName: editData.fullName,
        deptId: Number(editData.deptId),
        currentSemesterId: editData.currentSemesterId ? Number(editData.currentSemesterId) : null,
        dateOfBirth: editData.dateOfBirth
      };
      await updateStudent(profile.studentId, payload);
      toast.success("Profile updated successfully!");
      
      // Refresh profile data
      const res = await getStudentByUserId(user.userId);
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout links={studentLinks}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Profile</h3>
        {profile && !isEditing && (
          <button className="btn btn-primary btn-sm" onClick={handleEditClick}>
            Edit Profile
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : !profile ? (
        <div className="alert alert-warning">
          No student profile found. Please contact the admin to complete your registration.
        </div>
      ) : isEditing ? (
        <div className="card shadow-sm" style={{ maxWidth: '600px' }}>
          <div className="card-body">
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" name="fullName" value={editData.fullName} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Department</label>
                <select className="form-select" name="deptId" value={editData.deptId} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d.deptId} value={d.deptId}>{d.deptName}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Semester</label>
                <select className="form-select" name="currentSemesterId" value={editData.currentSemesterId} onChange={handleChange} required>
                  <option value="">Select Semester</option>
                  {semesters.map((s) => <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" name="dateOfBirth" value={editData.dateOfBirth} onChange={handleChange} required />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm" style={{ maxWidth: '600px' }}>
          <div className="card-body">
            <table className="table table-borderless mb-0">
              <tbody>
                <tr><th style={{width: '150px'}}>Student ID</th><td>{profile.studentId}</td></tr>
                <tr><th>Full Name</th><td>{profile.fullName}</td></tr>
                <tr><th>Enrollment No.</th><td>{profile.enrollmentNo}</td></tr>
                <tr><th>Username</th><td>{profile.username}</td></tr>
                <tr><th>Email</th><td>{profile.email}</td></tr>
                <tr><th>Department</th><td>{profile.deptName}</td></tr>
                <tr><th>Current Semester</th><td>{profile.currentSemester || '-'}</td></tr>
                <tr><th>Date of Birth</th><td>{profile.dateOfBirth || '-'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
