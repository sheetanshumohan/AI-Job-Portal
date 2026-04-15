import axios from 'axios';

// Get the token from Zustand store directly if possible, or localStorage.
// Assuming Zustand persists in localStorage or we just pass the token.

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // If using cookies
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const authState = localStorage.getItem('auth-storage');
  if (authState) {
    try {
      const { state } = JSON.parse(authState);
      if (state && state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (error) {
      console.error('Error parsing auth state:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Basic global error handler
    if (error.response && error.response.status === 401) {
      // Token might be expired
      // Could dispatch an event to log the user out
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
