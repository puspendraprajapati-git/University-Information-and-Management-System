import React from 'react';
import { motion } from 'framer-motion';
import { FaFilePdf, FaFileExcel, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Reports = () => {
  const handleDownload = (reportName) => {
    toast.success(`${reportName} download started...`);
  };

  const reportsList = [
    { title: 'Student Master List', description: 'Complete export of all enrolled students with department mapping.', type: 'excel' },
    { title: 'Faculty Directory', description: 'List of all teaching staff, roles, and assigned subjects.', type: 'pdf' },
    { title: 'Semester Attendance Report', description: 'Aggregated attendance data for the current active semester.', type: 'excel' },
    { title: 'University Results Summary', description: 'Overall academic performance and pass/fail ratios.', type: 'pdf' },
    { title: 'Department Metrics', description: 'Student-to-faculty ratios and department growth analytics.', type: 'excel' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h2 className="fw-bold text-body mb-1">Reports Engine</h2>
        <p className="text-body-secondary">Generate and export official university documents and analytics.</p>
      </div>

      <div className="row g-4">
        {reportsList.map((report, idx) => (
          <div className="col-12 col-md-6 col-lg-4" key={idx}>
            <div className="premium-card p-4 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className={`p-2 rounded bg-opacity-10 ${report.type === 'pdf' ? 'bg-danger text-danger' : 'bg-success text-success'}`}>
                  {report.type === 'pdf' ? <FaFilePdf className="fs-3" /> : <FaFileExcel className="fs-3" />}
                </div>
                <span className={`badge ${report.type === 'pdf' ? 'bg-danger' : 'bg-success'} text-uppercase`}>
                  {report.type}
                </span>
              </div>
              
              <h5 className="fw-bold mb-2">{report.title}</h5>
              <p className="text-body-secondary small mb-4 flex-grow-1">{report.description}</p>
              
              <button 
                onClick={() => handleDownload(report.title)}
                className="btn btn-outline-primary w-100 d-flex justify-content-center align-items-center"
              >
                <FaDownload className="me-2" /> Generate Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Reports;
