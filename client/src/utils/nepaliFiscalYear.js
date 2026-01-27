/**
 * Nepali Fiscal Year Utility with PRECISE Date Conversion
 * 
 * Uses @sbmdkl/nepali-date-converter for accurate Bikram Sambat to Gregorian conversion.
 * 
 * The Nepali fiscal year runs from:
 * - Start: 1st Shrawan (Month 4 in BS calendar)
 * - End: Last day of Ashadh (Month 3 in BS calendar, next year)
 * 
 * BS to AD conversion is precise because 1st Shrawan falls on different Gregorian dates each year.
 */

import { bsToAd } from '@sbmdkl/nepali-date-converter';

/**
 * Converts a BS year to the Gregorian AD year for fiscal year calculations
 * @param {number} adYear - The Gregorian year (e.g., 2022)
 * @returns {number} - The corresponding BS year (approximately AD + 57)
 */
const adYearToBsYear = (adYear) => {
    // BS year is approximately 56-57 years ahead of AD
    // For fiscal year starting July 2022 AD, BS year is 2079
    return adYear + 57;
};

/**
 * Gets the ordinal suffix for a day (1st, 2nd, 3rd, 16th, etc.)
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
 * Formats a Date object as "16th July, 2022 A.D."
 */
export const formatGregorianDate = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}${getOrdinalSuffix(day)} ${month}, ${year} A.D.`;
};

/**
 * Formats a Date object as "16<sup>th</sup> July, 2022 A.D." (with HTML superscript)
 */
export const formatGregorianDateWithSuperscript = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}<sup>${getOrdinalSuffix(day)}</sup> ${month}, ${year} A.D.`;
};

/**
 * Parses a Date object and returns components for JSX rendering
 * @param {Date} date - The date to parse
 * @returns {{ day: number, suffix: string, month: string, year: number }}
 */
export const parseFiscalDateParts = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate();
    return {
        day,
        suffix: getOrdinalSuffix(day),
        month: months[date.getMonth()],
        year: date.getFullYear()
    };
};

/**
 * Gets the precise start date of Nepali fiscal year (1st Shrawan)
 * @param {number} adYear - The AD year when the fiscal year starts
 * @returns {Date} - The Gregorian date of 1st Shrawan
 */
export const getFiscalYearStartDate = (adYear) => {
    // Manual overrides for Nepal fiscal year start dates (July 16 each year)
    const overrides = {
        2022: '2022-07-16',
        2023: '2023-07-16',
        2024: '2024-07-16',
        2025: '2025-07-16' // Needed to calculate end date of 2024/25
    };

    if (overrides[adYear]) {
        return new Date(overrides[adYear]);
    }

    try {
        const bsYear = adYearToBsYear(adYear);
        // 1st Shrawan = BS month 4, day 1
        // Format: YYYY-MM-DD for BS date
        const bsDateString = `${bsYear}-04-01`;

        // Convert BS to AD using the library - returns "YYYY-MM-DD" string
        const adDateString = bsToAd(bsDateString);
        const [year, month, day] = adDateString.split('-').map(Number);

        return new Date(year, month - 1, day); // month is 0-indexed in JS Date
    } catch (error) {
        console.warn(`Fiscal year conversion failed for ${adYear}, using fallback`, error);
        // Fallback to July 16 if conversion fails
        return new Date(adYear, 6, 16); // July 16
    }
};

/**
 * Gets the precise end date of Nepali fiscal year (last day of Ashadh, which is day before 1st Shrawan next year)
 * @param {number} adYear - The AD year when the fiscal year starts
 * @returns {Date} - The Gregorian date of last day of Ashadh
 */
export const getFiscalYearEndDate = (adYear) => {
    // End date is the day before the start of next fiscal year
    const nextFYStart = getFiscalYearStartDate(adYear + 1);
    const endDate = new Date(nextFYStart);
    endDate.setDate(endDate.getDate() - 1);
    return endDate;
};

/**
 * Returns a single fiscal year object with hardcoded dates
 * Nepal Fiscal Year: 16 July to 15 July
 * @param {number} startYear - The starting AD year of the fiscal year
 * @returns {{ label: string, startDate: string, endDate: string, startYear: number, endYear: number }}
 */
export const getFiscalYear = (startYear) => {
    const endYear = startYear + 1;

    // Hardcoded fiscal year dates (exact dates from user)
    // 2022/23: July 17, 2022 – July 16, 2023
    // 2023/24: July 17, 2023 – July 15, 2024
    // 2024/25: July 16, 2024 – July 16, 2025
    const fiscalYearDates = {
        2022: { start: new Date(2022, 6, 17), end: new Date(2023, 6, 16) }, // July = 6 (0-indexed)
        2023: { start: new Date(2023, 6, 17), end: new Date(2024, 6, 15) },
        2024: { start: new Date(2024, 6, 16), end: new Date(2025, 6, 16) },
        2025: { start: new Date(2025, 6, 16), end: new Date(2026, 6, 15) },
    };

    // Use hardcoded dates if available, otherwise calculate
    const dates = fiscalYearDates[startYear] || {
        start: new Date(startYear, 6, 16),
        end: new Date(endYear, 6, 15)
    };

    return {
        label: `${startYear}/${endYear} A.D.`,
        startDate: formatGregorianDate(dates.start),
        endDate: formatGregorianDate(dates.end),
        // Superscript versions for Word doc generation
        startDateSup: formatGregorianDateWithSuperscript(dates.start),
        endDateSup: formatGregorianDateWithSuperscript(dates.end),
        startYear,
        endYear,
        // Raw Date objects for programmatic use
        startDateObj: dates.start,
        endDateObj: dates.end
    };
};

/**
 * Returns three consecutive fiscal years starting from the given year with PRECISE dates
 * @param {number} startYear - The first year (e.g., 2022 returns 2022/2023, 2023/2024, 2024/2025)
 * @returns {Array<{ label: string, startDate: string, endDate: string }>}
 */
export const getThreeConsecutiveFiscalYears = (startYear) => {
    return [
        getFiscalYear(startYear),
        getFiscalYear(startYear + 1),
        getFiscalYear(startYear + 2)
    ];
};

/**
 * Returns fiscal year labels only (for table headers)
 * @param {number} startYear 
 * @returns {string[]} - e.g., ["2022/2023 A.D.", "2023/2024 A.D.", "2024/2025 A.D."]
 */
export const getFiscalYearLabels = (startYear) => {
    return getThreeConsecutiveFiscalYears(startYear).map(fy => fy.label);
};

/**
 * Returns current fiscal year based on today's date
 * @returns {number}
 */
export const getCurrentFiscalStartYear = () => {
    const today = new Date();
    const year = today.getFullYear();

    // Get this year's fiscal year start
    const thisYearFYStart = getFiscalYearStartDate(year);

    // If today is before this year's fiscal year start, we're in last year's fiscal year
    if (today < thisYearFYStart) {
        return year - 1;
    }
    return year;
};

/**
 * Returns the default start year for showing last 3 fiscal years
 * (2 years before current fiscal year)
 * @returns {number}
 */
export const getDefaultStartYear = () => {
    return getCurrentFiscalStartYear() - 2;
};
