import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Briefcase,
  Building2,
  Calendar,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  Filter,
  XCircle,
  Eye,
  Search,
  Check
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminLinks } from '../../components/layout/Sidebar';
import placementService from '../../api/placementService';

const AdminPlacements = () => {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'drives' | 'companies' | 'interviews'

  // Data states
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: 'Technology & Software',
    website: '',
    logoUrl: '',
    description: '',
    hrContactName: '',
    hrContactEmail: '',
  });

  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    companyId: '',
    title: '',
    jobDescription: '',
    eligibility: '',
    packageLpa: '',
    deadline: '',
    jobType: 'Full-Time',
    location: 'Campus / Hybrid',
    minCgpa: '7.0',
    allowedBranches: 'Computer Science, Information Technology, CS',
    isActive: true,
  });

  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveForm, setDriveForm] = useState({
    companyId: '',
    driveDate: '',
    venue: '',
    status: 'UPCOMING',
    description: '',
    roundsInfo: '',
  });

  // Applicants Modal
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);

  // Interview Schedule Modal
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewRound: 'Technical Round 1',
    scheduledAt: '',
    venueOrLink: 'Conference Room 2B / Google Meet',
    mode: 'OFFLINE',
    remarks: '',
  });

  // Academic Eligibility Check Modal
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedJobForEligibility, setSelectedJobForEligibility] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [compRes, jobsRes, drivesRes] = await Promise.all([
        placementService.getAllCompanies().catch(() => ({ data: [] })),
        placementService.getAllJobs().catch(() => ({ data: [] })),
        placementService.getAllDrives().catch(() => ({ data: [] })),
      ]);
      setCompanies(compRes.data || []);
      setJobs(jobsRes.data || []);
      setDrives(drivesRes.data || []);
    } catch (err) {
      toast.error('Failed to load placement records');
    }
  };

  // --- Company Actions ---
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name.trim()) {
      toast.warning('Company name is required');
      return;
    }
    try {
      await placementService.createCompany(companyForm);
      toast.success('Partner company registered successfully!');
      setShowCompanyModal(false);
      setCompanyForm({
        name: '',
        industry: 'Technology & Software',
        website: '',
        logoUrl: '',
        description: '',
        hrContactName: '',
        hrContactEmail: '',
      });
      loadAllData();
    } catch (err) {
      toast.error('Failed to save company: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to remove this partner company?')) return;
    try {
      await placementService.deleteCompany(id);
      toast.success('Company removed');
      loadAllData();
    } catch (err) {
      toast.error('Failed to delete company');
    }
  };

  // --- Job Actions ---
  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!jobForm.companyId || !jobForm.title.trim()) {
      toast.warning('Please select a company and enter job title');
      return;
    }
    try {
      await placementService.createJob({
        ...jobForm,
        companyId: Number(jobForm.companyId),
        packageLpa: jobForm.packageLpa ? Number(jobForm.packageLpa) : null,
        minCgpa: jobForm.minCgpa ? Number(jobForm.minCgpa) : null,
      });
      toast.success('Job opening posted successfully!');
      setShowJobModal(false);
      setJobForm({
        companyId: '',
        title: '',
        jobDescription: '',
        eligibility: '',
        packageLpa: '',
        deadline: '',
        jobType: 'Full-Time',
        location: 'Campus / Hybrid',
        minCgpa: '7.0',
        allowedBranches: 'Computer Science, Information Technology, CS',
        isActive: true,
      });
      loadAllData();
    } catch (err) {
      toast.error('Failed to post job: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    try {
      await placementService.deleteJob(id);
      toast.success('Job opening deleted');
      loadAllData();
    } catch (err) {
      toast.error('Failed to delete job opening');
    }
  };

  // --- Drive Actions ---
  const handleSaveDrive = async (e) => {
    e.preventDefault();
    if (!driveForm.companyId || !driveForm.driveDate) {
      toast.warning('Please select company and drive date');
      return;
    }
    try {
      await placementService.scheduleDrive({
        ...driveForm,
        companyId: Number(driveForm.companyId),
      });
      toast.success('Placement drive scheduled!');
      setShowDriveModal(false);
      setDriveForm({
        companyId: '',
        driveDate: '',
        venue: '',
        status: 'UPCOMING',
        description: '',
        roundsInfo: '',
      });
      loadAllData();
    } catch (err) {
      toast.error('Failed to schedule drive: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteDrive = async (id) => {
    if (!window.confirm('Cancel and remove this placement drive?')) return;
    try {
      await placementService.deleteDrive(id);
      toast.success('Drive removed');
      loadAllData();
    } catch (err) {
      toast.error('Failed to remove drive');
    }
  };

  // --- View Applicants for a Job Opening ---
  const handleViewApplicants = async (job) => {
    setSelectedJobForApplicants(job);
    setShowApplicantsModal(true);
    try {
      const res = await placementService.getApplicationsForJob(job.openingId);
      setApplicants(res.data || []);
    } catch (err) {
      toast.error('Failed to load applicants');
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      await placementService.updateApplicationStatus(appId, newStatus);
      toast.success(`Application marked as ${newStatus}`);
      if (selectedJobForApplicants) {
        const res = await placementService.getApplicationsForJob(selectedJobForApplicants.openingId);
        setApplicants(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // --- Schedule Interview ---
  const openScheduleInterview = (app) => {
    setSelectedApplication(app);
    setInterviewForm({
      interviewRound: 'Technical Round 1',
      scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      venueOrLink: 'Engineering Lab 2 / Google Meet',
      mode: 'OFFLINE',
      remarks: '',
    });
    setShowInterviewModal(true);
  };

  const handleSaveInterview = async (e) => {
    e.preventDefault();
    if (!selectedApplication) return;
    try {
      await placementService.scheduleInterview({
        applicationId: selectedApplication.applicationId,
        ...interviewForm,
      });
      toast.success('Interview scheduled and student notified!');
      setShowInterviewModal(false);
      if (selectedJobForApplicants) {
        const res = await placementService.getApplicationsForJob(selectedJobForApplicants.openingId);
        setApplicants(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to schedule interview: ' + (err.response?.data?.error || err.message));
    }
  };

  // --- Check Academic Eligibility for Job ---
  const handleCheckEligibility = async (job) => {
    setSelectedJobForEligibility(job);
    setShowEligibilityModal(true);
    try {
      const res = await placementService.getEligibleStudents(job.openingId);
      setEligibleStudents(res.data || []);
    } catch (err) {
      toast.error('Failed to filter eligible students');
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout links={adminLinks}>
      <div className="container-fluid py-4 px-md-4">
        {/* Header Banner */}
        <div
          className="rounded-4 p-4 mb-4 text-white shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-indigo-500 bg-opacity-25 border border-indigo-300 text-white px-3 py-1 rounded-pill fw-medium">
                Campus Placements & Careers
              </span>
              <span className="badge bg-success bg-opacity-75 text-white px-2 py-1 rounded-pill">
                Microservice: Port 8084
              </span>
            </div>
            <h2 className="fw-bold mb-1">Placement & Career Management Cell</h2>
            <p className="text-indigo-200 mb-0" style={{ fontSize: '0.95rem' }}>
              Publish campus hiring drives, enforce academic eligibility criteria, review student applicants, and coordinate interview rounds.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              onClick={() => setShowJobModal(true)}
              className="btn btn-light text-primary fw-semibold d-flex align-items-center gap-2 shadow-sm rounded-3"
            >
              <Plus size={18} /> Post Job Opening
            </button>
            <button
              onClick={() => setShowDriveModal(true)}
              className="btn btn-outline-light fw-medium d-flex align-items-center gap-2 rounded-3"
            >
              <Calendar size={18} /> Schedule Drive
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-primary border-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Active Openings</div>
                  <div className="fs-3 fw-bold text-dark mt-1">
                    {jobs.filter((j) => j.isActive).length}
                  </div>
                </div>
                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
                  <Briefcase size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-success border-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Recruiting Partners</div>
                  <div className="fs-3 fw-bold text-dark mt-1">{companies.length}</div>
                </div>
                <div className="p-3 bg-success bg-opacity-10 text-success rounded-4">
                  <Building2 size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-warning border-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Campus Drives</div>
                  <div className="fs-3 fw-bold text-dark mt-1">{drives.length}</div>
                </div>
                <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-4">
                  <Calendar size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-info border-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Total Applications</div>
                  <div className="fs-3 fw-bold text-dark mt-1">
                    {jobs.reduce((acc, curr) => acc + (curr.applicantCount || 0), 0)}
                  </div>
                </div>
                <div className="p-3 bg-info bg-opacity-10 text-info rounded-4">
                  <Users size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white border-bottom p-3">
            <ul className="nav nav-pills gap-2">
              <li className="nav-item">
                <button
                  className={`nav-link px-4 py-2 rounded-3 fw-semibold ${
                    activeTab === 'jobs' ? 'active bg-primary text-white shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <Briefcase size={16} className="me-2 d-inline" /> Job Openings ({jobs.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-4 py-2 rounded-3 fw-semibold ${
                    activeTab === 'drives' ? 'active bg-primary text-white shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('drives')}
                >
                  <Calendar size={16} className="me-2 d-inline" /> Campus Drives ({drives.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-4 py-2 rounded-3 fw-semibold ${
                    activeTab === 'companies' ? 'active bg-primary text-white shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('companies')}
                >
                  <Building2 size={16} className="me-2 d-inline" /> Partner Companies ({companies.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4">
            {/* TAB 1: JOB OPENINGS */}
            {activeTab === 'jobs' && (
              <div>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div className="input-group" style={{ maxWidth: '380px' }}>
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search role or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={() => setShowJobModal(true)}
                    className="btn btn-primary d-flex align-items-center gap-2 rounded-3 fw-medium"
                  >
                    <Plus size={16} /> Post Job Opening
                  </button>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Briefcase size={40} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0">No job openings found. Click "Post Job Opening" to add one.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {filteredJobs.map((job) => (
                      <div className="col-12 col-lg-6" key={job.openingId}>
                        <div className="card h-100 border shadow-sm rounded-4 p-3 position-relative hover-shadow transition">
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <div className="d-flex align-items-center gap-3">
                              {job.companyLogoUrl ? (
                                <img
                                  src={job.companyLogoUrl}
                                  alt={job.companyName}
                                  className="rounded-3 border object-fit-contain p-1"
                                  style={{ width: '48px', height: '48px' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div
                                  className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
                                >
                                  {job.companyName ? job.companyName.charAt(0) : 'C'}
                                </div>
                              )}
                              <div>
                                <h5 className="fw-bold text-dark mb-0">{job.title}</h5>
                                <div className="text-primary fw-medium small">{job.companyName}</div>
                              </div>
                            </div>

                            <span
                              className={`badge rounded-pill ${
                                job.isActive ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-secondary text-white'
                              }`}
                            >
                              {job.isActive ? 'Active' : 'Closed'}
                            </span>
                          </div>

                          <div className="d-flex flex-wrap gap-2 my-2">
                            <span className="badge bg-light text-dark border">
                              💰 ₹{job.packageLpa || 'Best in Market'} LPA
                            </span>
                            <span className="badge bg-light text-dark border">
                              📍 {job.location || 'Pan-India'}
                            </span>
                            <span className="badge bg-light text-dark border">
                              ⏳ Deadline: {job.deadline || 'Open'}
                            </span>
                            <span className="badge bg-purple-50 text-purple-700 border border-purple-200">
                              🎓 Min CGPA: {job.minCgpa || '6.0'}
                            </span>
                          </div>

                          <p className="text-muted small mb-3 text-truncate-2" style={{ maxHeight: '42px', overflow: 'hidden' }}>
                            {job.jobDescription || 'Full job details provided in placement circular.'}
                          </p>

                          <div className="border-top pt-2 mt-auto d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div className="small text-muted">
                              <Users size={14} className="me-1 d-inline text-primary" />
                              <strong className="text-dark">{job.applicantCount || 0}</strong> applicants
                            </div>

                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-info rounded-2 d-flex align-items-center gap-1"
                                onClick={() => handleCheckEligibility(job)}
                                title="Filter eligible students from academic records"
                              >
                                <Filter size={14} /> Filter Eligible
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary rounded-2 d-flex align-items-center gap-1"
                                onClick={() => handleViewApplicants(job)}
                              >
                                <Eye size={14} /> View Applicants
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-2"
                                onClick={() => handleDeleteJob(job.openingId)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PLACEMENT DRIVES */}
            {activeTab === 'drives' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0 text-dark">On-Campus Recruitment Drives</h5>
                  <button
                    onClick={() => setShowDriveModal(true)}
                    className="btn btn-primary d-flex align-items-center gap-2 rounded-3 fw-medium"
                  >
                    <Plus size={16} /> Schedule Campus Drive
                  </button>
                </div>

                {drives.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Calendar size={40} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0">No upcoming drives scheduled yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle border rounded-4 overflow-hidden">
                      <thead className="table-light">
                        <tr>
                          <th>Company</th>
                          <th>Drive Date</th>
                          <th>Venue</th>
                          <th>Status</th>
                          <th>Rounds & Flow</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drives.map((d) => (
                          <tr key={d.driveId}>
                            <td>
                              <div className="fw-bold text-dark">{d.companyName}</div>
                              <small className="text-muted">{d.companyIndustry}</small>
                            </td>
                            <td>
                              <div className="fw-semibold text-primary">
                                <Calendar size={14} className="me-1 d-inline" /> {d.driveDate}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                📍 {d.venue || 'Main Auditorium'}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  d.status === 'UPCOMING'
                                    ? 'bg-warning bg-opacity-25 text-warning-emphasis'
                                    : d.status === 'IN_PROGRESS'
                                    ? 'bg-primary text-white'
                                    : 'bg-success text-white'
                                }`}
                              >
                                {d.status}
                              </span>
                            </td>
                            <td style={{ maxWidth: '280px' }}>
                              <small className="text-muted d-block text-truncate">
                                {d.roundsInfo || 'Aptitude Test -> Tech Round -> HR'}
                              </small>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger rounded-2"
                                onClick={() => handleDeleteDrive(d.driveId)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PARTNER COMPANIES */}
            {activeTab === 'companies' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0 text-dark">Recruiting Partners Directory</h5>
                  <button
                    onClick={() => setShowCompanyModal(true)}
                    className="btn btn-primary d-flex align-items-center gap-2 rounded-3 fw-medium"
                  >
                    <Plus size={16} /> Add Partner Company
                  </button>
                </div>

                <div className="row g-3">
                  {companies.map((c) => (
                    <div className="col-12 col-md-6 col-lg-4" key={c.companyId}>
                      <div className="card h-100 border shadow-sm rounded-4 p-3">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          {c.logoUrl ? (
                            <img
                              src={c.logoUrl}
                              alt={c.name}
                              className="rounded-3 border object-fit-contain p-1"
                              style={{ width: '50px', height: '50px' }}
                              onError={(e) => (e.target.style.display = 'none')}
                            />
                          ) : (
                            <div
                              className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                              style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
                            >
                              {c.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h6 className="fw-bold mb-0 text-dark">{c.name}</h6>
                            <span className="badge bg-light text-secondary border">
                              {c.industry || 'IT & Tech'}
                            </span>
                          </div>
                        </div>

                        <p className="text-muted small mb-3 flex-grow-1" style={{ fontSize: '0.85rem' }}>
                          {c.description || 'Prominent industry recruiter partnered with campus placement cell.'}
                        </p>

                        <div className="small text-muted mb-2">
                          <strong>HR Contact:</strong> {c.hrContactName || 'Talent Acquisition Team'}{' '}
                          {c.hrContactEmail && `(${c.hrContactEmail})`}
                        </div>

                        <div className="border-top pt-2 d-flex justify-content-between align-items-center">
                          {c.website ? (
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary small text-decoration-none d-flex align-items-center gap-1"
                            >
                              Visit Website <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span />
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger rounded-2"
                            onClick={() => handleDeleteCompany(c.companyId)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL 1: POST JOB OPENING */}
        {showJobModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom p-3">
                  <h5 className="modal-title fw-bold text-dark">Post New Job Opening</h5>
                  <button type="button" className="btn-close" onClick={() => setShowJobModal(false)} />
                </div>
                <form onSubmit={handleSaveJob}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Recruiting Company *</label>
                        <select
                          className="form-select"
                          required
                          value={jobForm.companyId}
                          onChange={(e) => setJobForm({ ...jobForm, companyId: e.target.value })}
                        >
                          <option value="">Select Partner Company</option>
                          {companies.map((c) => (
                            <option key={c.companyId} value={c.companyId}>
                              {c.name} ({c.industry})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Job Title / Designation *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Graduate SDE-1 / Cloud Trainee"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold small">Annual CTC (LPA) *</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control"
                          placeholder="e.g. 14.5"
                          value={jobForm.packageLpa}
                          onChange={(e) => setJobForm({ ...jobForm, packageLpa: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold small">Job Type</label>
                        <select
                          className="form-select"
                          value={jobForm.jobType}
                          onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                        >
                          <option value="Full-Time">Full-Time</option>
                          <option value="Internship">Internship</option>
                          <option value="Full-Time + Internship">Full-Time + Internship</option>
                        </select>
                      </div>

                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold small">Application Deadline</label>
                        <input
                          type="date"
                          className="form-control"
                          value={jobForm.deadline}
                          onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                        />
                      </div>

                      {/* Academic Eligibility Controls */}
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-primary">
                          Academic Filter: Minimum CGPA Required
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          placeholder="e.g. 7.50"
                          value={jobForm.minCgpa}
                          onChange={(e) => setJobForm({ ...jobForm, minCgpa: e.target.value })}
                        />
                        <small className="text-muted">Calculated automatically against university results.</small>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-primary">
                          Academic Filter: Allowed Departments / Branches
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Computer Science, Information Technology, CS"
                          value={jobForm.allowedBranches}
                          onChange={(e) => setJobForm({ ...jobForm, allowedBranches: e.target.value })}
                        />
                        <small className="text-muted">Comma separated. Use "All" to allow every branch.</small>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Job Description & Responsibilities</label>
                        <textarea
                          rows="3"
                          className="form-control"
                          placeholder="Role summary, required tech stacks, responsibilities..."
                          value={jobForm.jobDescription}
                          onChange={(e) => setJobForm({ ...jobForm, jobDescription: e.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Eligibility Notes (Displayed to Students)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Min 70% in 10th/12th, no standing backlogs, B.Tech 2026 batch."
                          value={jobForm.eligibility}
                          onChange={(e) => setJobForm({ ...jobForm, eligibility: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button type="button" className="btn btn-light" onClick={() => setShowJobModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary fw-medium px-4">
                      Publish Opening
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: SCHEDULE CAMPUS DRIVE */}
        {showDriveModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom p-3">
                  <h5 className="modal-title fw-bold text-dark">Schedule Campus Drive</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDriveModal(false)} />
                </div>
                <form onSubmit={handleSaveDrive}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Company *</label>
                        <select
                          className="form-select"
                          required
                          value={driveForm.companyId}
                          onChange={(e) => setDriveForm({ ...driveForm, companyId: e.target.value })}
                        >
                          <option value="">Select Recruiting Partner</option>
                          {companies.map((c) => (
                            <option key={c.companyId} value={c.companyId}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Drive Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          required
                          value={driveForm.driveDate}
                          onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Campus Venue</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Main Auditorium / Lab 3"
                          value={driveForm.venue}
                          onChange={(e) => setDriveForm({ ...driveForm, venue: e.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Drive Flow & Rounds Info</label>
                        <textarea
                          rows="2"
                          className="form-control"
                          placeholder="e.g. Online Assessment (90 mins), Technical Interviews, HR Discussion"
                          value={driveForm.roundsInfo}
                          onChange={(e) => setDriveForm({ ...driveForm, roundsInfo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button type="button" className="btn btn-light" onClick={() => setShowDriveModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary fw-medium px-4">
                      Schedule Drive
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD PARTNER COMPANY */}
        {showCompanyModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom p-3">
                  <h5 className="modal-title fw-bold text-dark">Register Partner Company</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCompanyModal(false)} />
                </div>
                <form onSubmit={handleSaveCompany}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Company Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Google, Microsoft, Adobe"
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Industry Domain</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Cloud Computing / FinTech"
                          value={companyForm.industry}
                          onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Website URL</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://..."
                          value={companyForm.website}
                          onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Logo URL</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://example.com/logo.svg"
                          value={companyForm.logoUrl}
                          onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">HR Contact Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Jane Doe"
                          value={companyForm.hrContactName}
                          onChange={(e) => setCompanyForm({ ...companyForm, hrContactName: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">HR Contact Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="campus-recruitment@company.com"
                          value={companyForm.hrContactEmail}
                          onChange={(e) => setCompanyForm({ ...companyForm, hrContactEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button type="button" className="btn btn-light" onClick={() => setShowCompanyModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary fw-medium px-4">
                      Save Company
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: VIEW APPLICANTS FOR A JOB */}
        {showApplicantsModal && selectedJobForApplicants && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom p-3">
                  <div>
                    <h5 className="modal-title fw-bold text-dark">
                      Applicants for {selectedJobForApplicants.title}
                    </h5>
                    <small className="text-muted">
                      {selectedJobForApplicants.companyName} • Total Applicants: {applicants.length}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowApplicantsModal(false)}
                  />
                </div>
                <div className="modal-body p-4">
                  {applicants.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <Users size={36} className="mb-2 opacity-50" />
                      <p>No student applications submitted yet for this position.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Student</th>
                            <th>Department</th>
                            <th>Current CGPA</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th>Interviews</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicants.map((app) => (
                            <tr key={app.applicationId}>
                              <td>
                                <div className="fw-bold text-dark">{app.studentName}</div>
                                <small className="text-muted">{app.enrollmentNo}</small>
                              </td>
                              <td>{app.departmentName}</td>
                              <td>
                                <span className="badge bg-purple-50 text-purple-700 border border-purple-200">
                                  {app.studentCgpa ? `${app.studentCgpa} CGPA` : 'N/A'}
                                </span>
                              </td>
                              <td className="small text-muted">
                                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm fw-medium"
                                  value={app.status}
                                  onChange={(e) =>
                                    handleUpdateApplicationStatus(app.applicationId, e.target.value)
                                  }
                                  style={{
                                    width: '150px',
                                    color:
                                      app.status === 'SELECTED'
                                        ? '#15803d'
                                        : app.status === 'REJECTED'
                                        ? '#b91c1c'
                                        : '#4338ca',
                                  }}
                                >
                                  <option value="APPLIED">APPLIED</option>
                                  <option value="SHORTLISTED">SHORTLISTED</option>
                                  <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
                                  <option value="SELECTED">SELECTED (OFFER)</option>
                                  <option value="REJECTED">REJECTED</option>
                                </select>
                              </td>
                              <td>
                                {app.interviews && app.interviews.length > 0 ? (
                                  <span className="badge bg-info bg-opacity-10 text-info">
                                    {app.interviews.length} rounds logged
                                  </span>
                                ) : (
                                  <span className="text-muted small">None yet</span>
                                )}
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-outline-primary rounded-2 d-flex align-items-center gap-1 ms-auto"
                                  onClick={() => openScheduleInterview(app)}
                                >
                                  <Calendar size={13} /> Schedule Round
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top p-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowApplicantsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: SCHEDULE INTERVIEW ROUND */}
        {showInterviewModal && selectedApplication && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom p-3">
                  <div>
                    <h5 className="modal-title fw-bold text-dark">Schedule Interview Round</h5>
                    <small className="text-muted">
                      Candidate: {selectedApplication.studentName} ({selectedApplication.enrollmentNo})
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowInterviewModal(false)}
                  />
                </div>
                <form onSubmit={handleSaveInterview}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Interview Round</label>
                        <select
                          className="form-select"
                          value={interviewForm.interviewRound}
                          onChange={(e) =>
                            setInterviewForm({ ...interviewForm, interviewRound: e.target.value })
                          }
                        >
                          <option value="Technical Round 1">Technical Round 1</option>
                          <option value="Technical Round 2 - System Design">
                            Technical Round 2 - System Design
                          </option>
                          <option value="HR & Culture Fit">HR & Culture Fit</option>
                          <option value="Executive Management Round">Executive Management Round</option>
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Date & Time *</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          required
                          value={interviewForm.scheduledAt}
                          onChange={(e) =>
                            setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })
                          }
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Mode</label>
                        <select
                          className="form-select"
                          value={interviewForm.mode}
                          onChange={(e) =>
                            setInterviewForm({ ...interviewForm, mode: e.target.value })
                          }
                        >
                          <option value="OFFLINE">Offline (In-Person)</option>
                          <option value="ONLINE">Online (Virtual)</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Venue / Meeting Link</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Conference Room 3 or https://meet.google.com/xyz"
                          value={interviewForm.venueOrLink}
                          onChange={(e) =>
                            setInterviewForm({ ...interviewForm, venueOrLink: e.target.value })
                          }
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Instructions / Remarks</label>
                        <textarea
                          rows="2"
                          className="form-control"
                          placeholder="Bring updated resume copy, laptop with IDE configured, etc."
                          value={interviewForm.remarks}
                          onChange={(e) =>
                            setInterviewForm({ ...interviewForm, remarks: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setShowInterviewModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary fw-medium px-4">
                      Notify & Schedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 6: ACADEMIC ELIGIBILITY FILTER RESULT */}
        {showEligibilityModal && selectedJobForEligibility && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom p-3">
                  <div>
                    <h5 className="modal-title fw-bold text-dark">
                      Academic Eligibility Audit: {selectedJobForEligibility.title}
                    </h5>
                    <small className="text-muted">
                      Filtered against academic database: Min {selectedJobForEligibility.minCgpa || 6.0} CGPA • Branches: {selectedJobForEligibility.allowedBranches || 'All'}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEligibilityModal(false)}
                  />
                </div>
                <div className="modal-body p-4">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Student</th>
                          <th>Branch</th>
                          <th>Current CGPA</th>
                          <th>Eligibility Verdict</th>
                          <th>Criteria Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eligibleStudents.map((s) => (
                          <tr key={s.studentId}>
                            <td>
                              <div className="fw-bold text-dark">{s.studentName}</div>
                              <small className="text-muted">{s.enrollmentNo}</small>
                            </td>
                            <td>{s.departmentName}</td>
                            <td>
                              <span className="badge bg-purple-50 text-purple-700 border border-purple-200">
                                {s.cgpa ? `${s.cgpa} CGPA` : 'N/A'}
                              </span>
                            </td>
                            <td>
                              {s.eligible ? (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success d-inline-flex align-items-center gap-1">
                                  <Check size={12} /> Eligible
                                </span>
                              ) : (
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger d-inline-flex align-items-center gap-1">
                                  <XCircle size={12} /> Ineligible
                                </span>
                              )}
                            </td>
                            <td className="small text-muted">
                              {s.reasons && s.reasons.join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer border-top p-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEligibilityModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPlacements;
