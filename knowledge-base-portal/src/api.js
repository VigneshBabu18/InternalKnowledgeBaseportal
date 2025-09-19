import axios from 'axios';

const API_BASE_URL = 'http://localhost:5066/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
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

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage & redirect
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* ---------------- AUTH API ---------------- */
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  createUser: (userData) => api.post('/auth/admin/create-user', userData),
};

/* ---------------- ADMIN API ---------------- */
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Articles moderation
  getPendingArticles: () => api.get('/articles/pending'),   // ✅ fixed
  approveArticle: (id) => api.post(`/articles/${id}/approve`),
  rejectArticle: (id, reason) => api.post(`/articles/${id}/reject`, { reason }),

  // Search
  searchArticles: (params) => api.get('/admin/search', { params }),

  // Users
  getUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

/* ---------------- ARTICLES API ---------------- */
export const articlesAPI = {
  create: (articleData) => api.post('/articles', articleData),
  update: (id, articleData) => api.put(`/articles/${id}`, articleData),
  delete: (id) => api.delete(`/articles/${id}`),
  getMine: () => api.get('/articles/mine'),
  browse: (params) => api.get('/articles', { params }),
  getById: (id) => api.get(`/articles/${id}`),
  recordView: (id) => api.post(`/articles/${id}/view`),
};

/* ---------------- COMMENTS API ---------------- */
export const commentsAPI = {
  create: (commentData) => api.post('/comments', commentData),
  getByArticle: (articleId) => api.get(`/comments/article/${articleId}`),
};

/* ---------------- PROFILE API ---------------- */
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (profileData) => api.put('/profile', profileData),
  getDashboard: () => api.get('/profile/dashboard'),
};

export default api;
