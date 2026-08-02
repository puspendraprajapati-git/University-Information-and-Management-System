import axiosInstance from '../api/axiosInstance';

export const getAllAttendance = () => axiosInstance.get('/attendance');
export const getAttendanceByStudent = (studentId) => axiosInstance.get(`/attendance/student/${studentId}`);
export const getAttendanceBySubjectAndSemester = (subjectId, semesterId) =>
  axiosInstance.get(`/attendance/subject/${subjectId}/semester/${semesterId}`);
export const markAttendance = (data) => axiosInstance.post('/attendance', data);
export const updateAttendance = (id, data) => axiosInstance.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => axiosInstance.delete(`/attendance/${id}`);