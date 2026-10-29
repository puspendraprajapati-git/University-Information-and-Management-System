import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminLinks } from '../../components/layout/Sidebar';
import { libraryService } from '../../api/libraryService';
import { getAllStudents } from '../../services/studentService';
import {
  BookOpen,
  Layers,
  Repeat,
  AlertCircle,
  BookmarkCheck,
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Send,
  Barcode,
  ChevronDown,
  ChevronRight,
  BookMarked
} from 'lucide-react';

const AdminLibrary = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'circulation' | 'overdue' | 'reservations' | 'fines'

  // Summary statistics from ASP.NET Core service
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalPhysicalCopies: 0,
    availableCopies: 0,
    issuedCopies: 0,
    activeLoansCount: 0,
    overdueLoansCount: 0,
    pendingReservationsCount: 0,
    totalUnpaidFines: 0
  });

  // Catalog state
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBookId, setExpandedBookId] = useState(null);

  // Circulation (loans) state
  const [loans, setLoans] = useState([]);
  const [students, setStudents] = useState([]);

  // Reservations state
  const [reservations, setReservations] = useState([]);

  // Fines state
  const [fines, setFines] = useState([]);

  // Loading indicator
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddCopyModal, setShowAddCopyModal] = useState(false);
  const [selectedBookForCopy, setSelectedBookForCopy] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [preselectedCopy, setPreselectedCopy] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState(null);

  // Form states
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    description: '',
    coverImageUrl: '',
    initialCopiesCount: 2,
    accessionPrefix: 'ACC',
    rackLocation: 'Section A, Shelf 1'
  });

  const [copyForm, setCopyForm] = useState({
    accessionNo: '',
    rackLocation: 'Section A, Shelf 1',
    status: 'AVAILABLE'
  });

  const [issueForm, setIssueForm] = useState({
    copyId: '',
    studentId: '',
    dueDays: 14,
    remarks: 'Issued from central circulation desk'
  });

  const [returnForm, setReturnForm] = useState({
    conditionRemarks: 'Returned in good condition',
    waiveFine: false
  });

  // Load KPI Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await libraryService.getStats();
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to load library stats:', err);
    }
  }, []);

  // Load Books Catalog
  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await libraryService.getAllBooks(params);
      setBooks(res.data || []);
    } catch (err) {
      console.error('Failed to load books catalog:', err);
      toast.error('Failed to retrieve book catalog');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Load Categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await libraryService.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Load Loans (Circulation)
  const loadLoans = useCallback(async (overdueOnly = false) => {
    setLoading(true);
    try {
      const params = overdueOnly ? { overdueOnly: true } : {};
      const res = await libraryService.getAllLoans(params);
      setLoans(res.data || []);
    } catch (err) {
      console.error('Failed to load loans:', err);
      toast.error('Failed to retrieve loan records');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Reservations
  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryService.getAllReservations();
      setReservations(res.data || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      toast.error('Failed to retrieve reservations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Fines
  const loadFines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryService.getAllFines();
      setFines(res.data || []);
    } catch (err) {
      console.error('Failed to load fines:', err);
      toast.error('Failed to retrieve fine audit');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Student Directory for checkout select dropdown
  const loadStudents = useCallback(async () => {
    try {
      const res = await getAllStudents();
      setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to load student directory:', err);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    loadStats();
    loadCategories();
    loadStudents();
  }, [loadStats, loadCategories, loadStudents]);

  // Switch tab data loading
  useEffect(() => {
    if (activeTab === 'catalog') {
      loadBooks();
    } else if (activeTab === 'circulation') {
      loadLoans(false);
    } else if (activeTab === 'overdue') {
      loadLoans(true);
    } else if (activeTab === 'reservations') {
      loadReservations();
    } else if (activeTab === 'fines') {
      loadFines();
    }
  }, [activeTab, loadBooks, loadLoans, loadReservations, loadFines]);

  // Handle Add Book Submission
  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) {
      toast.error('Title, author, and ISBN are required.');
      return;
    }

    try {
      await libraryService.createBook({
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn,
        category: bookForm.category,
        publisher: bookForm.publisher,
        publicationYear: parseInt(bookForm.publicationYear) || new Date().getFullYear(),
        description: bookForm.description,
        coverImageUrl: bookForm.coverImageUrl,
        initialCopiesCount: parseInt(bookForm.initialCopiesCount) || 1,
        accessionPrefix: bookForm.accessionPrefix || 'ACC',
        rackLocation: bookForm.rackLocation
      });

      toast.success('Book title and physical copies added to catalog!');
      setShowAddBookModal(false);
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        category: 'Computer Science',
        publisher: '',
        publicationYear: new Date().getFullYear(),
        description: '',
        coverImageUrl: '',
        initialCopiesCount: 2,
        accessionPrefix: 'ACC',
        rackLocation: 'Section A, Shelf 1'
      });
      loadBooks();
      loadStats();
    } catch (err) {
      console.error('Add book error:', err);
      toast.error(err.response?.data?.message || 'Failed to create book title');
    }
  };

  // Open Add Copy Modal
  const openAddCopyModal = (book) => {
    setSelectedBookForCopy(book);
    const nextIdx = (book.totalCopies || 0) + 1;
    const padIdx = nextIdx < 10 ? `0${nextIdx}` : nextIdx;
    setCopyForm({
      accessionNo: `ACC-${book.bookId.toString().padStart(3, '0')}-${padIdx}`,
      rackLocation: 'Section A, Shelf 1',
      status: 'AVAILABLE'
    });
    setShowAddCopyModal(true);
  };

  // Handle Add Copy Submission
  const handleAddCopySubmit = async (e) => {
    e.preventDefault();
    if (!copyForm.accessionNo.trim()) {
      toast.error('Accession number is required.');
      return;
    }

    try {
      await libraryService.createCopy(selectedBookForCopy.bookId, copyForm);
      toast.success(`Physical copy #${copyForm.accessionNo} registered!`);
      setShowAddCopyModal(false);
      loadBooks();
      loadStats();
    } catch (err) {
      console.error('Add copy error:', err);
      toast.error(err.response?.data?.message || 'Failed to add physical copy');
    }
  };

  // Handle Issue Modal Opening
  const openIssueModal = (copy = null) => {
    setPreselectedCopy(copy);
    setIssueForm({
      copyId: copy ? copy.copyId : '',
      studentId: students.length > 0 ? (students[0].studentId || students[0].id) : '',
      dueDays: 14,
      remarks: 'Issued at university library circulation desk'
    });
    setShowIssueModal(true);
  };

  // Handle Issue Submission
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.copyId || !issueForm.studentId) {
      toast.error('Please select both a book copy and a student.');
      return;
    }

    try {
      const res = await libraryService.issueBook({
        copyId: parseInt(issueForm.copyId),
        studentId: parseInt(issueForm.studentId),
        dueDays: parseInt(issueForm.dueDays) || 14,
        remarks: issueForm.remarks
      });

      toast.success(`Book issued successfully! Due on ${new Date(res.data.dueDate).toLocaleDateString()}`);
      setShowIssueModal(false);
      loadStats();
      if (activeTab === 'catalog') loadBooks();
      if (activeTab === 'circulation') loadLoans(false);
    } catch (err) {
      console.error('Issue error:', err);
      toast.error(err.response?.data?.message || 'Failed to issue book');
    }
  };

  // Open Return Modal
  const openReturnModal = (loan) => {
    setSelectedLoanForReturn(loan);
    setReturnForm({
      conditionRemarks: 'Returned in good physical condition',
      waiveFine: false
    });
    setShowReturnModal(true);
  };

  // Handle Return Submission
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoanForReturn) return;

    try {
      const res = await libraryService.returnBook({
        loanId: selectedLoanForReturn.loanId,
        remarks: returnForm.conditionRemarks,
        waiveFine: returnForm.waiveFine
      });

      if (res.data.fineAmount > 0) {
        toast.warn(`Book returned. Overdue fine assessed: ₹${res.data.fineAmount.toFixed(2)}`);
      } else {
        toast.success('Book returned successfully with zero penalty!');
      }

      setShowReturnModal(false);
      loadStats();
      if (activeTab === 'circulation') loadLoans(false);
      if (activeTab === 'overdue') loadLoans(true);
      if (activeTab === 'catalog') loadBooks();
    } catch (err) {
      console.error('Return error:', err);
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  // Handle Overdue Reminder Notification
  const handleSendReminder = (loan) => {
    toast.info(`Overdue notification reminder sent to ${loan.studentName} (${loan.studentRegNo || 'Reg: ' + loan.studentId})`);
  };

  // Handle Fulfill Reservation
  const handleFulfillReservation = async (reservation) => {
    // Find available copy for this book
    try {
      const bookRes = await libraryService.getBookById(reservation.bookId);
      const availCopy = (bookRes.data.copies || []).find(c => c.status === 'AVAILABLE');
      if (!availCopy) {
        toast.warn('No physical copy is currently available to fulfill this reservation.');
        return;
      }

      await libraryService.fulfillReservation(reservation.reservationId, availCopy.copyId);
      toast.success(`Reservation fulfilled with copy ${availCopy.accessionNo}! Book held for ${reservation.studentName}.`);
      loadReservations();
      loadStats();
    } catch (err) {
      console.error('Fulfill reservation error:', err);
      toast.error(err.response?.data?.message || 'Failed to fulfill hold');
    }
  };

  // Handle Cancel Reservation
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation hold?')) return;
    try {
      await libraryService.cancelReservation(reservationId);
      toast.info('Reservation cancelled.');
      loadReservations();
      loadStats();
    } catch (err) {
      console.error('Cancel reservation error:', err);
      toast.error('Failed to cancel reservation');
    }
  };

  // Handle Pay Fine
  const handlePayFine = async (fineId) => {
    try {
      await libraryService.payFine(fineId, 'DESK-CASH-' + Date.now().toString().slice(-6));
      toast.success('Fine marked as settled and cleared.');
      loadFines();
      loadStats();
    } catch (err) {
      console.error('Pay fine error:', err);
      toast.error('Failed to clear fine');
    }
  };

  // Handle Waive Fine
  const handleWaiveFine = async (fineId) => {
    const reason = window.prompt('Enter reason for waiving this overdue penalty:', 'Librarian academic waiver');
    if (!reason) return;

    try {
      await libraryService.waiveFine(fineId, reason);
      toast.info('Fine successfully waived.');
      loadFines();
      loadStats();
    } catch (err) {
      console.error('Waive fine error:', err);
      toast.error('Failed to waive fine');
    }
  };

  // Render Status Badge for physical copy
  const renderCopyBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Available</span>;
      case 'ISSUED':
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">Issued</span>;
      case 'RESERVED':
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">On Hold</span>;
      case 'MAINTENANCE':
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">Repair</span>;
      case 'LOST':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">Lost</span>;
      default:
        return <span className="badge bg-light text-dark px-2 py-1">{status}</span>;
    }
  };

  return (
    <DashboardLayout links={adminLinks}>
      <div className="container-fluid py-4 px-md-4">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="p-2 bg-indigo-50 text-indigo rounded-3 border border-indigo-100" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                <BookOpen size={24} />
              </span>
              <h2 className="fw-bold mb-0 text-dark">Library & Circulation Management</h2>
            </div>
            <p className="text-muted small mb-0">
              Manage multi-copy physical catalog, circulation desk lending, overdue fines, and book hold queues.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm rounded-3"
              onClick={() => openIssueModal()}
            >
              <Repeat size={18} />
              <span>Issue Book</span>
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-3 text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none' }}
              onClick={() => setShowAddBookModal(true)}
            >
              <Plus size={18} />
              <span>Add Book Title</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Book Titles</div>
                  <div className="fs-3 fw-bold text-dark mt-1">{stats.totalTitles}</div>
                  <div className="small text-muted mt-1">{stats.totalPhysicalCopies} Total Physical Copies</div>
                </div>
                <div className="p-3 bg-primary-subtle text-primary rounded-4">
                  <BookOpen size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-success">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Available On Shelf</div>
                  <div className="fs-3 fw-bold text-success mt-1">{stats.availableCopies}</div>
                  <div className="small text-muted mt-1">{stats.issuedCopies} Currently Borrowed</div>
                </div>
                <div className="p-3 bg-success-subtle text-success rounded-4">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-warning">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Active Loans / Holds</div>
                  <div className="fs-3 fw-bold text-dark mt-1">{stats.activeLoansCount}</div>
                  <div className="small text-warning fw-semibold mt-1">
                    {stats.overdueLoansCount} Overdue | {stats.pendingReservationsCount} Holds
                  </div>
                </div>
                <div className="p-3 bg-warning-subtle text-warning rounded-4">
                  <Clock size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-start border-4 border-danger">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Uncollected Fines</div>
                  <div className="fs-3 fw-bold text-danger mt-1">₹{Number(stats.totalUnpaidFines || 0).toFixed(2)}</div>
                  <div className="small text-muted mt-1">Calculated at ₹5/day overdue</div>
                </div>
                <div className="p-3 bg-danger-subtle text-danger rounded-4">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-2 p-md-3">
            <ul className="nav nav-pills gap-2 flex-wrap">
              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                    activeTab === 'catalog' ? 'active shadow-sm' : 'text-secondary'
                  }`}
                  style={{
                    background: activeTab === 'catalog' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                    color: activeTab === 'catalog' ? '#fff' : '#4b5563'
                  }}
                  onClick={() => setActiveTab('catalog')}
                >
                  <Layers size={18} />
                  <span className="fw-semibold">Catalog & Physical Copies</span>
                  <span className={`badge rounded-pill ms-1 ${activeTab === 'catalog' ? 'bg-white text-dark' : 'bg-light text-muted'}`}>
                    {books.length}
                  </span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                    activeTab === 'circulation' ? 'active shadow-sm' : 'text-secondary'
                  }`}
                  style={{
                    background: activeTab === 'circulation' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                    color: activeTab === 'circulation' ? '#fff' : '#4b5563'
                  }}
                  onClick={() => setActiveTab('circulation')}
                >
                  <Repeat size={18} />
                  <span className="fw-semibold">Circulation & Active Loans</span>
                  <span className={`badge rounded-pill ms-1 ${activeTab === 'circulation' ? 'bg-white text-dark' : 'bg-light text-muted'}`}>
                    {stats.activeLoansCount}
                  </span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                    activeTab === 'overdue' ? 'active shadow-sm' : 'text-secondary'
                  }`}
                  style={{
                    background: activeTab === 'overdue' ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 'transparent',
                    color: activeTab === 'overdue' ? '#fff' : '#4b5563'
                  }}
                  onClick={() => setActiveTab('overdue')}
                >
                  <AlertCircle size={18} />
                  <span className="fw-semibold">Overdue Loans & Reminders</span>
                  {stats.overdueLoansCount > 0 && (
                    <span className="badge rounded-pill bg-danger text-white ms-1">
                      {stats.overdueLoansCount}
                    </span>
                  )}
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                    activeTab === 'reservations' ? 'active shadow-sm' : 'text-secondary'
                  }`}
                  style={{
                    background: activeTab === 'reservations' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                    color: activeTab === 'reservations' ? '#fff' : '#4b5563'
                  }}
                  onClick={() => setActiveTab('reservations')}
                >
                  <BookmarkCheck size={18} />
                  <span className="fw-semibold">Reservations Queue</span>
                  <span className={`badge rounded-pill ms-1 ${activeTab === 'reservations' ? 'bg-white text-dark' : 'bg-light text-muted'}`}>
                    {stats.pendingReservationsCount}
                  </span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                    activeTab === 'fines' ? 'active shadow-sm' : 'text-secondary'
                  }`}
                  style={{
                    background: activeTab === 'fines' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                    color: activeTab === 'fines' ? '#fff' : '#4b5563'
                  }}
                  onClick={() => setActiveTab('fines')}
                >
                  <DollarSign size={18} />
                  <span className="fw-semibold">Fines Audit</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab 1: Catalog & Physical Copies */}
        {activeTab === 'catalog' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="Search title, author, or ISBN barcode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <select
                    className="form-select bg-light"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-3 text-md-end">
                  <span className="text-muted small">
                    Showing <strong>{books.length}</strong> catalog titles
                  </span>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Book Details</th>
                    <th>Category</th>
                    <th>ISBN</th>
                    <th>Inventory Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        Loading catalog books...
                      </td>
                    </tr>
                  ) : books.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <BookMarked size={48} className="text-muted opacity-50 mb-2" />
                        <div>No books found matching your criteria.</div>
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => {
                      const isExpanded = expandedBookId === book.bookId;
                      return (
                        <React.Fragment key={book.bookId}>
                          <tr className={isExpanded ? 'table-active' : ''}>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-link text-muted p-0"
                                onClick={() => setExpandedBookId(isExpanded ? null : book.bookId)}
                                title={isExpanded ? 'Hide copies' : 'View physical copies'}
                              >
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              </button>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                {book.coverImageUrl ? (
                                  <img
                                    src={book.coverImageUrl}
                                    alt={book.title}
                                    className="rounded shadow-sm"
                                    style={{ width: '45px', height: '60px', objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div
                                    className="rounded d-flex align-items-center justify-content-center bg-light text-primary fw-bold"
                                    style={{ width: '45px', height: '60px', fontSize: '0.8rem' }}
                                  >
                                    <BookOpen size={20} />
                                  </div>
                                )}
                                <div>
                                  <div className="fw-bold text-dark">{book.title}</div>
                                  <div className="text-muted small">{book.author}</div>
                                  <div className="text-muted small opacity-75">
                                    {book.publisher} {book.publicationYear ? `(${book.publicationYear})` : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-indigo-subtle text-indigo px-2 py-1" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                                {book.category}
                              </span>
                            </td>
                            <td>
                              <code className="text-dark bg-light px-2 py-1 rounded small border">
                                {book.isbn}
                              </code>
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <div className="d-flex align-items-center gap-2 small">
                                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                                    {book.availableCopies} Available
                                  </span>
                                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                    {book.issuedCopies} Issued
                                  </span>
                                </div>
                                <div className="text-muted small">
                                  {book.totalCopies} physical {book.totalCopies === 1 ? 'copy' : 'copies'} in library
                                </div>
                              </div>
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => openAddCopyModal(book)}
                                  title="Add new physical copy"
                                >
                                  <Plus size={14} className="me-1" />
                                  Copy
                                </button>
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => setExpandedBookId(isExpanded ? null : book.bookId)}
                                >
                                  {isExpanded ? 'Hide' : 'Inventory'}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Physical Copies Sub-table */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="6" className="p-0 bg-light">
                                <div className="p-3 border-start border-4 border-indigo bg-light">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                      <Barcode size={18} className="text-indigo" style={{ color: '#4f46e5' }} />
                                      Physical Copies & Accession Barcodes for "{book.title}"
                                    </h6>
                                    <button
                                      className="btn btn-sm btn-outline-primary rounded-3"
                                      onClick={() => openAddCopyModal(book)}
                                    >
                                      <Plus size={14} className="me-1" /> Add New Copy
                                    </button>
                                  </div>

                                  {book.copies && book.copies.length > 0 ? (
                                    <div className="table-responsive bg-white rounded-3 border">
                                      <table className="table table-sm align-middle mb-0">
                                        <thead className="table-light small text-muted">
                                          <tr>
                                            <th>Accession Barcode</th>
                                            <th>Shelf / Rack Location</th>
                                            <th>Copy Status</th>
                                            <th>Current Circulation</th>
                                            <th className="text-end">Quick Action</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {book.copies.map((copy) => (
                                            <tr key={copy.copyId}>
                                              <td>
                                                <code className="fw-bold text-indigo" style={{ color: '#4f46e5' }}>
                                                  {copy.accessionNo}
                                                </code>
                                              </td>
                                              <td className="small text-muted">{copy.rackLocation || 'General Stack'}</td>
                                              <td>{renderCopyBadge(copy.status)}</td>
                                              <td className="small">
                                                {copy.status === 'ISSUED' ? (
                                                  <span className="text-primary">
                                                    Issued (Loan #{copy.currentLoanId})
                                                  </span>
                                                ) : (
                                                  <span className="text-muted">On Rack</span>
                                                )}
                                              </td>
                                              <td className="text-end">
                                                {copy.status === 'AVAILABLE' ? (
                                                  <button
                                                    className="btn btn-sm btn-success py-0 px-2 rounded-2"
                                                    style={{ fontSize: '0.75rem' }}
                                                    onClick={() => openIssueModal(copy)}
                                                  >
                                                    Issue Copy
                                                  </button>
                                                ) : (
                                                  <span className="text-muted small">-</span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="alert alert-warning py-2 mb-0 small">
                                      No physical copies recorded yet. Click "Add New Copy" to register barcode accession numbers.
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Circulation & Active Loans */}
        {activeTab === 'circulation' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">Active Lending & Circulation Records</h5>
              <button
                className="btn btn-primary btn-sm rounded-3 text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none' }}
                onClick={() => openIssueModal()}
              >
                <Plus size={16} className="me-1" /> New Issue Check-Out
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Loan ID</th>
                    <th>Book Details</th>
                    <th>Copy Accession</th>
                    <th>Student Borrower</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        Loading circulation records...
                      </td>
                    </tr>
                  ) : loans.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No active book loans on record.
                      </td>
                    </tr>
                  ) : (
                    loans.map((loan) => (
                      <tr key={loan.loanId}>
                        <td><strong>#{loan.loanId}</strong></td>
                        <td>
                          <div className="fw-bold text-dark">{loan.bookTitle}</div>
                          <div className="text-muted small">{loan.bookAuthor}</div>
                        </td>
                        <td>
                          <code className="text-dark bg-light px-2 py-1 rounded small border">
                            {loan.accessionNo}
                          </code>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{loan.studentName}</div>
                          <div className="text-muted small">
                            {loan.studentRegNo ? `Reg: ${loan.studentRegNo}` : `Student ID: ${loan.studentId}`}
                          </div>
                        </td>
                        <td className="small text-muted">{new Date(loan.issuedAt).toLocaleDateString()}</td>
                        <td className="small">
                          <span className={loan.isOverdue ? 'text-danger fw-bold' : 'text-dark'}>
                            {new Date(loan.dueAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          {loan.status === 'RETURNED' ? (
                            <span className="badge bg-success-subtle text-success">Returned</span>
                          ) : loan.isOverdue ? (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                              Overdue ({loan.daysOverdue} days)
                            </span>
                          ) : (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          {loan.status !== 'RETURNED' ? (
                            <button
                              className="btn btn-sm btn-outline-success rounded-2"
                              onClick={() => openReturnModal(loan)}
                            >
                              Check-In Return
                            </button>
                          ) : (
                            <span className="text-muted small">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Overdue Loans & Reminders */}
        {activeTab === 'overdue' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                  <AlertCircle size={20} />
                  Overdue Borrowers & Fine Levying
                </h5>
                <p className="text-muted small mb-0">
                  Late returns accrue an overdue penalty of ₹5.00 per day.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Loan #</th>
                    <th>Borrower</th>
                    <th>Book Title & Barcode</th>
                    <th>Due Date</th>
                    <th>Days Overdue</th>
                    <th>Accrued Fine</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
                        Scanning overdue accounts...
                      </td>
                    </tr>
                  ) : loans.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-success">
                        <CheckCircle size={36} className="text-success mb-2" />
                        <div className="fw-semibold">No overdue books! All loans are on schedule.</div>
                      </td>
                    </tr>
                  ) : (
                    loans.map((loan) => (
                      <tr key={loan.loanId}>
                        <td><strong>#{loan.loanId}</strong></td>
                        <td>
                          <div className="fw-bold text-dark">{loan.studentName}</div>
                          <div className="text-muted small">{loan.studentRegNo || 'ID: ' + loan.studentId}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{loan.bookTitle}</div>
                          <code className="text-muted small">{loan.accessionNo}</code>
                        </td>
                        <td className="text-danger fw-bold small">{new Date(loan.dueAt).toLocaleDateString()}</td>
                        <td>
                          <span className="badge bg-danger text-white">
                            {loan.daysOverdue} days late
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold text-danger">
                            ₹{Number(loan.estimatedFine || (loan.daysOverdue * 5)).toFixed(2)}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleSendReminder(loan)}
                              title="Send Reminder"
                            >
                              <Send size={14} className="me-1" /> Reminder
                            </button>
                            <button
                              className="btn btn-success"
                              onClick={() => openReturnModal(loan)}
                            >
                              Return & Fine
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Reservations Queue */}
        {activeTab === 'reservations' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <BookmarkCheck size={20} className="text-primary" />
                  Student Book Hold Requests
                </h5>
                <p className="text-muted small mb-0">
                  Holds queued by students for catalog titles that are currently checked out.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Hold ID</th>
                    <th>Book Title</th>
                    <th>Requested By</th>
                    <th>Reserved At</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        Loading reservations...
                      </td>
                    </tr>
                  ) : reservations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No pending book reservations at this time.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((res) => (
                      <tr key={res.reservationId}>
                        <td><strong>#{res.reservationId}</strong></td>
                        <td>
                          <div className="fw-bold text-dark">{res.bookTitle}</div>
                          <div className="text-muted small">{res.bookAuthor}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{res.studentName}</div>
                          <div className="text-muted small">{res.studentRegNo || 'ID: ' + res.studentId}</div>
                        </td>
                        <td className="small text-muted">{new Date(res.reservedAt).toLocaleDateString()}</td>
                        <td>
                          {res.status === 'PENDING' ? (
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                              Pending Hold
                            </span>
                          ) : res.status === 'FULFILLED' ? (
                            <span className="badge bg-success-subtle text-success">Fulfilled</span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary">{res.status}</span>
                          )}
                        </td>
                        <td className="text-end">
                          {res.status === 'PENDING' && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleFulfillReservation(res)}
                              >
                                Allocate Copy
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancelReservation(res.reservationId)}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Fines Audit */}
        {activeTab === 'fines' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <DollarSign size={20} className="text-warning" />
                  Library Overdue Fines & Settlements
                </h5>
                <p className="text-muted small mb-0">
                  Comprehensive audit trail of overdue penalties levied, collected, and waived.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Fine ID</th>
                    <th>Borrower</th>
                    <th>Book Title & Loan</th>
                    <th>Amount</th>
                    <th>Fine Status</th>
                    <th>Settlement Info</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        Loading fines records...
                      </td>
                    </tr>
                  ) : fines.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No fines recorded. All circulation accounts clear.
                      </td>
                    </tr>
                  ) : (
                    fines.map((fine) => (
                      <tr key={fine.fineId}>
                        <td><strong>#{fine.fineId}</strong></td>
                        <td>
                          <div className="fw-bold text-dark">{fine.studentName}</div>
                          <div className="text-muted small">{fine.studentRegNo || 'ID: ' + fine.studentId}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{fine.bookTitle}</div>
                          <div className="text-muted small">Loan #{fine.loanId}</div>
                        </td>
                        <td>
                          <span className="fw-bold text-danger">₹{Number(fine.amount).toFixed(2)}</span>
                        </td>
                        <td>
                          {fine.status === 'PAID' ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle">Paid</span>
                          ) : fine.status === 'WAIVED' ? (
                            <span className="badge bg-secondary-subtle text-secondary">Waived</span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Unpaid</span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {fine.status === 'PAID' ? (
                            <div>
                              <div>Paid: {fine.paidAt ? new Date(fine.paidAt).toLocaleDateString() : 'Yes'}</div>
                              <code className="text-muted">{fine.paymentRef}</code>
                            </div>
                          ) : fine.status === 'WAIVED' ? (
                            <span className="text-muted italic">{fine.fineReason}</span>
                          ) : (
                            <span className="text-danger fw-semibold">Pending Payment</span>
                          )}
                        </td>
                        <td className="text-end">
                          {fine.status === 'UNPAID' && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-success"
                                onClick={() => handlePayFine(fine.fineId)}
                              >
                                Mark Paid
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleWaiveFine(fine.fineId)}
                              >
                                Waive
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Book Title */}
        {showAddBookModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-bottom p-3">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <BookOpen size={20} className="text-primary" />
                    Register New Book Title
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddBookModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleAddBookSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-12 col-md-8">
                        <label className="form-label fw-semibold small">Book Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Introduction to Algorithms (CLRS 4th Ed)"
                          value={bookForm.title}
                          onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold small">ISBN Barcode *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="978-0262046305"
                          value={bookForm.isbn}
                          onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Author(s) *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                          value={bookForm.author}
                          onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Category / Discipline *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Computer Science, Data Structures"
                          value={bookForm.category}
                          onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Publisher</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. MIT Press"
                          value={bookForm.publisher}
                          onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small">Publication Year</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bookForm.publicationYear}
                          onChange={(e) => setBookForm({ ...bookForm, publicationYear: e.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Description / Summary</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Overview of syllabus, chapters, and subject matter..."
                          value={bookForm.description}
                          onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                        ></textarea>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Cover Image URL</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://images.example.com/books/cover.jpg"
                          value={bookForm.coverImageUrl}
                          onChange={(e) => setBookForm({ ...bookForm, coverImageUrl: e.target.value })}
                        />
                      </div>

                      {/* Initial Physical Copies Creation */}
                      <div className="col-12 border-top pt-3 mt-3">
                        <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                          <Layers size={16} className="text-primary" />
                          Initial Physical Copies Inventory
                        </h6>
                        <div className="row g-2">
                          <div className="col-md-4">
                            <label className="form-label small text-muted">Copies to register</label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              className="form-control"
                              value={bookForm.initialCopiesCount}
                              onChange={(e) => setBookForm({ ...bookForm, initialCopiesCount: e.target.value })}
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small text-muted">Accession Prefix</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bookForm.accessionPrefix}
                              onChange={(e) => setBookForm({ ...bookForm, accessionPrefix: e.target.value })}
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small text-muted">Shelf / Rack</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bookForm.rackLocation}
                              onChange={(e) => setBookForm({ ...bookForm, rackLocation: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button
                      type="button"
                      className="btn btn-light rounded-3"
                      onClick={() => setShowAddBookModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 text-white"
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none' }}
                    >
                      Save Title & Register Copies
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Physical Copy */}
        {showAddCopyModal && selectedBookForCopy && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-bottom p-3">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <Barcode size={20} className="text-primary" />
                    Register Physical Copy
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddCopyModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleAddCopySubmit}>
                  <div className="modal-body p-4">
                    <div className="alert alert-light border mb-3 small">
                      <strong>Book:</strong> {selectedBookForCopy.title} <br />
                      <strong>Author:</strong> {selectedBookForCopy.author}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Accession Barcode Number *</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        required
                        value={copyForm.accessionNo}
                        onChange={(e) => setCopyForm({ ...copyForm, accessionNo: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Rack / Shelf Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={copyForm.rackLocation}
                        onChange={(e) => setCopyForm({ ...copyForm, rackLocation: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Initial Status</label>
                      <select
                        className="form-select"
                        value={copyForm.status}
                        onChange={(e) => setCopyForm({ ...copyForm, status: e.target.value })}
                      >
                        <option value="AVAILABLE">AVAILABLE (Ready for circulation)</option>
                        <option value="MAINTENANCE">MAINTENANCE (Binding / Repair)</option>
                        <option value="LOST">LOST</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button
                      type="button"
                      className="btn btn-light rounded-3"
                      onClick={() => setShowAddCopyModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 text-white"
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none' }}
                    >
                      Register Copy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Issue Book */}
        {showIssueModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-bottom p-3">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <Repeat size={20} className="text-primary" />
                    Circulation Check-Out: Issue Book
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowIssueModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleIssueSubmit}>
                  <div className="modal-body p-4">
                    {/* Copy Selection */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Physical Copy *</label>
                      {preselectedCopy ? (
                        <div className="p-3 bg-light rounded border">
                          <div className="fw-bold">{preselectedCopy.bookTitle || 'Selected Copy'}</div>
                          <div className="small text-muted">
                            Barcode: <code className="text-primary">{preselectedCopy.accessionNo}</code> (Rack: {preselectedCopy.rackLocation})
                          </div>
                        </div>
                      ) : (
                        <select
                          className="form-select"
                          required
                          value={issueForm.copyId}
                          onChange={(e) => setIssueForm({ ...issueForm, copyId: e.target.value })}
                        >
                          <option value="">-- Choose an Available Copy --</option>
                          {books.flatMap(b => (b.copies || []).filter(c => c.status === 'AVAILABLE').map(c => (
                            <option key={c.copyId} value={c.copyId}>
                              {b.title} - [{c.accessionNo}] ({c.rackLocation})
                            </option>
                          )))}
                        </select>
                      )}
                    </div>

                    {/* Student Selection */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Student Borrower *</label>
                      <select
                        className="form-select"
                        required
                        value={issueForm.studentId}
                        onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                      >
                        <option value="">-- Select Student Borrower --</option>
                        {students.map((s) => {
                          const sId = s.studentId || s.id;
                          return (
                            <option key={sId} value={sId}>
                              {s.name} ({s.regNo || `ID: ${sId}`}) - {s.department?.name || 'Student'}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Lending Period */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Loan Period (Days)</label>
                      <select
                        className="form-select"
                        value={issueForm.dueDays}
                        onChange={(e) => setIssueForm({ ...issueForm, dueDays: e.target.value })}
                      >
                        <option value="7">7 Days (Standard)</option>
                        <option value="14">14 Days (Default Regular Term)</option>
                        <option value="30">30 Days (Extended Research)</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Librarian Remarks</label>
                      <input
                        type="text"
                        className="form-control"
                        value={issueForm.remarks}
                        onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button
                      type="button"
                      className="btn btn-light rounded-3"
                      onClick={() => setShowIssueModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 text-white"
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none' }}
                    >
                      Confirm Issue Check-Out
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Return Book */}
        {showReturnModal && selectedLoanForReturn && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-bottom p-3">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <CheckCircle size={20} className="text-success" />
                    Circulation Check-In: Return Book
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowReturnModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleReturnSubmit}>
                  <div className="modal-body p-4">
                    <div className="p-3 bg-light rounded border mb-3">
                      <div className="fw-bold">{selectedLoanForReturn.bookTitle}</div>
                      <div className="small text-muted">
                        Accession: <code>{selectedLoanForReturn.accessionNo}</code>
                      </div>
                      <div className="small text-muted mt-1">
                        Borrower: <strong>{selectedLoanForReturn.studentName}</strong>
                      </div>
                      <div className="small text-muted">
                        Due Date: {new Date(selectedLoanForReturn.dueAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Overdue calculation display */}
                    {new Date() > new Date(selectedLoanForReturn.dueAt) ? (
                      <div className="alert alert-danger py-2 small mb-3">
                        <div className="fw-bold d-flex align-items-center gap-1">
                          <AlertCircle size={16} /> This loan is overdue!
                        </div>
                        <div>
                          Days Late: {Math.max(1, Math.ceil((new Date() - new Date(selectedLoanForReturn.dueAt)) / (1000 * 60 * 60 * 24)))} days
                        </div>
                        <div className="fw-bold mt-1">
                          Overdue Fine: ₹{(Math.max(1, Math.ceil((new Date() - new Date(selectedLoanForReturn.dueAt)) / (1000 * 60 * 60 * 24))) * 5).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-success py-2 small mb-3">
                        <CheckCircle size={16} className="me-1" />
                        Returned on time! No overdue fine applicable.
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Condition & Remarks</label>
                      <input
                        type="text"
                        className="form-control"
                        value={returnForm.conditionRemarks}
                        onChange={(e) => setReturnForm({ ...returnForm, conditionRemarks: e.target.value })}
                      />
                    </div>

                    {new Date() > new Date(selectedLoanForReturn.dueAt) && (
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="waiveFineCheck"
                          checked={returnForm.waiveFine}
                          onChange={(e) => setReturnForm({ ...returnForm, waiveFine: e.target.checked })}
                        />
                        <label className="form-check-label small" htmlFor="waiveFineCheck">
                          Waive overdue fine (Special librarian concession)
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button
                      type="button"
                      className="btn btn-light rounded-3"
                      onClick={() => setShowReturnModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success rounded-3 text-white"
                    >
                      Process Return Check-In
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

export default AdminLibrary;
