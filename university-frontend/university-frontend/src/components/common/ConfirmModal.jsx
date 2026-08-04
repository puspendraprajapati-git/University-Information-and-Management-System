import React from "react";

const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">

          {}
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>

            {}
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>

          {}
          <div className="modal-body">
            <p>{message}</p>
          </div>

          {}
          <div className="modal-footer">

            {}
            <button
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>

            {}
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
