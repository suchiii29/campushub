import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // httpOnly cookies
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor for auth
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt refresh token
      try {
        await api.post('/auth/refresh');
        return api.request(error.config);
      } catch {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);
