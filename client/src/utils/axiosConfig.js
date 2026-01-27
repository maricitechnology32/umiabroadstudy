import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true // Important: sends cookies with requests
});

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
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================
// RESPONSE INTERCEPTOR - Auto Token Refresh
// ============================================
api.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors with token expiration
        if (error.response?.status === 401 &&
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry) {

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
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (data.success) {
                    console.log('[AUTH] Token refreshed successfully');

                    // Store new access token (optional - cookies handle this automatically)
                    if (data.accessToken) {
                        localStorage.setItem('accessToken', data.accessToken);
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

                // Redirect to login
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        // Handle account lockout (423 status)
        if (error.response?.status === 423) {
            console.warn('[AUTH] Account locked:', error.response.data.message);
            // Don't redirect, let the component handle it
            return Promise.reject(error);
        }



        // All other errors
        return Promise.reject(error);
    }
);

export default api;
