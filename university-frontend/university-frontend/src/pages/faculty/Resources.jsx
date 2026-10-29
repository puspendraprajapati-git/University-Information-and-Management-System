import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { facultyLinks } from '../../components/layout/Sidebar';
import { getAllSubjects } from '../../services/subjectService';
import { getFacultyByUserId } from '../../services/facultyService';
import {
  getAllResources,
  uploadResource,
  deleteResource,
} from '../../services/lmsService';

const FacultyResources = () => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  // Upload modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [resourceType, setResourceType] = useState('PDF');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, facRes, resList] = await Promise.all([
        getAllSubjects(),
        getFacultyByUserId(user.userId),
        getAllResources(),
      ]);
      setSubjects(subRes.data || []);
      setFacultyProfile(facRes.data);
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!subjectId || !title || !selectedFile) {
      toast.error('Please enter all required fields and choose a file');
      return;
    }

    const formData = new FormData();
    formData.append('subjectId', subjectId);
    formData.append('uploadedBy', facultyProfile?.facultyId || user.userId);
    formData.append('title', title);
    formData.append('resourceType', resourceType);
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      await uploadResource(formData);
      toast.success('Resource uploaded successfully!');
      setShowModal(false);
      setTitle('');
      setSubjectId('');
      setSelectedFile(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await deleteResource(id);
      toast.success('Resource deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const filteredResources = selectedSubject
    ? resources.filter((r) => String(r.subjectId) === String(selectedSubject))
    : resources;

  const getSubjectName = (id) => {
    const s = subjects.find((sub) => String(sub.subjectId) === String(id));
    return s ? `${s.subjectCode} - ${s.subjectName}` : `Subject #${id}`;
  };

  return (
    <DashboardLayout links={facultyLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h3 className="fw-bold mb-1">Learning Resources</h3>
            <p className="text-muted mb-0">Upload lecture notes, code snippets, presentations, and reference files for students.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Upload Resource
          </button>
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

        {/* Resources Table */}
        <div className="card shadow-sm border-0 bg-white">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4 text-center text-muted">Loading resources...</div>
            ) : filteredResources.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h5>No learning resources yet</h5>
                <p className="mb-0">Click "+ Upload Resource" to share course materials with students.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>File</th>
                      <th>Uploaded On</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((r) => (
                      <tr key={r.resourceId}>
                        <td>
                          <div className="fw-bold">{r.title}</div>
                        </td>
                        <td>{getSubjectName(r.subjectId)}</td>
                        <td>
                          <span className="badge bg-info text-dark">{r.resourceType}</span>
                        </td>
                        <td>
                          <small className="text-muted">{r.fileName}</small>
                        </td>
                        <td>{new Date(r.uploadedAt).toLocaleDateString()}</td>
                        <td className="text-end">
                          <a
                            href={`http://localhost:5000${r.downloadUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            Download
                          </a>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(r.resourceId)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <form onSubmit={handleUploadSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Upload Learning Resource</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Subject *</label>
                      <select
                        className="form-select"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => (
                          <option key={sub.subjectId} value={sub.subjectId}>
                            {sub.subjectCode} - {sub.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Resource Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Chapter 4 - Multithreading Lecture Slides"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Resource Type</label>
                      <select
                        className="form-select"
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                      >
                        <option value="PDF">PDF Document</option>
                        <option value="CODE">Source Code (.java, .py, .zip)</option>
                        <option value="NOTES">Lecture Notes</option>
                        <option value="SLIDES">Presentation Slides</option>
                        <option value="SYLLABUS">Syllabus / Guide</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Choose File *</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        required
                      />
                      <small className="text-muted">Max file size: 50MB (PDF, DOCX, ZIP, Code)</small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyResources;
