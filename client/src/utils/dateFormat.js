/**
 * Date formatting utilities with superscript ordinal suffixes
 */

/**
 * Get the ordinal suffix for a day number
 * @param {number} day - The day of the month
 * @returns {string} The ordinal suffix (st, nd, rd, th)
 */
export const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

/**
 * Format a date with superscript ordinal suffix for HTML (Word docs)
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string with HTML superscript tags
 */
export const formatDateWithSuperscript = (date = new Date()) => {
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day}<sup>${suffix}</sup> ${month}, ${year}`;
};

/**
 * Format a date with superscript ordinal suffix for React JSX
 * @param {Date} date - The date to format
 * @returns {JSX.Element} React fragment with superscripted ordinal
 */
export const formatDateWithSuperscriptJSX = (date = new Date()) => {
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return { day, suffix, month, year, formatted: `${day}${suffix} ${month}, ${year}` };
};

/**
 * Get initial formatted date string (plain text with ordinal)
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string like "2nd January, 2026"
 */
export const getFormattedDate = (date = new Date()) => {
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${suffix} ${month}, ${year}`;
};

/**
 * Parse a date string and return with superscript HTML
 * Handles formats like "2 January 2026" or "2nd January, 2026"
 * @param {string} dateStr - The date string
 * @returns {string} Formatted date string with HTML superscript tags
 */
export const addSuperscriptToDateString = (dateStr) => {
    // Match patterns like "2 January 2026" or "2nd January, 2026"
    const match = dateStr.match(/^(\d{1,2})(st|nd|rd|th)?\s+(\w+),?\s+(\d{4})$/);
    if (match) {
        const day = parseInt(match[1]);
        const suffix = getOrdinalSuffix(day);
        const month = match[3];
        const year = match[4];
        return `${day}<sup>${suffix}</sup> ${month}, ${year}`;
    }
    return dateStr;
};

/**
 * Parse a date string and return its components for JSX rendering
 * Handles formats like "2 January 2026" or "2nd January, 2026"
 * @param {string} dateStr - The date string
 * @returns {Object} Object with day, suffix, month, year properties
 */
export const parseDateParts = (dateStr) => {
    const match = dateStr.match(/^(\d{1,2})(st|nd|rd|th)?\s+(\w+),?\s+(\d{4})$/);
    if (match) {
        const day = parseInt(match[1]);
        const suffix = getOrdinalSuffix(day);
        const month = match[3];
        const year = match[4];
        return { day, suffix, month, year };
    }
    // Fallback: return the string as-is
    return { day: dateStr, suffix: '', month: '', year: '' };
};

