import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getSemesterResult } from '../../services/resultService';
import { getAllSemesters } from '../../services/semesterService';

const Results = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Fetch latest data from server
    const fetchSemesters = async () => {
      try {
        const res = await getAllSemesters();
        setSemesters(res.data);
        if (res.data.length > 0) setSelectedSemester(res.data[0].semesterId);
      } catch (err) {
        toast.error('Failed to load semesters');
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (!selectedSemester) return;
    // Fetch latest data from server
    const fetchResult = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await getSemesterResult(user.userId, selectedSemester);
        setResult(res.data);
      } catch (err) {
        setResult(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [selectedSemester, user.userId]);

  // Execute grade badge function
  const gradeBadge = (grade) => {
    const colors = { O: 'bg-success', 'A+': 'bg-success', A: 'bg-primary', 'B+': 'bg-info text-dark', B: 'bg-warning text-dark', C: 'bg-secondary', F: 'bg-danger' };
    return <span className={`badge ${colors[grade] || 'bg-secondary'}`}>{grade}</span>;
  };

  return (
    <DashboardLayout links={studentLinks}>
      <h3 className="mb-3">My Results</h3>

      <div className="mb-3" style={{ maxWidth: '300px' }}>
        <label className="form-label">Select Semester</label>
        <select className="form-select" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
          {semesters.map((s) => <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>)}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notFound ? (
        <div className="alert alert-info">No results published yet for this semester.</div>
      ) : result ? (
        <>
          <div className="card shadow-sm mb-4" style={{ maxWidth: '300px' }}>
            <div className="card-body text-center">
              <h6 className="text-muted mb-1">Semester GPA</h6>
              <h2 className="text-primary">{result.gpa}</h2>
            </div>
          </div>

          <table className="table table-striped table-bordered bg-white">
            <thead className="table-dark">
              <tr><th>Subject</th><th>Theory</th><th>Practical</th><th>Total</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {result.subjectResults.map((r) => (
                <tr key={r.resultId}>
                  <td>{r.subjectName}</td>
                  <td>{r.theoryMarks}</td>
                  <td>{r.practicalMarks}</td>
                  <td>{r.totalMarks}</td>
                  <td>{gradeBadge(r.grade)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </DashboardLayout>
  );
};

export default Results;
