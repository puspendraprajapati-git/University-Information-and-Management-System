import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { facultyLinks } from '../../components/layout/Sidebar';
import { getFacultyById } from '../../services/facultyService';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest data from server
    const fetchProfile = async () => {
      try {
        const res = await getFacultyById(user.userId);
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

  return (
    <DashboardLayout links={facultyLinks}>
      <h3 className="mb-3">My Profile</h3>

      {loading ? (
        <p>Loading...</p>
      ) : !profile ? (
        <div className="alert alert-warning">
          No faculty profile found. Please contact the admin to complete your registration.
        </div>
      ) : (
        <div className="card shadow-sm" style={{ maxWidth: '500px' }}>
          <div className="card-body">
            <table className="table table-borderless mb-0">
              <tbody>
                <tr><th>Faculty ID</th><td>{profile.facultyId}</td></tr>
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
