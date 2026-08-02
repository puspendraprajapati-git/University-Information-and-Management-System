import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getStudentById } from '../../services/studentService';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getStudentById(user.userId);
        setProfile(res.data);
      } catch (err) {
        toast.error('Failed to load profile. Your student record may not be set up yet — contact admin.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.userId]);

  return (
    <DashboardLayout links={studentLinks}>
      <h3 className="mb-3">My Profile</h3>

      {loading ? (
        <p>Loading...</p>
      ) : !profile ? (
        <div className="alert alert-warning">
          No student profile found. Please contact the admin to complete your registration.
        </div>
      ) : (
        <div className="card shadow-sm" style={{ maxWidth: '500px' }}>
          <div className="card-body">
            <table className="table table-borderless mb-0">
              <tbody>
                <tr><th>Student ID</th><td>{profile.studentId}</td></tr>
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