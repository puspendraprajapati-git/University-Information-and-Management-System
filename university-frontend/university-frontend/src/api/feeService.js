import axios from 'axios';

const feeAxios = axios.create({
  baseURL: process.env.REACT_APP_FEE_URL || '/fee',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const paymentAxios = axios.create({
  baseURL: process.env.REACT_APP_PAYMENT_URL || '/payment',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const attachToken = (config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

feeAxios.interceptors.request.use(attachToken);
paymentAxios.interceptors.request.use(attachToken);

export const feeService = {
  // Fee Structures
  getAllFees: () => feeAxios.get(''),
  getFeeById: (id) => feeAxios.get(`/${id}`),
  createFee: (feeData) => feeAxios.post('', feeData),
  deleteFee: (id) => feeAxios.delete(`/${id}`),

  // Student Invoices
  getAllInvoices: () => feeAxios.get('/invoices'),
  createInvoice: (invoiceData) => feeAxios.post('/invoices', invoiceData),
  getFeesByStudent: (studentId) => feeAxios.get(`/student/${studentId}`),
  getInvoiceById: (id) => feeAxios.get(`/invoices/${id}`),

  // Razorpay Payments
  createRazorpayOrder: (invoiceId, customAmount = null) =>
    paymentAxios.post('/create-order', { invoiceId, customAmount }),

  verifyPayment: (paymentDetails) =>
    paymentAxios.post('/verify-payment', paymentDetails),

  processPayment: (paymentData) =>
    paymentAxios.post('', paymentData),

  getPaymentById: (id) => paymentAxios.get(`/${id}`),
  getReceipt: (paymentId) => paymentAxios.get(`/receipt/${paymentId}`),
  getPaymentsByStudent: (studentId) => paymentAxios.get(`/student/${studentId}`),
};

export default feeService;
