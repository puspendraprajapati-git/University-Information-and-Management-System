import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId } from '../../services/studentService';
import libraryService from '../../api/libraryService';
import {
  BookOpen,
  Search,
  BookmarkCheck,
  DollarSign,
  CheckCircle,
  CreditCard,
  RotateCcw,
  BookMarked,
  Info
} from 'lucide-react';

const StudentLibrary = () => {
  const { user } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-loans' | 'my-holds' | 'fines'

  // Student resolution
  const [student, setStudent] = useState(null);
  const [studentId, setStudentId] = useState(1);

  // Catalog state
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Personal borrowing data
  const [myLoans, setMyLoans] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [myFines, setMyFines] = useState([]);

  // Modals & form state
  const [selectedBookForHold, setSelectedBookForHold] = useState(null);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdNotes, setHoldNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to resolve currently logged in user safely
  const getResolvedUser = () => {
    if (user && (user.id || user.userId)) return user;
    try {
      const stored = sessionStorage.getItem('user') || localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Load catalog books
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
      toast.error('Failed to load library catalog');
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

  // Load Student Specific Data (Loans, Holds, Fines)
  const loadStudentData = useCallback(async (sId) => {
    if (!sId) return;
    try {
      const [loansRes, resRes, finesRes] = await Promise.all([
        libraryService.getStudentLoans(sId).catch(() => ({ data: [] })),
        libraryService.getStudentReservations(sId).catch(() => ({ data: [] })),
        libraryService.getStudentFines(sId).catch(() => ({ data: [] }))
      ]);

      setMyLoans(loansRes.data || []);
      setMyReservations(resRes.data || []);
      setMyFines(finesRes.data || []);
    } catch (err) {
      console.error('Failed to load student library records:', err);
    }
  }, []);

  // Initialize and resolve student
  useEffect(() => {
    loadBooks();
    loadCategories();

    const resolveStudent = async () => {
      const activeUser = getResolvedUser();
      let resolvedId = 1;

      if (activeUser?.userId) {
        try {
          const res = await getStudentByUserId(activeUser.userId);
          if (res?.data) {
            setStudent(res.data);
            resolvedId = res.data.studentId || res.data.id || activeUser.userId;
          }
        } catch (e) {
          console.warn('Could not fetch student by userId, using fallback ID:', e);
        }
      }
      setStudentId(resolvedId);
      loadStudentData(resolvedId);
    };

    resolveStudent();
  }, [loadBooks, loadCategories, loadStudentData, user]);

  // Handle Place Hold / Reserve
  const openHoldModal = (book) => {
    setSelectedBookForHold(book);
    setHoldNotes('Required for semester coursework reference');
    setShowHoldModal(true);
  };

  const handleHoldSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookForHold) return;

    try {
      await libraryService.createReservation({
        bookId: selectedBookForHold.bookId,
        studentId: studentId,
        notes: holdNotes
      });

      toast.success(`Reservation hold placed for "${selectedBookForHold.title}"! You will be notified when a copy is available.`);
      setShowHoldModal(false);
      loadStudentData(studentId);
      loadBooks();
    } catch (err) {
      console.error('Hold error:', err);
      toast.error(err.response?.data?.message || 'Failed to place reservation hold');
    }
  };

  // Handle Cancel Reservation
  const handleCancelHold = async (reservationId) => {
    if (!window.confirm('Cancel this book reservation?')) return;
    try {
      await libraryService.cancelReservation(reservationId);
      toast.info('Reservation hold cancelled.');
      loadStudentData(studentId);
    } catch (err) {
      console.error('Cancel hold error:', err);
      toast.error('Failed to cancel reservation');
    }
  };

  // Handle Renew Loan
  const handleRenewLoan = async (loanId) => {
    try {
      await libraryService.renewLoan(loanId, 14);
      toast.success('Book loan renewed successfully for +14 days!');
      loadStudentData(studentId);
    } catch (err) {
      console.error('Renew error:', err);
      toast.error(err.response?.data?.message || 'Unable to renew loan. It may be overdue or already renewed.');
    }
  };

  // Handle Pay Fine Online
  const handlePayFineOnline = async (fineId) => {
    try {
      const ref = `ONLINE-UPI-${Date.now().toString().slice(-6)}`;
      await libraryService.payFine(fineId, ref);
      toast.success(`Fine paid successfully! Payment Reference: ${ref}`);
      loadStudentData(studentId);
    } catch (err) {
      console.error('Pay fine error:', err);
      toast.error('Failed to process payment');
    }
  };

  // Calculate unpaid fines total
  const unpaidFineTotal = myFines
    .filter(f => f.status === 'UNPAID')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  // Active unreturned loans
  const activeLoansList = myLoans.filter(l => l.status === 'ISSUED');

  return (
    <DashboardLayout links={studentLinks}>
      <div className="container-fluid py-4 px-md-4">
        {/* Banner */}
        <div
          className="rounded-4 p-4 mb-4 text-white shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          }}
        >
          <div className="row align-items-center">
            <div className="col-12 col-md-8">
              <span className="badge bg-white-subtle text-white border border-white-subtle px-3 py-1 mb-2 rounded-pill small">
                Central Library Portal & Digital Catalog
              </span>
              <h2 className="fw-bold mb-1">University Library Services {student?.name ? `• ${student.name}` : ''}</h2>
              <p className="mb-0 text-white-50">
                Explore thousands of academic textbooks, verify physical shelf availability, track your borrowed loans, and manage reservations.
              </p>
            </div>
            <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
              <div className="d-inline-flex gap-3 bg-white bg-opacity-10 p-3 rounded-4 backdrop-blur">
                <div className="text-center">
                  <div className="fs-4 fw-bold">{activeLoansList.length}</div>
                  <div className="small text-white-50">Borrowed</div>
                </div>
                <div className="vr bg-white opacity-25"></div>
                <div className="text-center">
                  <div className="fs-4 fw-bold">{myReservations.filter(r => r.status === 'PENDING').length}</div>
                  <div className="small text-white-50">Holds</div>
                </div>
                <div className="vr bg-white opacity-25"></div>
                <div className="text-center">
                  <div className={`fs-4 fw-bold ${unpaidFineTotal > 0 ? 'text-warning' : 'text-success'}`}>
                    ₹{unpaidFineTotal.toFixed(0)}
                  </div>
                  <div className="small text-white-50">Fines Due</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-2 p-md-3">
            <ul className="nav nav-pills gap-2 flex-wrap">
              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                    activeTab === 'browse' ? 'active shadow-sm' : 'text-secondary'
                  }`}
                  style={{
                    background: activeTab === 'browse' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                    color: activeTab === 'browse' ? '#fff' : '#4b5563'
                  }}
                  onClick={() => setActiveTab('browse')}
                >
                  <Search size={18} />
                  <span className="fw-semibold">Browse Books & Catalog</span>
                  <span className={`badge rounded-pill ms-1 ${activeTab === 'browse' ? 'bg-white text-dark' : 'bg-light text-muted'}`}>
                    {books.length}
                  </span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                    activeTab === 'my-loans' ? 'active shadow-sm' : 'text-secondary'
                  }`}
                  style={{
                    background: activeTab === 'my-loans' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                    color: activeTab === 'my-loans' ? '#fff' : '#4b5563'
                  }}
                  onClick={() => setActiveTab('my-loans')}
                >
                  <BookOpen size={18} />
                  <span className="fw-semibold">My Borrowed Books</span>
                  <span className={`badge rounded-pill ms-1 ${activeTab === 'my-loans' ? 'bg-white text-dark' : 'bg-light text-muted'}`}>
                    {activeLoansList.length}
                  </span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                    activeTab === 'my-holds' ? 'active shadow-sm' : 'text-secondary'
                  }`}
                  style={{
                    background: activeTab === 'my-holds' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
                    color: activeTab === 'my-holds' ? '#fff' : '#4b5563'
                  }}
                  onClick={() => setActiveTab('my-holds')}
                >
                  <BookmarkCheck size={18} />
                  <span className="fw-semibold">My Reservations</span>
                  <span className={`badge rounded-pill ms-1 ${activeTab === 'my-holds' ? 'bg-white text-dark' : 'bg-light text-muted'}`}>
                    {myReservations.length}
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
                  <span className="fw-semibold">Fines & Penalties</span>
                  {unpaidFineTotal > 0 && (
                    <span className="badge rounded-pill bg-danger text-white ms-1">
                      ₹{unpaidFineTotal.toFixed(0)}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab 1: Browse Books & Catalog */}
        {activeTab === 'browse' && (
          <div>
            {/* Search & Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-3">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Search size={16} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0 ps-0"
                        placeholder="Search by book title, author, or ISBN barcode..."
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

                  <div className="col-12 col-md-2 text-md-end text-muted small">
                    {books.length} titles available
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="text-muted mt-2">Searching library catalog...</div>
              </div>
            ) : books.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                <BookMarked size={48} className="text-muted opacity-50 mx-auto mb-3" />
                <h5 className="fw-bold text-dark">No Books Found</h5>
                <p className="text-muted small">Try adjusting your search terms or category filter.</p>
              </div>
            ) : (
              <div className="row g-4">
                {books.map((book) => {
                  const hasAvailable = book.availableCopies > 0;
                  const firstAvailRack = (book.copies || []).find(c => c.status === 'AVAILABLE')?.rackLocation;

                  return (
                    <div key={book.bookId} className="col-12 col-md-6 col-xl-4">
                      <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column hover-shadow">
                        <div className="card-body p-3 p-xl-4 d-flex flex-column">
                          <div className="d-flex gap-3 mb-3">
                            {book.coverImageUrl ? (
                              <img
                                src={book.coverImageUrl}
                                alt={book.title}
                                className="rounded shadow-sm"
                                style={{ width: '70px', height: '95px', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div
                                className="rounded d-flex align-items-center justify-content-center bg-light text-primary fw-bold"
                                style={{ width: '70px', height: '95px', fontSize: '0.9rem' }}
                              >
                                <BookOpen size={28} />
                              </div>
                            )}

                            <div className="flex-grow-1">
                              <span
                                className="badge px-2 py-1 mb-1 rounded-pill small"
                                style={{ background: '#eef2ff', color: '#4f46e5' }}
                              >
                                {book.category}
                              </span>
                              <h6 className="fw-bold text-dark mb-1 line-clamp-2" title={book.title}>
                                {book.title}
                              </h6>
                              <div className="text-muted small mb-1">{book.author}</div>
                              <div className="text-muted small opacity-75">
                                {book.publisher} {book.publicationYear ? `(${book.publicationYear})` : ''}
                              </div>
                            </div>
                          </div>

                          <p className="text-muted small line-clamp-2 mb-3 flex-grow-1">
                            {book.description || 'Core academic reference text for university coursework and degree modules.'}
                          </p>

                          <div className="p-2 bg-light rounded-3 mb-3 small">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="text-muted">ISBN:</span>
                              <code className="text-dark">{book.isbn}</code>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted">Shelf Availability:</span>
                              {hasAvailable ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                  {book.availableCopies} of {book.totalCopies} Available
                                </span>
                              ) : (
                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                  All {book.totalCopies} Checked Out
                                </span>
                              )}
                            </div>
                            {hasAvailable && firstAvailRack && (
                              <div className="d-flex justify-content-between align-items-center mt-1 text-muted" style={{ fontSize: '0.78rem' }}>
                                <span>Shelf Location:</span>
                                <strong>{firstAvailRack}</strong>
                              </div>
                            )}
                          </div>

                          <div className="mt-auto">
                            {hasAvailable ? (
                              <div className="d-flex align-items-center justify-content-between gap-2">
                                <span className="small text-success d-flex align-items-center gap-1">
                                  <CheckCircle size={15} /> Ready at Desk
                                </span>
                                <button
                                  className="btn btn-sm btn-outline-primary rounded-3"
                                  onClick={() => openHoldModal(book)}
                                >
                                  Reserve Copy
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-sm btn-warning w-100 rounded-3 text-dark fw-semibold"
                                onClick={() => openHoldModal(book)}
                              >
                                <BookmarkCheck size={16} className="me-1" />
                                Place Hold / Queue Me
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Borrowed Books */}
        {activeTab === 'my-loans' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-dark">My Active Book Loans & Reading History</h5>
                <p className="text-muted small mb-0">Track due dates, renew lending periods, and avoid late return fines.</p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Loan #</th>
                    <th>Book Details</th>
                    <th>Accession Barcode</th>
                    <th>Issued Date</th>
                    <th>Due Date</th>
                    <th>Remaining Days / Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myLoans.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <BookOpen size={48} className="text-muted opacity-50 mb-2" />
                        <div>You do not have any borrowed books currently.</div>
                        <button
                          className="btn btn-primary btn-sm mt-3 rounded-3"
                          onClick={() => setActiveTab('browse')}
                        >
                          Browse Library Catalog
                        </button>
                      </td>
                    </tr>
                  ) : (
                    myLoans.map((loan) => (
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
                        <td className="small text-muted">{new Date(loan.issuedAt).toLocaleDateString()}</td>
                        <td className="small">
                          <span className={loan.isOverdue ? 'text-danger fw-bold' : 'text-dark'}>
                            {new Date(loan.dueAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          {loan.status === 'RETURNED' ? (
                            <span className="badge bg-success-subtle text-success">
                              Returned on {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString() : 'Yes'}
                            </span>
                          ) : loan.isOverdue ? (
                            <span className="badge bg-danger text-white">
                              Overdue by {loan.daysOverdue} days (Fine: ₹{(loan.daysOverdue * 5).toFixed(2)})
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              {loan.daysRemaining} days remaining
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          {loan.status === 'ISSUED' && !loan.isOverdue && (
                            <button
                              className="btn btn-sm btn-outline-primary rounded-2 d-inline-flex align-items-center gap-1"
                              onClick={() => handleRenewLoan(loan.loanId)}
                              title="Renew loan for 14 more days"
                            >
                              <RotateCcw size={14} /> Renew (+14d)
                            </button>
                          )}
                          {loan.status === 'ISSUED' && loan.isOverdue && (
                            <span className="text-danger small fw-semibold">
                              Please return at circulation desk
                            </span>
                          )}
                          {loan.status === 'RETURNED' && (
                            <span className="text-muted small">Returned</span>
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

        {/* Tab 3: My Reservations */}
        {activeTab === 'my-holds' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">My Book Reservations & Hold Queue</h5>
              <p className="text-muted small mb-0">When a physical copy is returned and reserved for you, collect it at the Central Desk.</p>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Hold ID</th>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Reserved On</th>
                    <th>Hold Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myReservations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <BookmarkCheck size={48} className="text-muted opacity-50 mb-2" />
                        <div>You have no active book reservations.</div>
                      </td>
                    </tr>
                  ) : (
                    myReservations.map((res) => (
                      <tr key={res.reservationId}>
                        <td><strong>#{res.reservationId}</strong></td>
                        <td className="fw-bold text-dark">{res.bookTitle}</td>
                        <td className="text-muted small">{res.bookAuthor}</td>
                        <td className="small text-muted">{new Date(res.reservedAt).toLocaleDateString()}</td>
                        <td>
                          {res.status === 'PENDING' ? (
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                              Queued / In Waiting
                            </span>
                          ) : res.status === 'FULFILLED' ? (
                            <span className="badge bg-success text-white">
                              Ready for Pickup at Library Desk
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary">{res.status}</span>
                          )}
                        </td>
                        <td className="text-end">
                          {res.status === 'PENDING' && (
                            <button
                              className="btn btn-sm btn-outline-danger rounded-2"
                              onClick={() => handleCancelHold(res.reservationId)}
                            >
                              Cancel Hold
                            </button>
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

        {/* Tab 4: Fines & Penalties */}
        {activeTab === 'fines' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-dark">My Library Overdue Fines</h5>
                <p className="text-muted small mb-0">Library fine rate: ₹5.00 per day after the loan due date.</p>
              </div>
              {unpaidFineTotal > 0 && (
                <div className="text-end">
                  <span className="text-muted small">Total Due: </span>
                  <span className="fw-bold text-danger fs-5">₹{unpaidFineTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Fine #</th>
                    <th>Book Details</th>
                    <th>Loan ID</th>
                    <th>Amount</th>
                    <th>Fine Status</th>
                    <th>Settlement Info</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myFines.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-success">
                        <CheckCircle size={36} className="text-success mb-2" />
                        <div className="fw-bold">No fines on your account!</div>
                        <div className="small text-muted">All books were returned on time.</div>
                      </td>
                    </tr>
                  ) : (
                    myFines.map((fine) => (
                      <tr key={fine.fineId}>
                        <td><strong>#{fine.fineId}</strong></td>
                        <td className="fw-semibold text-dark">{fine.bookTitle}</td>
                        <td className="small text-muted">Loan #{fine.loanId}</td>
                        <td>
                          <span className="fw-bold text-danger">₹{Number(fine.amount).toFixed(2)}</span>
                        </td>
                        <td>
                          {fine.status === 'PAID' ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              Settled / Paid
                            </span>
                          ) : fine.status === 'WAIVED' ? (
                            <span className="badge bg-secondary-subtle text-secondary">Waived</span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {fine.status === 'PAID' ? (
                            <div>
                              <div>Paid: {fine.paidAt ? new Date(fine.paidAt).toLocaleDateString() : 'Yes'}</div>
                              <code>{fine.paymentRef}</code>
                            </div>
                          ) : fine.status === 'WAIVED' ? (
                            <span>{fine.fineReason}</span>
                          ) : (
                            <span className="text-danger">Pending</span>
                          )}
                        </td>
                        <td className="text-end">
                          {fine.status === 'UNPAID' && (
                            <button
                              className="btn btn-sm btn-success rounded-3 d-inline-flex align-items-center gap-1"
                              onClick={() => handlePayFineOnline(fine.fineId)}
                            >
                              <CreditCard size={14} /> Pay ₹{Number(fine.amount).toFixed(0)}
                            </button>
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

        {/* Modal: Place Hold / Reservation */}
        {showHoldModal && selectedBookForHold && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow">
                <div className="modal-header border-bottom p-3">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <BookmarkCheck size={20} className="text-primary" />
                    Place Reservation Hold
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowHoldModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleHoldSubmit}>
                  <div className="modal-body p-4">
                    <div className="p-3 bg-light rounded border mb-3">
                      <div className="fw-bold">{selectedBookForHold.title}</div>
                      <div className="text-muted small">By {selectedBookForHold.author}</div>
                      <div className="text-muted small">ISBN: {selectedBookForHold.isbn}</div>
                      <div className="text-muted small mt-1">
                        Category: <span className="badge bg-indigo-subtle text-indigo">{selectedBookForHold.category}</span>
                      </div>
                    </div>

                    <div className="alert alert-info py-2 small mb-3 d-flex align-items-start gap-2">
                      <Info size={18} className="text-primary flex-shrink-0 mt-1" />
                      <div>
                        Placing a hold will queue your request. As soon as a physical copy is returned or available, the library will hold it for 48 hours for you to pick up.
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Reservation Notes (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={holdNotes}
                        onChange={(e) => setHoldNotes(e.target.value)}
                        placeholder="e.g. For semester end project research"
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3">
                    <button
                      type="button"
                      className="btn btn-light rounded-3"
                      onClick={() => setShowHoldModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 text-white"
                      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none' }}
                    >
                      Confirm Hold Request
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

export default StudentLibrary;
