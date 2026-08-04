import axiosInstance from '../api/axiosInstance';


// Fetch all attendance records
export const getAllAttendance = () => axiosInstance.get('/attendance');

// Fetch a specific attendancebystudent by ID
export const getAttendanceByStudent = (studentId) => axiosInstance.get(`/attendance/student/${studentId}`);

// Fetch a specific attendancebysubjectandsemester by ID
export const getAttendanceBySubjectAndSemester = (subjectId, semesterId) =>
  axiosInstance.get(`/attendance/subject/${subjectId}/semester/${semesterId}`);
export const markAttendance = (data) => axiosInstance.post('/attendance', data);

// Update an existing attendance record
export const updateAttendance = (id, data) => axiosInstance.put(`/attendance/${id}`, data);

// Delete a attendance record
export const deleteAttendance = (id) => axiosInstance.delete(`/attendance/${id}`);
