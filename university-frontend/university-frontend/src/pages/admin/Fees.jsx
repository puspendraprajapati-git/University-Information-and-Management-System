import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminLinks } from '../../components/layout/Sidebar';
import { feeService } from '../../api/feeService';
import { getAllDepartments } from '../../services/departmentService';
import { getAllSemesters } from '../../services/semesterService';
import { getAllStudents } from '../../services/studentService';

const AdminFees = () => {
  const [activeTab, setActiveTab] = useState('structures'); // 'structures' | 'invoices'

  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);

  // Fee Structures State
  const [feeStructures, setFeeStructures] = useState([]);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({
    deptId: '',
    semesterId: '',
    feeType: 'Tuition Fee',
    amount: '',
    academicYear: '2026-2027',
  });

  // Student Invoices State
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    totalAmount: '',
    dueDate: '',
  });

  const [loading, setLoading] = useState(false);

  const loadInitialData = async () => {
    try {
      const [deptRes, semRes, stuRes] = await Promise.all([
        getAllDepartments(),
        getAllSemesters(),
        getAllStudents(),
      ]);
      setDepartments(deptRes.data || []);
      setSemesters(semRes.data || []);
      setStudents(stuRes.data || []);
    } catch (err) {
      toast.error('Failed to load academic records');
    }
  };

  const loadFeesAndInvoices = async () => {
    setLoading(true);
    try {
      const [feeRes, invRes] = await Promise.all([
        feeService.getAllFees(),
        feeService.getAllInvoices(),
      ]);
      setFeeStructures(feeRes.data || []);
      setInvoices(invRes.data || []);
    } catch (err) {
      toast.error('Failed to load fees or invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    loadFeesAndInvoices();
  }, []);

  const handleCreateFeeStructure = async (e) => {
    e.preventDefault();
    if (!feeForm.deptId || !feeForm.semesterId || !feeForm.amount) {
      toast.error('Please fill in department, semester and amount');
      return;
    }

    try {
      await feeService.createFee({
        deptId: Number(feeForm.deptId),
        semesterId: Number(feeForm.semesterId),
        feeType: feeForm.feeType,
        amount: Number(feeForm.amount),
        academicYear: feeForm.academicYear,
      });

      toast.success('Fee structure added successfully!');
      setShowFeeModal(false);
      setFeeForm({
        deptId: '',
        semesterId: '',
        feeType: 'Tuition Fee',
        amount: '',
        academicYear: '2026-2027',
      });
      loadFeesAndInvoices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create fee structure');
    }
  };

  const handleDeleteFeeStructure = async (id) => {
    if (!window.confirm('Delete this fee structure?')) return;
    try {
      await feeService.deleteFee(id);
      toast.success('Fee structure deleted');
      loadFeesAndInvoices();
    } catch (err) {
      toast.error('Failed to delete fee structure');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.studentId || !invoiceForm.totalAmount) {
      toast.error('Please select student and total amount');
      return;
    }

    try {
      await feeService.createInvoice({
        studentId: Number(invoiceForm.studentId),
        totalAmount: Number(invoiceForm.totalAmount),
        dueDate: invoiceForm.dueDate ? invoiceForm.dueDate + 'T23:59:00' : '2026-12-31T23:59:00',
      });

      toast.success('Invoice generated successfully for student!');
      setShowInvoiceModal(false);
      setInvoiceForm({ studentId: '', totalAmount: '', dueDate: '' });
      loadFeesAndInvoices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate invoice');
    }
  };

  const getDeptName = (id) => {
    const d = departments.find((dept) => String(dept.id || dept.deptId) === String(id));
    return d ? d.deptName : `Dept #${id}`;
  };

  const getSemName = (id) => {
    const s = semesters.find((sem) => String(sem.id || sem.semesterId) === String(id));
    return s ? s.semesterName : `Semester #${id}`;
  };

  const getStudentName = (id) => {
    const st = students.find((s) => String(s.studentId) === String(id));
    return st ? `${st.fullName} (${st.enrollmentNo || 'ID: ' + st.studentId})` : `Student #${id}`;
  };

  return (
    <DashboardLayout links={adminLinks}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h3 className="fw-bold mb-1">Fee & Accounts Management</h3>
            <p className="text-muted mb-0">Configure department fee structures, generate student invoices, and audit payments.</p>
          </div>
          <div className="d-flex gap-2">
            {activeTab === 'structures' ? (
              <button className="btn btn-primary" onClick={() => setShowFeeModal(true)}>
                + New Fee Structure
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}>
                + Generate Student Invoice
              </button>
            )}
          </div>
        </div>

        {/* Tab switch */}
        <ul className="nav nav-pills mb-4 gap-2">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'structures' ? 'active' : 'bg-white border text-dark'}`}
              onClick={() => setActiveTab('structures')}
            >
              Fee Structures ({feeStructures.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'invoices' ? 'active' : 'bg-white border text-dark'}`}
              onClick={() => setActiveTab('invoices')}
            >
              Student Invoices ({invoices.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Fee Structures Table */}
        {activeTab === 'structures' && (
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted">Loading fee structures...</div>
              ) : feeStructures.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <h5>No fee structures configured</h5>
                  <p className="mb-0">Click "+ New Fee Structure" to define course and semester fees.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Department</th>
                        <th>Semester</th>
                        <th>Fee Type</th>
                        <th>Academic Year</th>
                        <th>Amount</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeStructures.map((f) => (
                        <tr key={f.feeStructureId}>
                          <td className="fw-bold">{getDeptName(f.deptId)}</td>
                          <td>{getSemName(f.semesterId)}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{f.feeType}</span>
                          </td>
                          <td>{f.academicYear}</td>
                          <td className="fw-bold text-primary">₹{Number(f.amount).toLocaleString()}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteFeeStructure(f.feeStructureId)}
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
        )}

        {/* Tab 2: Student Invoices Table */}
        {activeTab === 'invoices' && (
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted">Loading invoices...</div>
              ) : invoices.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <h5>No student invoices generated yet</h5>
                  <p className="mb-0">Click "+ Generate Student Invoice" to bill enrolled students.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Invoice No</th>
                        <th>Student</th>
                        <th>Total Amount</th>
                        <th>Paid Amount</th>
                        <th>Balance Due</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.invoiceId}>
                          <td>
                            <strong>#INV-{inv.invoiceId}</strong>
                          </td>
                          <td className="fw-bold">{getStudentName(inv.studentId)}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: New Fee Structure */}
        {showFeeModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <form onSubmit={handleCreateFeeStructure}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Create Fee Structure</h5>
                    <button type="button" className="btn-close" onClick={() => setShowFeeModal(false)} />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Department *</label>
                      <select
                        className="form-select"
                        value={feeForm.deptId}
                        onChange={(e) => setFeeForm({ ...feeForm, deptId: e.target.value })}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d.id || d.deptId} value={d.id || d.deptId}>
                            {d.deptName} ({d.deptCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Semester *</label>
                      <select
                        className="form-select"
                        value={feeForm.semesterId}
                        onChange={(e) => setFeeForm({ ...feeForm, semesterId: e.target.value })}
                        required
                      >
                        <option value="">Select Semester</option>
                        {semesters.map((s) => (
                          <option key={s.id || s.semesterId} value={s.id || s.semesterId}>
                            {s.semesterName} ({s.year})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Fee Type</label>
                      <select
                        className="form-select"
                        value={feeForm.feeType}
                        onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                      >
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Lab & Practical Fee">Lab & Practical Fee</option>
                        <option value="Library Fee">Library Fee</option>
                        <option value="Examination Fee">Examination Fee</option>
                        <option value="Hostel & Mess Fee">Hostel & Mess Fee</option>
                      </select>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-md-7">
                        <label className="form-label small fw-semibold">Fee Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="e.g. 35000"
                          value={feeForm.amount}
                          onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label small fw-semibold">Academic Year</label>
                        <input
                          type="text"
                          className="form-control"
                          value={feeForm.academicYear}
                          onChange={(e) => setFeeForm({ ...feeForm, academicYear: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowFeeModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Fee Structure
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Generate Student Invoice */}
        {showInvoiceModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <form onSubmit={handleCreateInvoice}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Generate Student Invoice</h5>
                    <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)} />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Select Student *</label>
                      <select
                        className="form-select"
                        value={invoiceForm.studentId}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                        required
                      >
                        <option value="">Select Student</option>
                        {students.map((st) => (
                          <option key={st.studentId} value={st.studentId}>
                            {st.fullName} - {st.enrollmentNo || 'ID: ' + st.studentId}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Total Bill Amount (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 35000"
                        value={invoiceForm.totalAmount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })}
                        min="0"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={invoiceForm.dueDate}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Issue Invoice
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

export default AdminFees;
