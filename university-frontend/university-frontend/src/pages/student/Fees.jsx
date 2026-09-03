import React, { useState, useEffect } from 'react';
import { feeService } from '../../api/feeService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Container, Row, Col, Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { getStudentByUserId } from '../../services/studentService';

const StudentFees = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (user && user.userId) {
      fetchFees();
    }
  }, [user]);

  // Fetch latest data from server
  const fetchFees = async () => {
    try {
      setLoading(true);
      const profileRes = await getStudentByUserId(user.userId);
      if (!profileRes.data) {
        setLoading(false);
        return;
      }
      const studentId = profileRes.data.studentId;
      const res = await feeService.getFeesByStudent(studentId);
      setFees(res.data);
    } catch (err) {
      toast.error('Failed to load your fees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle pay click action
  const handlePayClick = (fee) => {
    setSelectedFee(fee);
    setPaymentAmount((fee.totalAmount - fee.paidAmount).toFixed(2));
    setShowPaymentModal(true);
  };

  // Execute submit payment function
  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      setPaymentProcessing(true);
      await feeService.processPayment({
        feeId: selectedFee.feeId,
        amountPaid: parseFloat(paymentAmount),
        paymentMethod: paymentMethod
      });
      toast.success('Payment successful!');
      setShowPaymentModal(false);
      fetchFees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      console.error(err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Fetch latest data from server
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIAL': return 'warning';
      case 'PENDING': return 'secondary';
      case 'OVERDUE': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>My Financials</h2>
          <p className="text-muted">Track your fee status and make payments securely.</p>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" /></div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <Table striped hover className="mb-0 bg-white">
            <thead className="table-dark">
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">No pending fees found</td></tr>
              ) : (
                fees.map(fee => {
                  const balance = fee.totalAmount - fee.paidAmount;
                  return (
                    <tr key={fee.feeId}>
                      <td>{fee.feeType}</td>
                      <td>${fee.totalAmount.toFixed(2)}</td>
                      <td>${fee.paidAmount.toFixed(2)}</td>
                      <td className="fw-bold">${balance.toFixed(2)}</td>
                      <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={getStatusBadge(fee.status)}>{fee.status}</Badge>
                      </td>
                      <td>
                        <Button 
                          variant="success" 
                          size="sm" 
                          disabled={fee.status === 'PAID'}
                          onClick={() => handlePayClick(fee)}
                        >
                          {fee.status === 'PAID' ? 'Settled' : 'Pay Now'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      )}

      {}
      <Modal show={showPaymentModal} onHide={() => !paymentProcessing && setShowPaymentModal(false)}>
        <Modal.Header closeButton={!paymentProcessing}>
          <Modal.Title>Make a Payment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitPayment}>
          <Modal.Body>
            {selectedFee && (
              <div className="mb-3">
                <p><strong>Fee Type:</strong> {selectedFee.feeType}</p>
                <p><strong>Remaining Balance:</strong> ${(selectedFee.totalAmount - selectedFee.paidAmount).toFixed(2)}</p>
              </div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Payment Amount ($)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01" 
                required 
                max={selectedFee ? (selectedFee.totalAmount - selectedFee.paidAmount).toFixed(2) : 0}
                value={paymentAmount} 
                onChange={e => setPaymentAmount(e.target.value)} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash (In-person)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)} disabled={paymentProcessing}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={paymentProcessing}>
              {paymentProcessing ? <Spinner size="sm" /> : 'Confirm Payment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default StudentFees;
