import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/api/auth/register', data);
export const login    = (data) => API.post('/api/auth/login', data);

// Tasks
export const getTasks    = ()       => API.get('/api/tasks');
export const createTask  = (data)   => API.post('/api/tasks', data);
export const updateTask  = (id, data) => API.put(`/api/tasks/${id}`, data);
export const deleteTask  = (id)     => API.delete(`/api/tasks/${id}`);

export default API;
