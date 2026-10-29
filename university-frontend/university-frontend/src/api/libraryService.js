/**
 * Library Service API Client
 * Facilitates HTTP communication with the ASP.NET Core Library Microservice (Port 5300)
 * routed securely via the University API Gateway.
 */

import axios from 'axios';

// Base Axios instance configured for library operations
const libraryAxios = axios.create({
  baseURL: process.env.REACT_APP_LIBRARY_URL || '/library',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Bearer authorization token into requests
libraryAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const libraryService = {
  // ==========================================
  // Books & Catalog Operations
  // ==========================================

  // Fetch all catalog books with optional category or text search
  getAllBooks: (params = {}) => {
    return libraryAxios.get('/books', { params });
  },

  // Retrieve detailed book info including physical copies inventory
  getBookById: (id) => {
    return libraryAxios.get(`/books/${id}`);
  },

  // Add a new book title to the library catalog (Admin/Librarian)
  createBook: (bookData) => {
    return libraryAxios.post('/books', bookData);
  },

  // Update existing book title details
  updateBook: (id, bookData) => {
    return libraryAxios.put(`/books/${id}`, bookData);
  },

  // Remove a book title and its inventory
  deleteBook: (id) => {
    return libraryAxios.delete(`/books/${id}`);
  },

  // Retrieve distinct categories for filter dropdowns
  getCategories: () => {
    return libraryAxios.get('/books/categories');
  },

  // ==========================================
  // Physical Book Copies Inventory
  // ==========================================

  // List all physical copies of a specific book title
  getCopiesByBook: (bookId) => {
    return libraryAxios.get(`/books/${bookId}/copies`);
  },

  // Register a new physical copy accession barcode/tag
  createCopy: (bookId, copyData) => {
    return libraryAxios.post(`/books/${bookId}/copies`, copyData);
  },

  // Update physical copy status (e.g. AVAILABLE, MAINTENANCE, LOST) or rack location
  updateCopy: (copyId, copyData) => {
    return libraryAxios.put(`/books/copies/${copyId}`, copyData);
  },

  // Delete a physical copy record
  deleteCopy: (copyId) => {
    return libraryAxios.delete(`/books/copies/${copyId}`);
  },

  // ==========================================
  // Circulation & Loans (Issue / Return / Renew)
  // ==========================================

  // Get all university book loans (supports status filters and overdueOnly)
  getAllLoans: (params = {}) => {
    return libraryAxios.get('/loans', { params });
  },

  // Get borrowing history and active loans for a specific student
  getStudentLoans: (studentId) => {
    return libraryAxios.get(`/loans/student/${studentId}`);
  },

  // Issue an available physical book copy to a student
  issueBook: (issueData) => {
    return libraryAxios.post('/loans/issue', issueData);
  },

  // Return a physical book copy and calculate overdue fees if applicable
  returnBook: (returnData) => {
    return libraryAxios.post('/loans/return', returnData);
  },

  // Renew an active book loan for additional days
  renewLoan: (loanId, days = 14) => {
    return libraryAxios.post(`/loans/${loanId}/renew`, null, { params: { days } });
  },

  // ==========================================
  // Reservations Queue (Hold Requests)
  // ==========================================

  // Retrieve reservation queue (for librarians)
  getAllReservations: (params = {}) => {
    return libraryAxios.get('/reservations', { params });
  },

  // Retrieve active and historical hold requests for a student
  getStudentReservations: (studentId) => {
    return libraryAxios.get(`/reservations/student/${studentId}`);
  },

  // Place a reservation hold on a book title
  createReservation: (reservationData) => {
    return libraryAxios.post('/reservations', reservationData);
  },

  // Cancel an existing reservation
  cancelReservation: (reservationId) => {
    return libraryAxios.post(`/reservations/${reservationId}/cancel`);
  },

  // Fulfill a reservation by allocating a copy
  fulfillReservation: (reservationId, copyId) => {
    return libraryAxios.post(`/reservations/${reservationId}/fulfill`, null, { params: { copyId } });
  },

  // ==========================================
  // Overdue Fines & Penalties
  // ==========================================

  // Audit all library fines across students
  getAllFines: (params = {}) => {
    return libraryAxios.get('/fines', { params });
  },

  // Retrieve unpaid or historical fines for a student
  getStudentFines: (studentId) => {
    return libraryAxios.get(`/fines/student/${studentId}`);
  },

  // Mark an overdue fine as settled / paid
  payFine: (fineId, paymentRef = 'ONLINE_SETTLED') => {
    return libraryAxios.post(`/fines/${fineId}/pay`, null, { params: { paymentRef } });
  },

  // Waive an overdue penalty (Librarian permission)
  waiveFine: (fineId, reason = 'Academic waiver granted') => {
    return libraryAxios.post(`/fines/${fineId}/waive`, null, { params: { reason } });
  },

  // ==========================================
  // Library Analytics & Dashboard Statistics
  // ==========================================
  getStats: () => {
    return libraryAxios.get('/stats');
  },
};

export default libraryService;
