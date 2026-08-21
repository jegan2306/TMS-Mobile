import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token dynamically to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized errors to handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirect on login attempt failure
      if (!error.config?.url?.includes('/api/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/api/departments'),
  getById: (id) => api.get(`/api/departments/${id}`),
  create: (data) => api.post('/api/departments', data),
  update: (id, data) => api.put(`/api/departments/${id}`, data),
  delete: (id) => api.delete(`/api/departments/${id}`),
};

// Programme APIs
export const programmeAPI = {
  getAll: (params) => api.get('/api/programmes', { params }),
  getById: (id) => api.get(`/api/programmes/${id}`),
  create: (data) => api.post('/api/programmes', data),
  update: (id, data) => api.put(`/api/programmes/${id}`, data),
  delete: (id) => api.delete(`/api/programmes/${id}`),
};

// Block APIs
export const blockAPI = {
  getAll: (params) => api.get('/api/blocks', { params }),
  getById: (id) => api.get(`/api/blocks/${id}`),
  create: (data) => api.post('/api/blocks', data),
  update: (id, data) => api.put(`/api/blocks/${id}`, data),
  delete: (id) => api.delete(`/api/blocks/${id}`),
};

// Room APIs
export const roomAPI = {
  getAll: (params) => api.get('/api/rooms', { params }),
  getById: (id) => api.get(`/api/rooms/${id}`),
  create: (data) => api.post('/api/rooms', data),
  update: (id, data) => api.put(`/api/rooms/${id}`, data),
  delete: (id) => api.delete(`/api/rooms/${id}`),
};

// Role APIs
export const roleAPI = {
  getAll: () => api.get('/api/roles'),
  getById: (id) => api.get(`/api/roles/${id}`),
  create: (data) => api.post('/api/roles', data),
  update: (id, data) => api.put(`/api/roles/${id}`, data),
  delete: (id) => api.delete(`/api/roles/${id}`),
};

// User APIs
export const userAPI = {
  getAll: (params) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

// Complaint APIs
export const complaintAPI = {
  getAll: (params) => api.get('/api/complaints', { params }),
  getById: (id) => api.get(`/api/complaints/${id}`),
  create: (data) => api.post('/api/complaints', data),
  update: (id, data) => api.put(`/api/complaints/${id}`, data),
  delete: (id) => api.delete(`/api/complaints/${id}`),
  assign: (id, assignedTo) => api.put(`/api/complaints/${id}/assign`, { assignedTo }),
  updateStatus: (id, status) => api.put(`/api/complaints/${id}/status`, { status }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getStatsByType: () => api.get('/api/dashboard/stats/by-type'),
  getStatsByStatus: () => api.get('/api/dashboard/stats/by-status'),
};

// Report APIs
export const reportAPI = {
  generate: (params) => api.get('/api/reports', { params }),
  export: (params) => api.get('/api/reports/export', { params, responseType: 'blob' }),
};

export default api;
