import axiosInstance from '../api/axiosInstance';

export const getAllEvents = () => axiosInstance.get('/events');
export const getEventsByType = (type) => axiosInstance.get(`/events/type/${type}`);
export const createEvent = (data) => axiosInstance.post('/events', data);
export const updateEvent = (id, data) => axiosInstance.put(`/events/${id}`, data);
export const deleteEvent = (id) => axiosInstance.delete(`/events/${id}`);