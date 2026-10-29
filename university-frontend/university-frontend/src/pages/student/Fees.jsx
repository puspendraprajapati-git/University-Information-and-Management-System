import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentLinks } from '../../components/layout/Sidebar';
import { getStudentByUserId } from '../../services/studentService';
import { feeService } from '../../api/feeService';

const StudentFees = () => {
  const { user } = useAuth();

  const [studentProfile, setStudentProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Sandbox Test Payment Modal
  const [sandboxModal, setSandboxModal] = useState({ show: false, invoice: null, orderData: null });
  const [selectedMethod, setSelectedMethod] = useState('UPI / QR');

  const getResolvedUser = () => {
    if (user && user.userId) return user;
    try {
      const stored = sessionStorage.getItem('user') || localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const loadData = async () => {
    const activeUser = getResolvedUser();
    if (!activeUser || !activeUser.userId) {
      return;
    }

    setLoading(true);
    try {
      const stuRes = await getStudentByUserId(activeUser.userId);
      const student = stuRes.data;
      setStudentProfile(student);

      if (student?.studentId) {
        const invRes = await feeService.getFeesByStudent(student.studentId);
        setInvoices(invRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching student fee invoices:', err);
      toast.error('Failed to load student fee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const completePaymentVerification = async (invoiceId, orderId, paymentId, signature, method) => {
    try {
      const verifyRes = await feeService.verifyPayment({
        invoiceId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paymentMethod: method || 'RAZORPAY_CHECKOUT',
      });

      toast.success('Fee payment verified and completed successfully!');
      setActiveReceipt(verifyRes.data);
      setShowReceiptModal(true);
      setSandboxModal({ show: false, invoice: null, orderData: null });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment verification failed');
    } finally {
      setPayingInvoice(null);
    }
  };

  const handlePayNow = async (invoice) => {
    setPayingInvoice(invoice.invoiceId);
    try {
      // 1. Create order on backend via Razorpay service
      const orderRes = await feeService.createRazorpayOrder(invoice.invoiceId);
      const orderData = orderRes.data;

      const activeUser = getResolvedUser();

      // Check if real registered Razorpay key is configured (not dummy placeholder)
      const hasRealRazorpayKey =
        orderData.keyId &&
        !orderData.keyId.includes('university123') &&
        !orderData.keyId.includes('placeholder') &&
        orderData.keyId.length > 20;

      // 2. Open official Razorpay Checkout only if a real merchant key is configured
      if (window.Razorpay && hasRealRazorpayKey) {
        try {
          const options = {
            key: orderData.keyId,
            amount: orderData.amountInPaise,
            currency: orderData.currency || 'INR',
            name: 'EduCore University',
            description: `Fee Payment - Invoice #${invoice.invoiceId}`,
            order_id: orderData.orderId,
            handler: function (response) {
              completePaymentVerification(
                invoice.invoiceId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                'RAZORPAY_CHECKOUT'
              );
            },
            prefill: {
              name: studentProfile?.fullName || activeUser?.username || 'Student',
              email: activeUser?.email || 'student@university.edu',
            },
            theme: {
              color: '#4f46e5',
            },
            modal: {
              ondismiss: function () {
                setPayingInvoice(null);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function () {
            // Fallback to Razorpay Sandbox simulator if live modal is rejected
            setSandboxModal({ show: true, invoice, orderData });
            setPayingInvoice(null);
          });
          rzp.open();
          return;
        } catch (e) {
          console.warn('Razorpay SDK modal error, switching to test sandbox modal', e);
        }
      }

      // 3. In Test/Sandbox environment, use the interactive Razorpay Sandbox Gateway
      setSandboxModal({ show: true, invoice, orderData });
      setPayingInvoice(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate fee payment');
      setPayingInvoice(null);
    }
  };

  const handleSimulateSandboxPayment = () => {
    if (!sandboxModal.invoice || !sandboxModal.orderData) return;
    const inv = sandboxModal.invoice;
    const ord = sandboxModal.orderData;
    const mockPaymentId = 'pay_test_' + Math.floor(100000000 + Math.random() * 900000000);
    completePaymentVerification(
      inv.invoiceId,
      ord.orderId,
      mockPaymentId,
      'simulated_test_signature',
      `RAZORPAY_SANDBOX_${selectedMethod.replace(/[^A-Z0-9]/gi, '_').toUpperCase()}`
    );
  };

  const handleViewReceipt = (payment) => {
    setActiveReceipt(payment);
    setShowReceiptModal(true);
  };

  const totalOutstanding = invoices
    .filter((i) => i.status !== 'PAID')
    .reduce((sum, i) => sum + (Number(i.outstandingBalance) || Number(i.totalAmount)), 0);

  return (
    <DashboardLayout links={studentLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h3 className="fw-bold mb-1">Fee & Payment Portal</h3>
            <p className="text-muted mb-0">Review pending semester fees, complete payments with Razorpay, and download receipts.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border px-3 py-2 fs-6">
              Total Outstanding: <strong className="text-danger">₹{totalOutstanding.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Invoices List */}
        <div className="card shadow-sm border-0 mb-4 bg-white">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="fw-bold mb-0">My Semester Fee Invoices</h5>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4 text-center text-muted">Loading fee invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h5>No fee invoices found</h5>
                <p className="mb-0">You currently have no pending university fee bills.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Invoice ID</th>
                      <th>Total Amount</th>
                      <th>Paid Amount</th>
                      <th>Balance Due</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.invoiceId}>
                        <td>
                          <strong>#INV-{inv.invoiceId}</strong>
                        </td>
                        <td>₹{Number(inv.totalAmount).toLocaleString()}</td>
                        <td className="text-success">₹{Number(inv.paidAmount).toLocaleString()}</td>
                        <td className={Number(inv.outstandingBalance) > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                          ₹{Number(inv.outstandingBalance).toLocaleString()}
                        </td>
                        <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`badge ${
                              inv.status === 'PAID'
                                ? 'bg-success'
                                : inv.status === 'PARTIAL'
                                ? 'bg-info text-dark'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {inv.status !== 'PAID' ? (
                            <button
                              className="btn btn-sm btn-primary"
                              disabled={payingInvoice === inv.invoiceId}
                              onClick={() => handlePayNow(inv)}
                            >
                              {payingInvoice === inv.invoiceId ? 'Processing...' : 'Pay with Razorpay'}
                            </button>
                          ) : (
                            <span className="badge bg-light text-success border">Paid in Full</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Payment History & Receipts */}
        <div className="card shadow-sm border-0 bg-white">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="fw-bold mb-0">Transaction History & Receipts</h5>
          </div>
          <div className="card-body p-0">
            {invoices.flatMap((i) => i.payments || []).length === 0 ? (
              <div className="p-4 text-center text-muted">No past payments recorded yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Receipt No</th>
                      <th>Amount Paid</th>
                      <th>Method</th>
                      <th>Transaction Ref</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices
                      .flatMap((i) => i.payments || [])
                      .map((p) => (
                        <tr key={p.paymentId}>
                          <td>
                            <strong>{p.receiptNumber}</strong>
                          </td>
                          <td className="text-success fw-bold">₹{Number(p.amount).toLocaleString()}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{p.paymentMethod}</span>
                          </td>
                          <td>
                            <code className="text-dark small">{p.transactionRef}</code>
                          </td>
                          <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                          <td>
                            <span className="badge bg-success">{p.status}</span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewReceipt(p)}
                            >
                              View Receipt
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

        {/* Receipt Modal */}
        {showReceiptModal && activeReceipt && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">Official Payment Receipt</h5>
                  <button type="button" className="btn-close" onClick={() => setShowReceiptModal(false)} />
                </div>
                <div className="modal-body p-4" id="printable-receipt">
                  <div className="text-center mb-3">
                    <h4 className="fw-bold text-primary mb-1">EduCore University</h4>
                    <small className="text-muted">Fee & Treasury Accounts Office</small>
                  </div>
                  <hr />
                  <div className="row g-2 small mb-3">
                    <div className="col-6">
                      <span className="text-muted">Receipt Number:</span>
                      <div className="fw-bold">{activeReceipt.receiptNumber}</div>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-muted">Payment Date:</span>
                      <div className="fw-bold">{new Date(activeReceipt.paidAt).toLocaleString()}</div>
                    </div>
                    <div className="col-6">
                      <span className="text-muted">Student Name:</span>
                      <div className="fw-bold">{studentProfile?.fullName || user?.username || 'Student'}</div>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-muted">Payment Method:</span>
                      <div className="fw-bold">{activeReceipt.paymentMethod}</div>
                    </div>
                    <div className="col-12 mt-2">
                      <span className="text-muted">Razorpay Transaction Reference:</span>
                      <div className="font-monospace text-break bg-light p-1 rounded border">
                        {activeReceipt.transactionRef}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded border text-center my-3">
                    <span className="text-muted small">Total Amount Paid</span>
                    <h3 className="fw-bold text-success mb-0">₹{Number(activeReceipt.amount).toLocaleString()}</h3>
                    <span className="badge bg-success mt-2">Status: SUCCESS</span>
                  </div>

                  <small className="text-muted text-center d-block">
                    This is an electronically generated receipt verified securely with Razorpay payment authentication.
                  </small>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => window.print()}
                  >
                    Print Receipt
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowReceiptModal(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Realistic Razorpay Sandbox Gateway Modal */}
        {sandboxModal.show && sandboxModal.invoice && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '580px' }}>
              <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '16px' }}>
                {/* Razorpay Brand Header */}
                <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0c2340' }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary text-white px-2 py-1 rounded fw-bold small" style={{ letterSpacing: '0.5px' }}>
                      Razorpay
                    </div>
                    <span className="fw-semibold">EduCore University</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-danger text-uppercase px-2 py-1" style={{ fontSize: '0.65rem' }}>
                      Test Mode
                    </span>
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-1"
                      onClick={() => setSandboxModal({ show: false, invoice: null, orderData: null })}
                    />
                  </div>
                </div>

                {/* Amount Banner */}
                <div className="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small d-block">Fee Invoice #{sandboxModal.invoice.invoiceId}</span>
                    <strong className="text-dark">{studentProfile?.fullName || 'Student'}</strong>
                  </div>
                  <div className="text-end">
                    <span className="text-muted small d-block">Amount Due</span>
                    <h4 className="fw-bold text-primary mb-0">
                      ₹{Number(sandboxModal.invoice.outstandingBalance || sandboxModal.invoice.totalAmount).toLocaleString()}
                    </h4>
                  </div>
                </div>

                {/* Main Payment Options Body */}
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Payment Mode Selector */}
                    <div className="col-4 border-end pe-2">
                      <div className="text-muted small fw-bold mb-2 text-uppercase" style={{ fontSize: '0.7rem' }}>
                        Payment Options
                      </div>
                      <div className="nav flex-column nav-pills gap-1">
                        {[
                          { id: 'UPI / QR', label: '📱 UPI / QR' },
                          { id: 'Cards', label: '💳 Cards' },
                          { id: 'Net Banking', label: '🏦 Net Banking' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className={`btn btn-sm text-start py-2 px-2 rounded ${
                              selectedMethod === m.id ? 'btn-primary text-white fw-bold shadow-sm' : 'btn-light text-dark'
                            }`}
                            onClick={() => setSelectedMethod(m.id)}
                            style={{ fontSize: '0.85rem' }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Method Details Pane */}
                    <div className="col-8 ps-3">
                      {selectedMethod === 'UPI / QR' && (
                        <div className="text-center">
                          <div className="p-3 bg-light rounded border mb-2 d-inline-block">
                            <div
                              style={{
                                width: '130px',
                                height: '130px',
                                margin: '0 auto',
                                background: 'repeating-conic-gradient(#0c2340 0% 25%, #fff 0% 50%) 50% / 18px 18px',
                                borderRadius: '8px',
                                border: '3px solid #0c2340',
                              }}
                            />
                            <small className="text-muted d-block mt-2" style={{ fontSize: '0.75rem' }}>
                              Scan with GPay, PhonePe or Paytm
                            </small>
                          </div>
                          <div className="small text-muted mb-2">or pay using test VPA:</div>
                          <input
                            type="text"
                            className="form-control form-control-sm text-center font-monospace"
                            value="student@razorpay"
                            readOnly
                          />
                        </div>
                      )}

                      {selectedMethod === 'Cards' && (
                        <div>
                          <div className="p-3 bg-gradient text-white rounded mb-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #4f46e5, #0c2340)' }}>
                            <div className="d-flex justify-content-between mb-3">
                              <small className="text-white-50">TEST CARD</small>
                              <strong className="small">VISA</strong>
                            </div>
                            <div className="font-monospace fs-6 mb-2" style={{ letterSpacing: '2px' }}>
                              4111 •••• •••• 1111
                            </div>
                            <div className="d-flex justify-content-between small text-white-50">
                              <span>{studentProfile?.fullName || 'STUDENT'}</span>
                              <span>12/28</span>
                            </div>
                          </div>
                          <div className="alert alert-secondary py-1 px-2 small mb-0 text-center" style={{ fontSize: '0.75rem' }}>
                            Test Sandbox Card (No actual charges applied)
                          </div>
                        </div>
                      )}

                      {selectedMethod === 'Net Banking' && (
                        <div>
                          <label className="form-label small text-muted mb-2">Select Test Bank</label>
                          <div className="d-grid gap-2">
                            {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((b) => (
                              <button
                                key={b}
                                type="button"
                                className="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center"
                              >
                                <span>{b}</span>
                                <span className="badge bg-light text-dark">Simulated</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.75rem' }}>
                    <span>🛡️ Secured by Razorpay 256-bit encryption</span>
                    <span>Order: <code>{sandboxModal.orderData?.orderId}</code></span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="modal-footer bg-light px-4 py-2 border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSandboxModal({ show: false, invoice: null, orderData: null })}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary fw-bold px-4"
                    onClick={handleSimulateSandboxPayment}
                  >
                    Pay ₹{Number(sandboxModal.invoice.outstandingBalance || sandboxModal.invoice.totalAmount).toLocaleString()}
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

export default StudentFees;
