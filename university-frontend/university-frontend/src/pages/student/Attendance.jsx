import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getAttendanceByStudent } from '../../services/attendanceService';

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await getAttendanceByStudent(user.userId);
        setRecords(res.data);
      } catch (err) {
        toast.error('Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user.userId]);

  // Group by subject to show a quick summary
  const summary = records.reduce((acc, r) => {
    if (!acc[r.subjectName]) acc[r.subjectName] = { present: 0, total: 0 };
    acc[r.subjectName].total += 1;
    if (r.status === 'PRESENT') acc[r.subjectName].present += 1;
    return acc;
  }, {});

  return (
    <DashboardLayout links={studentLinks}>
      <h3 className="mb-3">My Attendance</h3>

      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <div className="alert alert-info">No attendance records yet.</div>
      ) : (
        <>
          <div className="row mb-4">
            {Object.entries(summary).map(([subject, stats]) => {
              const pct = ((stats.present / stats.total) * 100).toFixed(1);
              const badgeColor = pct >= 75 ? 'bg-success' : pct >= 50 ? 'bg-warning text-dark' : 'bg-danger';
              return (
                <div className="col-md-4 mb-3" key={subject}>
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title">{subject}</h6>
                      <p className="mb-1">{stats.present} / {stats.total} classes</p>
                      <span className={`badge ${badgeColor}`}>{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <table className="table table-striped table-bordered bg-white">
            <thead className="table-dark">
              <tr><th>Date</th><th>Subject</th><th>Status</th></tr>
            </thead>
            <tbody>
              {records
                .slice()
                .sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate))
                .map((r) => (
                  <tr key={r.attendanceId}>
                    <td>{r.attendanceDate}</td>
                    <td>{r.subjectName}</td>
                    <td>
                      <span className={`badge ${r.status === 'PRESENT' ? 'bg-success' : 'bg-danger'}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </DashboardLayout>
  );
};

export default Attendance;