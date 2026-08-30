import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { facultyLinks } from '../../components/layout/Sidebar';
import { getFacultyByUserId, updateFaculty } from '../../services/facultyService';
import axiosInstance from '../../api/axiosInstance';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getFacultyByUserId(user.userId);
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
      qualification: profile.qualification || ''
    });
    
    if (departments.length === 0) {
      try {
        const deptRes = await axiosInstance.get('/departments');
        setDepartments(deptRes.data);
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
        fullName: editData.fullName,
        deptId: Number(editData.deptId),
        qualification: editData.qualification
      };
      await updateFaculty(profile.facultyId, payload);
      toast.success("Profile updated successfully!");
      
      const res = await getFacultyByUserId(user.userId);
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout links={facultyLinks}>
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
          No faculty profile found. Please contact the admin to complete your registration.
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
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.deptName}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Highest Qualification</label>
                <input type="text" className="form-control" name="qualification" value={editData.qualification} onChange={handleChange} required />
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
                <tr><th style={{width: '150px'}}>Faculty ID</th><td>{profile.facultyId}</td></tr>
                <tr><th>Full Name</th><td>{profile.fullName}</td></tr>
                <tr><th>Username</th><td>{profile.username}</td></tr>
                <tr><th>Email</th><td>{profile.email}</td></tr>
                <tr><th>Department</th><td>{profile.deptName || '-'}</td></tr>
                <tr><th>Qualification</th><td>{profile.qualification || '-'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
