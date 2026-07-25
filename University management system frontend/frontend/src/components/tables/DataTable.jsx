import React, { useState } from 'react';
import { FaSearch, FaEllipsisV, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const DataTable = ({ 
  columns, 
  data, 
  onView, 
  onEdit, 
  onDelete, 
  searchPlaceholder = 'Search...' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search filtering
  const filteredData = data.filter((item) => {
    return Object.values(item).some((val) => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="premium-card p-0 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-body-tertiary">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text bg-body border-end-0">
            <FaSearch className="text-body-secondary" />
          </span>
          <input 
            type="text" 
            className="form-control bg-body border-start-0" 
            placeholder={searchPlaceholder} 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            style={{ boxShadow: 'none' }}
          />
        </div>
        <div>
          <button className="btn btn-outline-secondary btn-sm me-2">Export CSV</button>
          <button className="btn btn-primary btn-sm">+ Add New</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-body-tertiary text-body-secondary" style={{ fontSize: '0.85rem' }}>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="text-uppercase fw-semibold py-3 border-bottom bg-transparent">
                  {col.header}
                </th>
              ))}
              {(onView || onEdit || onDelete) && <th className="text-end py-3 border-bottom bg-transparent">Actions</th>}
            </tr>
          </thead>
          <tbody style={{ borderTop: 'none' }}>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="py-3">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="text-end py-3">
                      <div className="dropdown">
                        <button className="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown">
                          <FaEllipsisV className="text-muted" />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-2">
                          {onView && (
                            <li>
                              <button className="dropdown-item d-flex align-items-center" onClick={() => onView(row)}>
                                <FaEye className="me-2 text-primary" /> View Details
                              </button>
                            </li>
                          )}
                          {onEdit && (
                            <li>
                              <button className="dropdown-item d-flex align-items-center" onClick={() => onEdit(row)}>
                                <FaEdit className="me-2 text-warning" /> Edit
                              </button>
                            </li>
                          )}
                          {onDelete && (
                            <li>
                              <button className="dropdown-item d-flex align-items-center text-danger" onClick={() => onDelete(row)}>
                                <FaTrash className="me-2" /> Delete
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-4 text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-body-tertiary">
          <small className="text-body-secondary">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </small>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default DataTable;
