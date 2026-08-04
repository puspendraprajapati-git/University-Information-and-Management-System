import axiosInstance from '../api/axiosInstance';


// Fetch all events records
export const getAllEvents = () => axiosInstance.get('/events');

// Fetch a specific eventsbytype by ID
export const getEventsByType = (type) => axiosInstance.get(`/events/type/${type}`);

// Create a new event record
export const createEvent = (data) => axiosInstance.post('/events', data);

// Update an existing event record
export const updateEvent = (id, data) => axiosInstance.put(`/events/${id}`, data);

// Delete a event record
export const deleteEvent = (id) => axiosInstance.delete(`/events/${id}`);
