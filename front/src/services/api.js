import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Include cookies in requests
})

// Add response interceptor for error handling
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Article API functions
export const articleAPI = {
  // Get all articles with optional filters
  getAll: (params = {}) => authAPI.get('/articles', { params }),
  
  // Get single article
  getById: (id) => authAPI.get(`/articles/${id}`),
  
  // Create article
  create: (data) => authAPI.post('/articles', data),
  
  // Update article
  update: (id, data) => authAPI.put(`/articles/${id}`, data),
  
  // Delete article
  delete: (id) => authAPI.delete(`/articles/${id}`),
  
  // Summarize article
  summarize: (id, provider = 'gemini') => 
    authAPI.post(`/articles/${id}/summarize`, { provider }),
  
  // PDF export
  exportPDF: (id) => 
    authAPI.get(`/articles/${id}/export/pdf`, { responseType: 'blob' }),
}

// Auth API functions (already using authAPI instance)
export const authService = {
  login: (credentials) => authAPI.post('/auth/login', credentials),
  register: (userData) => authAPI.post('/auth/register', userData),
  logout: () => authAPI.post('/auth/logout'),
  getProfile: () => authAPI.get('/auth/profile'),
  checkAuth: () => authAPI.get('/auth/check'),
}

// Users API (admin only - optional functionality)
export const userAPI = {
  getAll: () => authAPI.get('/users'),
}