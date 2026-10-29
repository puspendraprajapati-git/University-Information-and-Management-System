import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getAllSubjects } from '../../services/subjectService';
import { getAllResources } from '../../services/lmsService';

const StudentResources = () => {
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, resList] = await Promise.all([
        getAllSubjects(),
        getAllResources(),
      ]);
      setSubjects(subRes.data || []);
      setResources(resList.data || []);
    } catch (err) {
      toast.error('Failed to load study resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredResources = selectedSubject
    ? resources.filter((r) => String(r.subjectId) === String(selectedSubject))
    : resources;

  const getSubjectName = (id) => {
    const s = subjects.find((sub) => String(sub.subjectId) === String(id));
    return s ? `${s.subjectCode} - ${s.subjectName}` : `Subject #${id}`;
  };

  return (
    <DashboardLayout links={studentLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h3 className="fw-bold mb-1">Course Learning Resources</h3>
            <p className="text-muted mb-0">Access lecture notes, practice code samples, textbooks, and presentations uploaded by faculty.</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <label className="form-label small fw-semibold text-muted">Filter by Subject</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-7 text-md-end mt-md-4">
              <span className="badge bg-light text-dark border px-3 py-2">
                Available Resources: <strong>{filteredResources.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="p-4 text-center text-muted">Loading study resources...</div>
        ) : filteredResources.length === 0 ? (
          <div className="card shadow-sm border-0 bg-white p-5 text-center text-muted">
            <h5>No study resources found</h5>
            <p className="mb-0">There are no study materials uploaded for this subject yet.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredResources.map((r) => (
              <div key={r.resourceId} className="col-md-6 col-lg-4">
                <div className="card shadow-sm border-0 h-100 bg-white">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-primary-subtle text-primary border">
                        {getSubjectName(r.subjectId)}
                      </span>
                      <span className="badge bg-info text-dark">{r.resourceType || 'DOCUMENT'}</span>
                    </div>

                    <h5 className="fw-bold mb-2">{r.title}</h5>

                    <small className="text-muted mb-3 flex-grow-1">
                      File: <strong>{r.fileName}</strong>
                    </small>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
                      <small className="text-muted">
                        {new Date(r.uploadedAt).toLocaleDateString()}
                      </small>
                      <a
                        href={`http://localhost:5000${r.downloadUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        Download Material
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentResources;
