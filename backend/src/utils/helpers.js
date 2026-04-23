/**
 * Format currency in Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'relative')
 * @returns {string} Formatted date string
 */
const formatDate = (date, format = 'short') => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    
    switch (format) {
        case 'short':
            return d.toLocaleDateString('en-IN');
        case 'long':
            return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        case 'relative':
            const now = new Date();
            const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return `Expired ${Math.abs(diffDays)} days ago`;
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            return `${diffDays} days left`;
        default:
            return d.toLocaleDateString('en-IN');
    }
};

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
const generateRandomId = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return (value / total) * 100;
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) result[groupKey] = [];
        result[groupKey].push(item);
        return result;
    }, {});
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry async operation
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries
 * @returns {Promise} Result of the function
 */
const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await sleep(delay);
        return retry(fn, retries - 1, delay * 2);
    }
};

/**
 * Mask sensitive data
 * @param {string} str - String to mask
 * @param {number} visibleChars - Number of visible characters
 * @returns {string} Masked string
 */
const maskString = (str, visibleChars = 4) => {
    if (!str) return '';
    if (str.length <= visibleChars) return '*'.repeat(str.length);
    const visible = str.slice(-visibleChars);
    const masked = '*'.repeat(str.length - visibleChars);
    return masked + visible;
};

/**
 * Extract domain from email
 * @param {string} email - Email address
 * @returns {string} Domain
 */
const extractDomain = (email) => {
    if (!email) return '';
    return email.split('@')[1];
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
const paginateArray = (array, page = 1, limit = 20) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
        data: array.slice(start, end),
        pagination: {
            page,
            limit,
            total: array.length,
            pages: Math.ceil(array.length / limit)
        }
    };
};

module.exports = {
    formatCurrency,
    formatDate,
    generateRandomId,
    deepClone,
    calculatePercentage,
    groupBy,
    sleep,
    retry,
    maskString,
    extractDomain,
    isEmpty,
    paginateArray
};