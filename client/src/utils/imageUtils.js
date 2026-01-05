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

    // 1. Force HTTPS for production domain (Required for Office Viewer)
    if (imageUrl.includes('umiabroadstudies.com') && imageUrl.startsWith('http://')) {
        return imageUrl.replace('http://', 'https://');
    }

    // 2. Handle absolute URLs
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Fix localhost/127.0.0.1 URLs from development/old uploads
        const urlPatterns = [
            /https?:\/\/127\.0\.0\.1:\d+/,
            /https?:\/\/localhost:\d+/,
        ];

        for (const pattern of urlPatterns) {
            if (pattern.test(imageUrl)) {
                const pathMatch = imageUrl.match(/\/uploads\/.*$/);
                if (pathMatch) {
                    return `${BACKEND_URL}${pathMatch[0]}`;
                }
            }
        }
        return imageUrl; // Return external/valid URLs as is
    }

    // 3. Handle relative paths
    if (imageUrl.startsWith('/uploads')) {
        return `${BACKEND_URL}${imageUrl}`;
    }

    // 4. Handle filenames (assume they are in uploads)
    if (!imageUrl.includes('/')) {
        return `${BACKEND_URL}/uploads/${imageUrl}`;
    }

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
