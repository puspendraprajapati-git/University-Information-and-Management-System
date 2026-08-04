import React, { useState, useEffect } from "react";
import { feeService } from "../../api/feeService";
import { toast } from "react-toastify";

import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Badge,
  Spinner,
  Form,
  Modal,
} from "react-bootstrap";

const AdminFees = () => {

  const [fees, setFees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    semesterId: "",
    feeType: "TUITION",
    totalAmount: "",
    dueDate: "",
  });

  useEffect(() => {
    fetchFees();
  }, []);

  // Fetch latest data from server
  const fetchFees = async () => {
    try {
      setLoading(true);

      const res = await feeService.getAllFees();

      setFees(res.data);

    } catch (err) {
      toast.error("Failed to load fees");
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  // Handle create action
  const handleCreate = async (e) => {
    e.preventDefault();

    try {

      const payload = {
        ...formData,
        studentId: parseInt(formData.studentId),
        semesterId: parseInt(formData.semesterId),
        totalAmount: parseFloat(formData.totalAmount),
      };

      await feeService.createFee(payload);

      toast.success("Fee created successfully!");

      setShowModal(false);
      fetchFees();

    } catch (err) {
      toast.error("Failed to create fee");
      console.error(err);
    }
  };

  // Fetch latest data from server
  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return "success";

      case "PARTIAL":
        return "warning";

      case "PENDING":
        return "secondary";

      case "OVERDUE":
        return "danger";

      default:
        return "primary";
    }
  };

  return (
    <Container fluid className="mt-4">

      {}
      <Row className="mb-4">

        <Col className="d-flex justify-content-between align-items-center">

          <h2>
            Fee Management
          </h2>

          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
          >
            Add New Fee
          </Button>

        </Col>

      </Row>

      {}
      {loading ? (

        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>

      ) : (

        <div className="table-responsive shadow-sm rounded">

          <Table
            striped
            hover
            className="mb-0 bg-white"
          >

            <thead className="table-dark">

              <tr>
                <th>ID</th>
                <th>Student ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {fees.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4"
                  >
                    No fees found
                  </td>
                </tr>

              ) : (

                fees.map((fee) => (

                  <tr key={fee.feeId}>

                    <td>
                      #{fee.feeId}
                    </td>

                    <td>
                      {fee.studentId}
                    </td>

                    <td>
                      {fee.feeType}
                    </td>

                    <td>
                      ${fee.totalAmount.toFixed(2)}
                    </td>

                    <td>
                      ${fee.paidAmount.toFixed(2)}
                    </td>

                    <td>
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>

                    <td>
                      <Badge bg={getStatusBadge(fee.status)}>
                        {fee.status}
                      </Badge>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </Table>

        </div>

      )}

      {}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
      >

        <Modal.Header closeButton>

          <Modal.Title>
            Assign New Fee
          </Modal.Title>

        </Modal.Header>

        <Form onSubmit={handleCreate}>

          <Modal.Body>

            {}
            <Form.Group className="mb-3">

              <Form.Label>
                Student ID
              </Form.Label>

              <Form.Control
                type="number"
                required
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    studentId: e.target.value,
                  })
                }
              />

            </Form.Group>

            {}
            <Form.Group className="mb-3">

              <Form.Label>
                Semester ID
              </Form.Label>

              <Form.Control
                type="number"
                required
                value={formData.semesterId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    semesterId: e.target.value,
                  })
                }
              />

            </Form.Group>

            {}
            <Form.Group className="mb-3">

              <Form.Label>
                Fee Type
              </Form.Label>

              <Form.Select
                value={formData.feeType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    feeType: e.target.value,
                  })
                }
              >

                <option value="TUITION">
                  Tuition
                </option>

                <option value="EXAM">
                  Exam
                </option>

                <option value="LIBRARY">
                  Library
                </option>

                <option value="HOSTEL">
                  Hostel
                </option>

                <option value="OTHER">
                  Other
                </option>

              </Form.Select>

            </Form.Group>

            {}
            <Form.Group className="mb-3">

              <Form.Label>
                Total Amount ($)
              </Form.Label>

              <Form.Control
                type="number"
                step="0.01"
                required
                value={formData.totalAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalAmount: e.target.value,
                  })
                }
              />

            </Form.Group>

            {}
            <Form.Group className="mb-3">

              <Form.Label>
                Due Date
              </Form.Label>

              <Form.Control
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dueDate: e.target.value,
                  })
                }
              />

            </Form.Group>

          </Modal.Body>

          <Modal.Footer>

            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
            >
              Create
            </Button>

          </Modal.Footer>

        </Form>

      </Modal>

    </Container>
  );
};

export default AdminFees;
