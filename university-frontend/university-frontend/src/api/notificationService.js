import axios from 'axios';

const notifAxios = axios.create({
  baseURL: process.env.REACT_APP_NOTIFICATION_URL || '/notifications',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const announceAxios = axios.create({
  baseURL: process.env.REACT_APP_ANNOUNCEMENT_URL || '/announcements',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const prefAxios = axios.create({
  baseURL: process.env.REACT_APP_PREFERENCE_URL || '/notification-preferences',
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

notifAxios.interceptors.request.use(attachToken);
announceAxios.interceptors.request.use(attachToken);
prefAxios.interceptors.request.use(attachToken);

export const notificationService = {
  // Notifications
  getMyNotifications: (limit = 20, offset = 0, unreadOnly = false) =>
    notifAxios.get(`?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}`),

  getUnreadCount: () => notifAxios.get('/unread-count'),

  markAsRead: (notificationId) => notifAxios.patch(`/${notificationId}/read`),

  markAllAsRead: () => notifAxios.patch('/mark-all-read'),

  sendNotification: (data) => notifAxios.post('/send', data),

  // Manual cron triggers
  triggerAttendanceCheck: () => notifAxios.post('/trigger/attendance-check'),
  triggerAssignmentReminders: () => notifAxios.post('/trigger/assignment-reminders'),
  triggerFeeReminders: () => notifAxios.post('/trigger/fee-reminders'),

  // Announcements
  getAnnouncements: () => announceAxios.get(''),
  getAllAnnouncements: () => announceAxios.get('/all'),
  createAnnouncement: (data) => announceAxios.post('', data),
  deleteAnnouncement: (id) => announceAxios.delete(`/${id}`),

  // Preferences
  getMyPreferences: () => prefAxios.get(''),
  updateMyPreferences: (data) => prefAxios.put('', data),
};

export default notificationService;
