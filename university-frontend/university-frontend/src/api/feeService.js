import axiosInstance from './axiosInstance';

const FEE_API = '/fee';
const PAYMENT_API = '/payment';

export const feeService = {
  // Admin Fee APIs
  getAllFees: () => axiosInstance.get(FEE_API),
  getFeeById: (id) => axiosInstance.get(`${FEE_API}/${id}`),
  createFee: (feeData) => axiosInstance.post(FEE_API, feeData),
  updateFee: (id, feeData) => axiosInstance.put(`${FEE_API}/${id}`, feeData),
  deleteFee: (id) => axiosInstance.delete(`${FEE_API}/${id}`),

  // Student Fee APIs
  getFeesByStudent: (studentId) => axiosInstance.get(`${FEE_API}/student/${studentId}`),

  // Payment APIs
  processPayment: (paymentData) => axiosInstance.post(PAYMENT_API, paymentData),
  getPaymentById: (id) => axiosInstance.get(`${PAYMENT_API}/${id}`),
  getAllPayments: () => axiosInstance.get(PAYMENT_API),
  getPaymentsByStudent: (studentId) => axiosInstance.get(`${PAYMENT_API}/student/${studentId}`),
  getPaymentsByFee: (feeId) => axiosInstance.get(`${PAYMENT_API}/fee/${feeId}`),
};
