/**
 * Statement Helper Functions
 * Formatting and utility functions used across all bank templates
 */

export const formatMoney = (amount) => {
    if (!amount && amount !== 0) return '';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NP', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

export const formatMoneyNoSymbol = (amount) => {
    if (!amount && amount !== 0) return '';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatMoney(num).replace(/,/g, ',');
};

export const formatDisplayDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

export const toSimpleDateString = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
};

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function convertLessThanThousand(num) {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' And ' + convertLessThanThousand(num % 100) : '');
}

export const numberToWords = (num) => {
    if (typeof num === 'string') num = parseFloat(num);
    if (isNaN(num) || num < 0) return '';
    if (num === 0) return 'Zero';

    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);

    let words = '';

    const crore = Math.floor(intPart / 10000000);
    const lakh = Math.floor((intPart % 10000000) / 100000);
    const thousand = Math.floor((intPart % 100000) / 1000);
    const remainder = intPart % 1000;

    if (crore > 0) words += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) words += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) words += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) words += convertLessThanThousand(remainder);

    words = words.trim();

    if (decPart > 0) {
        words += ' And ' + convertLessThanThousand(decPart) + ' Paisa';
    }

    return words.trim();
};
