import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('shikkha_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shikkha_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d) => API.post('/auth/register', d),
  login: (d) => API.post('/auth/login', d),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  updateProfile: (d) => API.put('/auth/profile', d),
  changePassword: (d) => API.put('/auth/change-password', d),
};

export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getAllAdmin: () => API.get('/courses/all'),
  getOne: (id) => API.get(`/courses/${id}`),
  create: (d) => API.post('/courses', d),
  update: (id, d) => API.put(`/courses/${id}`, d),
  delete: (id) => API.delete(`/courses/${id}`),
  enroll: (id) => API.post(`/courses/${id}/enroll`),
  getMyCourses: () => API.get('/courses/my-courses'),
  addLesson: (id, d) => API.post(`/courses/${id}/lessons`, d),
  addMaterial: (id, d) => API.post(`/courses/${id}/materials`, d),
  deleteMaterial: (id, matId) => API.delete(`/courses/${id}/materials/${matId}`),
};

export const testAPI = {
  getAll: (params) => API.get('/tests', { params }),
  getAllAdmin: () => API.get('/tests/all'),
  getOne: (id) => API.get(`/tests/${id}`),
  create: (d) => API.post('/tests', d),
  update: (id, d) => API.put(`/tests/${id}`, d),
  delete: (id) => API.delete(`/tests/${id}`),
  submit: (id, d) => API.post(`/tests/${id}/submit`, d),
  getMyResults: () => API.get('/tests/my-results'),
  getTestResults: (id) => API.get(`/tests/${id}/results`),
};

export const aiAPI = {
  chat: (d) => API.post('/ai/chat', d),
  summarize: (text, language) => API.post('/ai/summarize', { text, language }),
  getHistories: () => API.get('/ai/histories'),
  getHistory: (id) => API.get(`/ai/history/${id}`),
  deleteChat: (id) => API.delete(`/ai/history/${id}`),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  createUser: (d) => API.post('/admin/users', d),
  updateUser: (id, d) => API.put(`/admin/users/${id}`, d),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;
