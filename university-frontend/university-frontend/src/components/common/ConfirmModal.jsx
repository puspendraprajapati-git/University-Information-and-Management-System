import React from "react";

// Reusable confirmation modal for delete or other confirmation actions
const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  // Don't render the modal if 'show' is false
  if (!show) return null;

  return (
    // Dark background overlay behind the modal
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">

          {/* Modal Header */}
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>

            {/* Close button */}
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            <p>{message}</p>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">

            {/* Cancel button */}
            <button
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>

            {/* Confirm action button */}
            <button
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Delete
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;