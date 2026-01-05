/**
 * Nepal Rastra Bank Exchange Rate Utility
 * 
 * Fetches real-time USD to NPR exchange rate via backend proxy.
 * The proxy bypasses CORS restrictions on the official NRB API.
 * Uses the SELLING rate (not buying rate) as specified by user requirements.
 */

import api from './api';

/**
 * Fetches the current USD to NPR selling rate from Nepal Rastra Bank via backend proxy
 * @returns {Promise<{rate: number, date: string, source: string}>}
 */
export const fetchNRBExchangeRate = async (date) => {
    try {
        const query = date ? `?date=${date}` : '';
        const response = await api.get(`/exchange-rate/nrb${query}`);

        if (response.data?.success && response.data?.data) {
            const rateData = response.data.data;
            return {
                rate: rateData.sellRate || rateData.rate || 135.00,
                buyRate: rateData.buyRate || 134.00,
                date: rateData.date || new Date().toISOString().split('T')[0],
                source: rateData.source || 'Nepal Rastra Bank',
                currency: rateData.currency || 'USD',
                unit: rateData.unit || 1,
                error: rateData.error || null
            };
        }

        throw new Error('Invalid response format');

    } catch (error) {
        console.error('Failed to fetch NRB exchange rate:', error);

        // Return fallback rate if API fails
        return {
            rate: 144.10,
            buyRate: 143.50,
            date: new Date().toISOString().split('T')[0],
            source: 'Fallback (API unavailable)',
            currency: 'USD',
            unit: 1,
            error: error.message
        };
    }
};

/**
 * Formats the exchange rate date for display
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} - Formatted date like "7th October 2025"
 */
export const formatExchangeRateDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Get ordinal suffix
    const getOrdinalSuffix = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};

/**
 * Formats the exchange rate date with HTML superscript for Word doc
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} - Formatted date like "7<sup>th</sup> October 2025"
 */
export const formatExchangeRateDateWithSuperscript = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const getOrdinalSuffix = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}<sup>${getOrdinalSuffix(day)}</sup> ${month} ${year}`;
};

/**
 * Parses exchange rate date for JSX rendering with native <sup> elements
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {{ day: number, suffix: string, month: string, year: number }}
 */
export const parseExchangeRateParts = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const getOrdinalSuffix = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return {
        day,
        suffix: getOrdinalSuffix(day),
        month: months[date.getMonth()],
        year: date.getFullYear()
    };
};

/**
 * Hook to use NRB exchange rate with auto-refresh capability
 * Can be used in React components
 */
export const useNRBExchangeRate = () => {
    return {
        fetchRate: fetchNRBExchangeRate,
        formatDate: formatExchangeRateDate
    };
};
