/**
 * Fixes image URLs that may have incorrect backend URLs stored in the database
 * Converts any old/incorrect backend URLs to the current backend URL
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', ''); // Get base backend URL

/**
 * Normalizes an image URL to use the correct backend
 * @param {string} imageUrl - The image URL (might be relative or absolute with wrong domain)
 * @returns {string} - Corrected image URL
 */
export const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return imageUrl;

    // If it's already a full external URL (http://... or https://...), keep it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Check if it's pointing to an old/incorrect backend
        const urlPatterns = [
            /https?:\/\/127\.0\.0\.1:\d+/,  // 127.0.0.1 with any port
            /https?:\/\/localhost:\d+/,      // localhost with any port (except current)
        ];

        for (const pattern of urlPatterns) {
            if (pattern.test(imageUrl)) {
                // Extract the path after the domain
                const pathMatch = imageUrl.match(/\/uploads\/.*$/);
                if (pathMatch) {
                    return `${BACKEND_URL}${pathMatch[0]}`;
                }
            }
        }

        // If it's not a localhost/127.0.0.1 URL, return as-is (external image)
        return imageUrl;
    }

    // If it's a relative path starting with /uploads, prepend backend URL
    if (imageUrl.startsWith('/uploads')) {
        return `${BACKEND_URL}${imageUrl}`;
    }

    // If it's just a filename or relative path, assume it's in /uploads
    if (!imageUrl.includes('/')) {
        return `${BACKEND_URL}/uploads/${imageUrl}`;
    }

    // Default: return as-is
    return imageUrl;
};

/**
 * Fixes all image URLs in HTML content
 * @param {string} htmlContent - HTML content with potential image URLs
 * @returns {string} - HTML with fixed image URLs
 */
export const fixImagesInContent = (htmlContent) => {
    if (!htmlContent) return htmlContent;

    // Replace all img src attributes
    return htmlContent.replace(
        /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi,
        (match, before, src, after) => {
            const fixedSrc = fixImageUrl(src);
            return `<img${before}src="${fixedSrc}"${after}>`;
        }
    );
};
