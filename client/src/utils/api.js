// // import axios from 'axios';

// // // Create an axios instance
// // const api = axios.create({
// //   baseURL: 'http://localhost:5000/api', // Point to your backend
// //   withCredentials: true, // IMPORTANT: Allows sending cookies (JWT) to backend
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });

// // export default api;

// import axios from 'axios';

// // Create an axios instance
// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   withCredentials: true, // Keep sending cookies
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // FIX: Add Interceptor to inject Token into Headers
// // This runs before every request
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from 'axios';

// API Base URL - uses environment variable with fallback for development
// Using relative path '/api' so Vite proxy (dev) or Nginx (prod) handles the domain
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Keep sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to set token manually
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Keep the interceptor as a backup safety net
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

// Handle 401s (Auto-Logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only clear if it's truly an auth error, not just a bad password attempt
      if (!error.config.url.includes('/login')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Optional: window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;