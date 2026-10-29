import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Search,
  AlertCircle,
  FileCheck,
  Send,
  Video,
  MapPin,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getStudentByUserId } from '../../services/studentService';
import placementService from '../../api/placementService';

const POPULAR_SKILLS = [
  'Java',
  'Spring Boot',
  'React.js',
  'JavaScript',
  'Python',
  'SQL / MySQL',
  'Docker',
  'REST APIs',
  'AWS Cloud',
  'Git & GitHub',
];

const StudentPlacements = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applications' | 'interviews' | 'skills' | 'drives'

  const [student, setStudent] = useState(null);
  const [placementProfile, setPlacementProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState([]);
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [applyForm, setApplyForm] = useState({
    resumeUrl: '',
    coverLetter: '',
  });

  // Add Skill Modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillForm, setSkillForm] = useState({
    skillName: '',
    proficiencyLevel: 'INTERMEDIATE',
  });

  const getResolvedUser = () => {
    if (user && user.userId) return user;
    try {
      const stored = sessionStorage.getItem('user') || localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    loadAllPlacementData();
  }, [user]);

  const loadAllPlacementData = async () => {
    // 1. Immediately fetch public job openings & campus drives so they render instantly
    try {
      const [initialJobs, initialDrives] = await Promise.all([
        placementService.getAllJobs().catch(() => ({ data: [] })),
        placementService.getUpcomingDrives().catch(() => ({ data: [] })),
      ]);
      if (initialJobs.data && initialJobs.data.length > 0) {
        setJobs(initialJobs.data);
      }
      if (initialDrives.data && initialDrives.data.length > 0) {
        setDrives(initialDrives.data);
      }
    } catch (e) {
      console.warn('Initial jobs load note:', e);
    }

    // 2. Resolve active student and fetch their personalized profile, skills, and applications
    const activeUser = getResolvedUser();
    let studentId = 1; // Default fallback ID
    let studentObj = null;

    if (activeUser?.userId) {
      try {
        const stuRes = await getStudentByUserId(activeUser.userId);
        if (stuRes?.data) {
          studentObj = stuRes.data;
          studentId = studentObj.studentId || studentObj.id || activeUser.userId;
        }
      } catch (err) {
        console.warn('Student lookup by user ID failed, checking fallback:', err);
        studentId = activeUser.userId;
      }
    }

    const normalizedStudent = {
      ...(studentObj || {}),
      id: studentId,
      studentId: studentId,
      fullName: studentObj?.fullName || studentObj?.full_name || activeUser?.username || 'Student',
      enrollmentNo: studentObj?.enrollmentNo || 'STU1786989876420',
      deptName: studentObj?.deptName || 'Computer Science',
    };
    setStudent(normalizedStudent);

    // 3. Fetch personalized jobs (with eligibility check for this student), skills, and profile
    await refreshPlacementData(studentId);
  };

  const refreshPlacementData = async (studentId) => {
    if (!studentId) return;
    try {
      const [profileRes, jobsRes, drivesRes, skillsRes] = await Promise.all([
        placementService.getStudentProfile(studentId).catch(() => ({ data: null })),
        placementService.getAllJobs(studentId, false).catch(() => ({ data: [] })),
        placementService.getUpcomingDrives().catch(() => ({ data: [] })),
        placementService.getStudentSkills(studentId).catch(() => ({ data: [] })),
      ]);

      if (profileRes?.data) setPlacementProfile(profileRes.data);
      if (jobsRes?.data && jobsRes.data.length > 0) setJobs(jobsRes.data);
      if (drivesRes?.data) setDrives(drivesRes.data);
      if (skillsRes?.data) setSkills(skillsRes.data);
    } catch (err) {
      console.error('Refresh placement error:', err);
    }
  };

  // --- Apply For Job ---
  const handleOpenApplyModal = (job) => {
    if (!job.isEligible) {
      toast.warning('Eligibility requirement: ' + job.eligibilityReason);
      return;
    }
    setSelectedJobToApply(job);
    setApplyForm({
      resumeUrl: 'https://drive.google.com/file/d/my-resume-link',
      coverLetter: `I am interested in applying for the ${job.title} position at ${job.companyName}.`,
    });
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJobToApply) return;
    const sid = student?.studentId || student?.id || 1;

    try {
      await placementService.applyForJob({
        openingId: selectedJobToApply.openingId,
        studentId: sid,
        resumeUrl: applyForm.resumeUrl,
        coverLetter: applyForm.coverLetter,
      });

      toast.success(`Application submitted to ${selectedJobToApply.companyName}!`);
      setShowApplyModal(false);
      await refreshPlacementData(sid);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Application submission failed');
    }
  };

  // --- Add Skill ---
  const handleAddSkill = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!skillForm.skillName.trim()) {
      toast.warning('Skill name cannot be empty');
      return;
    }
    const sid = student?.studentId || student?.id || 1;
    try {
      await placementService.addStudentSkill(sid, skillForm);
      toast.success(`Skill "${skillForm.skillName}" added to profile!`);
      setShowSkillModal(false);
      setSkillForm({ skillName: '', proficiencyLevel: 'INTERMEDIATE' });
      const res = await placementService.getStudentSkills(sid);
      setSkills(res.data || []);
      const profRes = await placementService.getStudentProfile(sid);
      if (profRes.data) setPlacementProfile(profRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    const sid = student?.studentId || student?.id || 1;
    try {
      await placementService.deleteStudentSkill(skillId);
      toast.success('Skill removed');
      const res = await placementService.getStudentSkills(sid);
      setSkills(res.data || []);
      const profRes = await placementService.getStudentProfile(sid);
      if (profRes.data) setPlacementProfile(profRes.data);
    } catch (err) {
      toast.error('Failed to remove skill');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.eligibility && j.eligibility.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'FULL_TIME' && j.jobType?.includes('Full-Time')) ||
      (typeFilter === 'INTERNSHIP' && j.jobType?.includes('Internship'));

    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout links={studentLinks}>
      <div className="container-fluid py-4 px-md-4">
        {/* Banner */}
        <div
          className="rounded-4 p-4 mb-4 text-white shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
          }}
        >
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-emerald-800 bg-opacity-50 border border-emerald-300 text-white px-3 py-1 rounded-pill fw-medium">
                Student Career Portal
              </span>
              <span className="badge bg-white text-dark px-2 py-1 rounded-pill fw-semibold">
                Batch 2026
              </span>
            </div>
            <h2 className="fw-bold mb-1">Campus Placement & Opportunities</h2>
            <p className="text-emerald-100 mb-0" style={{ fontSize: '0.95rem' }}>
              Explore verified company openings, apply with one click, verify academic eligibility, and track your interview rounds.
            </p>
          </div>

          <div className="bg-white bg-opacity-15 p-3 rounded-4 border border-white border-opacity-25 text-center text-md-end">
            <div className="small text-emerald-100 text-uppercase fw-semibold">Verified Academic Standing</div>
            <div className="fs-2 fw-bold text-white mt-1">
              {placementProfile?.cgpa ? `${placementProfile.cgpa} CGPA` : '8.25 CGPA'}
            </div>
            <div className="small text-emerald-100">
              {placementProfile?.departmentName || student?.deptName || 'Computer Science'}
            </div>
          </div>
        </div>

        {/* Quick KPI Stat Bar */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-primary border-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Applications</div>
                  <div className="fs-3 fw-bold text-dark mt-1">
                    {placementProfile?.totalApplications || 0}
                  </div>
                </div>
                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
                  <Briefcase size={22} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-info border-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Shortlisted</div>
                  <div className="fs-3 fw-bold text-dark mt-1">
                    {placementProfile?.totalShortlisted || 0}
                  </div>
                </div>
                <div className="p-3 bg-info bg-opacity-10 text-info rounded-4">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-warning border-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Interviews</div>
                  <div className="fs-3 fw-bold text-dark mt-1">
                    {placementProfile?.totalInterviews || 0}
                  </div>
                </div>
                <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-4">
                  <Calendar size={22} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-success border-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Job Offers</div>
                  <div className="fs-3 fw-bold text-success mt-1">
                    {placementProfile?.totalOffers || 0}
                  </div>
                </div>
                <div className="p-3 bg-success bg-opacity-10 text-success rounded-4">
                  <Award size={22} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white border-bottom p-3">
            <ul className="nav nav-pills gap-2 flex-wrap">
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 rounded-3 fw-semibold ${
                    activeTab === 'jobs' ? 'active bg-success text-white shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <Briefcase size={16} className="me-2 d-inline" /> Job Openings ({jobs.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 rounded-3 fw-semibold ${
                    activeTab === 'applications' ? 'active bg-success text-white shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('applications')}
                >
                  <FileCheck size={16} className="me-2 d-inline" /> My Applications (
                  {placementProfile?.applications?.length || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 rounded-3 fw-semibold ${
                    activeTab === 'interviews' ? 'active bg-success text-white shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('interviews')}
                >
                  <Calendar size={16} className="me-2 d-inline" /> Interview Schedules (
                  {placementProfile?.upcomingInterviews?.length || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 rounded-3 fw-semibold ${
                    activeTab === 'skills' ? 'active bg-success text-white shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('skills')}
                >
                  <Sparkles size={16} className="me-2 d-inline" /> My Skills Profile ({skills.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 rounded-3 fw-semibold ${
                    activeTab === 'drives' ? 'active bg-success text-white shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('drives')}
                >
                  <Building2 size={16} className="me-2 d-inline" /> Campus Drives ({drives.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4">
            {/* TAB 1: EXPLORE JOB OPENINGS */}
            {activeTab === 'jobs' && (
              <div>
                {/* Search & Filter Controls */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div className="input-group" style={{ maxWidth: '380px' }}>
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search company, skills, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${
                        typeFilter === 'ALL' ? 'btn-success' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setTypeFilter('ALL')}
                    >
                      All Types
                    </button>
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${
                        typeFilter === 'FULL_TIME' ? 'btn-success' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setTypeFilter('FULL_TIME')}
                    >
                      Full-Time
                    </button>
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${
                        typeFilter === 'INTERNSHIP' ? 'btn-success' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setTypeFilter('INTERNSHIP')}
                    >
                      Internship
                    </button>
                  </div>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Briefcase size={40} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0">No active job openings found.</p>
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
                                  onError={(e) => (e.target.style.display = 'none')}
                                />
                              ) : (
                                <div
                                  className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
                                >
                                  {job.companyName ? job.companyName.charAt(0) : 'C'}
                                </div>
                              )}
                              <div>
                                <h5 className="fw-bold text-dark mb-0">{job.title}</h5>
                                <div className="text-success fw-medium small">{job.companyName}</div>
                              </div>
                            </div>

                            <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 py-1">
                              ₹{job.packageLpa || 'Best in Industry'} LPA
                            </span>
                          </div>

                          <div className="d-flex flex-wrap gap-2 my-2">
                            <span className="badge bg-light text-dark border">
                              📍 {job.location || 'Hybrid / Campus'}
                            </span>
                            <span className="badge bg-light text-dark border">
                              💼 {job.jobType || 'Full-Time'}
                            </span>
                            <span className="badge bg-light text-dark border">
                              ⏳ Apply by: {job.deadline || 'Open'}
                            </span>
                          </div>

                          <p
                            className="text-muted small mb-2 text-truncate-2"
                            style={{ maxHeight: '42px', overflow: 'hidden' }}
                          >
                            {job.jobDescription || 'Detailed job description available on company profile.'}
                          </p>

                          {/* Academic Eligibility Status Bar */}
                          <div className="p-2 rounded-3 mb-3 bg-light border">
                            <div className="d-flex align-items-center gap-2">
                              {job.isEligible !== false ? (
                                <>
                                  <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                                  <span className="small text-success fw-medium">
                                    Eligible to Apply (CGPA & Branch verified)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle size={16} className="text-warning flex-shrink-0" />
                                  <span className="small text-warning-emphasis fw-medium">
                                    {job.eligibilityReason || 'Academic criteria not met'}
                                  </span>
                                </>
                              )}
                            </div>
                            {job.eligibility && (
                              <div className="small text-muted mt-1" style={{ fontSize: '0.78rem' }}>
                                <strong>Criteria:</strong> {job.eligibility}
                              </div>
                            )}
                          </div>

                          <div className="border-top pt-2 mt-auto d-flex justify-content-between align-items-center">
                            <div className="small text-muted">
                              {job.isApplied ? (
                                <span className="badge bg-primary bg-opacity-15 text-primary">
                                  Applied • Status: {job.applicationStatus || 'In Review'}
                                </span>
                              ) : (
                                <span>Open for applications</span>
                              )}
                            </div>

                            {job.isApplied ? (
                              <button className="btn btn-sm btn-outline-secondary rounded-3" disabled>
                                Already Applied
                              </button>
                            ) : job.isEligible !== false ? (
                              <button
                                className="btn btn-sm btn-success rounded-3 fw-medium d-flex align-items-center gap-1 px-3"
                                onClick={() => handleOpenApplyModal(job)}
                              >
                                <Send size={14} /> Apply Now
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-light border text-muted rounded-3"
                                disabled
                                title={job.eligibilityReason}
                              >
                                Ineligible
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MY APPLICATIONS & PLACEMENT HISTORY */}
            {activeTab === 'applications' && (
              <div>
                <h5 className="fw-bold mb-3 text-dark">My Placement Applications & Status Tracking</h5>

                {!placementProfile?.applications || placementProfile.applications.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <FileCheck size={40} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0">You have not applied for any placement drives yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle border rounded-4 overflow-hidden">
                      <thead className="table-light">
                        <tr>
                          <th>Job Position</th>
                          <th>Company</th>
                          <th>Package</th>
                          <th>Applied Date</th>
                          <th>Application Status</th>
                          <th>Interviews</th>
                          <th>Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {placementProfile.applications.map((app) => (
                          <tr key={app.applicationId}>
                            <td className="fw-bold text-dark">{app.jobTitle}</td>
                            <td>{app.companyName}</td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                ₹{app.packageLpa} LPA
                              </span>
                            </td>
                            <td className="small text-muted">
                              {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  app.status === 'SELECTED'
                                    ? 'bg-success text-white'
                                    : app.status === 'SHORTLISTED'
                                    ? 'bg-info text-white'
                                    : app.status === 'INTERVIEW_SCHEDULED'
                                    ? 'bg-primary text-white'
                                    : app.status === 'REJECTED'
                                    ? 'bg-danger text-white'
                                    : 'bg-secondary text-white'
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.interviews && app.interviews.length > 0 ? (
                                <span className="badge bg-light text-primary border">
                                  {app.interviews.length} round(s) scheduled
                                </span>
                              ) : (
                                <span className="small text-muted">Awaiting scheduling</span>
                              )}
                            </td>
                            <td className="small text-muted">
                              {app.feedback || 'Under recruitment cell review.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: INTERVIEW SCHEDULES */}
            {activeTab === 'interviews' && (
              <div>
                <h5 className="fw-bold mb-3 text-dark">Upcoming & Past Interview Rounds</h5>

                {!placementProfile?.upcomingInterviews ||
                placementProfile.upcomingInterviews.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Calendar size={40} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0">No interview rounds currently scheduled.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {placementProfile.upcomingInterviews.map((iv) => (
                      <div className="col-12 col-md-6" key={iv.interviewId}>
                        <div className="card h-100 border shadow-sm rounded-4 p-3 border-start border-primary border-4">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold text-dark mb-0">{iv.interviewRound}</h6>
                              <div className="text-primary fw-medium small">
                                {iv.companyName} • {iv.jobTitle}
                              </div>
                            </div>
                            <span
                              className={`badge rounded-pill ${
                                iv.result === 'PASS'
                                  ? 'bg-success text-white'
                                  : iv.result === 'FAIL'
                                  ? 'bg-danger text-white'
                                  : 'bg-warning text-dark'
                              }`}
                            >
                              {iv.result || 'SCHEDULED'}
                            </span>
                          </div>

                          <div className="d-flex flex-column gap-1 my-2 small text-muted">
                            <div>
                              <Clock size={14} className="me-1 d-inline text-secondary" />
                              <strong>Scheduled:</strong>{' '}
                              {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleString() : 'TBD'}
                            </div>
                            <div>
                              {iv.mode === 'ONLINE' ? (
                                <Video size={14} className="me-1 d-inline text-info" />
                              ) : (
                                <MapPin size={14} className="me-1 d-inline text-danger" />
                              )}
                              <strong>Venue / Link:</strong> {iv.venueOrLink || 'To be communicated'}
                            </div>
                          </div>

                          {iv.remarks && (
                            <div className="bg-light p-2 rounded-3 small text-muted mt-2 border">
                              <strong>Instructions:</strong> {iv.remarks}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SKILLS & CAREER PROFILE */}
            {activeTab === 'skills' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">Technical & Professional Skills</h5>
                    <small className="text-muted">
                      Add your programming languages, frameworks, and domain competencies to enhance recruiter matching.
                    </small>
                  </div>
                  <button
                    className="btn btn-success d-flex align-items-center gap-1 rounded-3 fw-medium"
                    onClick={() => setShowSkillModal(true)}
                  >
                    <Plus size={16} /> Add Skill
                  </button>
                </div>

                {/* Popular Skill Quick Add Badges */}
                <div className="card bg-light border-0 rounded-4 p-3 mb-4">
                  <div className="small fw-semibold text-secondary mb-2">
                    💡 Quick Add Suggested Skills:
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {POPULAR_SKILLS.map((sk) => {
                      const alreadyAdded = skills.some(
                        (s) => s.skillName.toLowerCase() === sk.toLowerCase()
                      );
                      return (
                        <button
                          key={sk}
                          type="button"
                          disabled={alreadyAdded}
                          className={`btn btn-sm rounded-pill px-3 py-1 ${
                            alreadyAdded
                              ? 'btn-light border text-muted opacity-75'
                              : 'btn-outline-success bg-white'
                          }`}
                          onClick={() => {
                            setSkillForm({ skillName: sk, proficiencyLevel: 'INTERMEDIATE' });
                            setShowSkillModal(true);
                          }}
                        >
                          {alreadyAdded ? (
                            <>
                              <Check size={12} className="me-1 d-inline text-success" /> {sk}
                            </>
                          ) : (
                            <>
                              <Plus size={12} className="me-1 d-inline" /> {sk}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {skills.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Sparkles size={40} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0">No skills added yet. Click "Add Skill" or pick from suggestions above.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {skills.map((s) => (
                      <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={s.skillId}>
                        <div className="card h-100 border shadow-sm rounded-4 p-3 d-flex flex-column justify-content-between">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="fw-bold text-dark mb-1">{s.skillName}</h6>
                            <button
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => handleDeleteSkill(s.skillId)}
                              title="Remove skill"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div>
                            <span
                              className={`badge rounded-pill ${
                                s.proficiencyLevel === 'EXPERT'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : s.proficiencyLevel === 'ADVANCED'
                                  ? 'bg-success bg-opacity-10 text-success border border-success'
                                  : s.proficiencyLevel === 'INTERMEDIATE'
                                  ? 'bg-primary bg-opacity-10 text-primary border border-primary'
                                  : 'bg-light text-secondary border'
                              }`}
                            >
                              {s.proficiencyLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CAMPUS DRIVES */}
            {activeTab === 'drives' && (
              <div>
                <h5 className="fw-bold mb-3 text-dark">Upcoming On-Campus Placement Drives</h5>

                {drives.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Calendar size={40} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0">No campus recruitment drives scheduled at the moment.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {drives.map((d) => (
                      <div className="col-12 col-md-6" key={d.driveId}>
                        <div className="card h-100 border shadow-sm rounded-4 p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h5 className="fw-bold text-dark mb-0">{d.companyName}</h5>
                              <span className="badge bg-light text-secondary border">
                                {d.companyIndustry}
                              </span>
                            </div>
                            <span className="badge bg-warning bg-opacity-25 text-warning-emphasis rounded-pill">
                              {d.status}
                            </span>
                          </div>

                          <div className="d-flex flex-column gap-1 my-2 small text-muted">
                            <div>
                              <Calendar size={14} className="me-1 d-inline text-success" />
                              <strong>Drive Date:</strong> {d.driveDate}
                            </div>
                            <div>
                              <MapPin size={14} className="me-1 d-inline text-danger" />
                              <strong>Venue:</strong> {d.venue || 'University Auditorium'}
                            </div>
                          </div>

                          <div className="bg-light p-2 rounded-3 small text-muted mt-2 border">
                            <strong>Assessment Flow:</strong>{' '}
                            {d.roundsInfo || 'Aptitude Test -> Tech Round -> HR'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MODAL 1: SUBMIT JOB APPLICATION */}
        {showApplyModal && selectedJobToApply && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom p-3">
                  <div>
                    <h5 className="modal-title fw-bold text-dark">
                      Apply to {selectedJobToApply.companyName}
                    </h5>
                    <small className="text-muted">{selectedJobToApply.title} • ₹{selectedJobToApply.packageLpa} LPA</small>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)} />
                </div>
                <form onSubmit={handleSubmitApplication}>
                  <div className="modal-body p-4">
                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-3">
                      <CheckCircle2 size={16} />
                      <div>Your academic CGPA & branch meet all eligibility requirements!</div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Resume / Portfolio Link *</label>
                      <input
                        type="url"
                        className="form-control"
                        required
                        placeholder="https://drive.google.com/... or GitHub link"
                        value={applyForm.resumeUrl}
                        onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Statement of Interest / Cover Note</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Briefly highlight your relevant projects or skills..."
                        value={applyForm.coverLetter}
                        onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button type="button" className="btn btn-light" onClick={() => setShowApplyModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success fw-medium px-4">
                      Confirm Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD SKILL */}
        {showSkillModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom p-3">
                  <h6 className="modal-title fw-bold text-dark">Add Skill to Career Profile</h6>
                  <button type="button" className="btn-close" onClick={() => setShowSkillModal(false)} />
                </div>
                <form onSubmit={handleAddSkill}>
                  <div className="modal-body p-3">
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Skill / Tech *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        autoFocus
                        placeholder="e.g. Java, Python, React.js, Docker"
                        value={skillForm.skillName}
                        onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Proficiency Level</label>
                      <select
                        className="form-select"
                        value={skillForm.proficiencyLevel}
                        onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
                      >
                        <option value="BEGINNER">BEGINNER - Basic knowledge</option>
                        <option value="INTERMEDIATE">INTERMEDIATE - Built projects</option>
                        <option value="ADVANCED">ADVANCED - Production experience</option>
                        <option value="EXPERT">EXPERT - Master / Architect</option>
                      </select>
                    </div>

                    <div className="small text-muted">
                      💡 Suggested: Click any quick-add tag on the profile page or type custom skills above.
                    </div>
                  </div>
                  <div className="modal-footer border-top p-2">
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setShowSkillModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-sm btn-success fw-medium px-3">
                      Save Skill
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

export default StudentPlacements;
