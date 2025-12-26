/**
 * CSRF Token Utilities
 * Helper functions for CSRF protection
 */

/**
 * Get CSRF token from cookie
 * @returns {string|null} CSRF token or null if not found
 */
export const getCSRFToken = () => {
    const name = 'XSRF-TOKEN';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }

    return null;
};

/**
 * Check if CSRF token exists
 * @returns {boolean}
 */
export const hasCSRFToken = () => {
    return getCSRFToken() !== null;
};

/**
 * Get CSRF token from localStorage (fallback)
 * @returns {string|null}
 */
export const getStoredCSRFToken = () => {
    return localStorage.getItem('csrfToken');
};

/**
 * Store CSRF token in localStorage
 * @param {string} token 
 */
export const storeCSRFToken = (token) => {
    if (token) {
        localStorage.setItem('csrfToken', token);
    }
};

/**
 * Clear CSRF token
 */
export const clearCSRFToken = () => {
    localStorage.removeItem('csrfToken');
};
