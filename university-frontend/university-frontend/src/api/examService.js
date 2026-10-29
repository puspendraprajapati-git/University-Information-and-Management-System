import axios from 'axios';

const examAxios = axios.create({
  baseURL: process.env.REACT_APP_EXAM_URL || '/exams',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const roomAxios = axios.create({
  baseURL: process.env.REACT_APP_EXAM_ROOM_URL || '/exam-rooms',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const timetableAxios = axios.create({
  baseURL: process.env.REACT_APP_TIMETABLE_URL || '/timetable',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const attachToken = (config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

examAxios.interceptors.request.use(attachToken);
roomAxios.interceptors.request.use(attachToken);
timetableAxios.interceptors.request.use(attachToken);

export const examService = {
  // Exams
  getAllExams: (semesterId = null) =>
    examAxios.get(semesterId ? `?semesterId=${semesterId}` : ''),
  getExamById: (id) => examAxios.get(`/${id}`),
  createExam: (data) => examAxios.post('', data),
  scheduleExam: (scheduleData) => examAxios.post('/schedule', scheduleData),
  registerStudent: (examId, studentId) => examAxios.post(`/${examId}/register/${studentId}`),
  getStudentHallTicket: (studentId) => examAxios.get(`/hall-ticket/${studentId}`),

  // Rooms
  getAllRooms: () => roomAxios.get(''),
  getRoomById: (id) => roomAxios.get(`/${id}`),
  createRoom: (data) => roomAxios.post('', data),
  deleteRoom: (id) => roomAxios.delete(`/${id}`),

  // Timetable
  getAllTimetableSlots: () => timetableAxios.get(''),
  getTimetableBySemester: (semesterId) => timetableAxios.get(`/semester/${semesterId}`),
  getTimetableByFaculty: (facultyId) => timetableAxios.get(`/faculty/${facultyId}`),
  createTimetableSlot: (data) => timetableAxios.post('/slot', data),
  deleteTimetableSlot: (id) => timetableAxios.delete(`/slot/${id}`),
};

export default examService;
