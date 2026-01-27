import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // Important: sends cookies with requests
});

// Helper to set token manually (Legacy support)
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Store to prevent multiple refresh requests at once
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    // Optional: If you still use localStorage token, inject it here
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR - Auto Token Refresh
// ============================================
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with token expiration
    // Check for 401 status. Some backends send specific codes like 'TOKEN_EXPIRED', 
    // but often just 401 is enough to trigger a refresh attempt if we haven't retried yet.
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            // Retry the original request
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[AUTH] Access token expired, refreshing...');

        // Call refresh endpoint
        // Note: We use axios directly here to avoid infinite loops with our interceptor
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (data.success) {
          console.log('[AUTH] Token refreshed successfully');

          // Store new access token (optional - cookies handle this automatically)
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          }

          isRefreshing = false;
          processQueue(null, data.accessToken);

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[AUTH] Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed - clear data and redirect to login
        localStorage.clear();
        sessionStorage.clear();
        setAuthToken(null);

        // Redirect to login only if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle account lockout (423 status)
    if (error.response?.status === 423) {
      console.warn('[AUTH] Account locked:', error.response.data.message);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;