/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
};

/**
 * Validate Indian mobile number
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} True if valid
 */
const isValidMobileNumber = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
};

/**
 * Validate GST number
 * @param {string} gst - GST number to validate
 * @returns {boolean} True if valid
 */
const isValidGST = (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
};

/**
 * Validate PAN number
 * @param {string} pan - PAN number to validate
 * @returns {boolean} True if valid
 */
const isValidPAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePasswordStrength = (password) => {
    const result = {
        isValid: true,
        errors: []
    };
    
    if (password.length < 8) {
        result.isValid = false;
        result.errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one special character');
    }
    
    return result;
};

/**
 * Validate tender value
 * @param {number} value - Tender value
 * @returns {boolean} True if valid
 */
const isValidTenderValue = (value) => {
    return typeof value === 'number' && value > 0 && value <= 10000000000; // Max 1000 Crore
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} True if valid
 */
const isValidDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
};

/**
 * Validate object against schema
 * @param {Object} obj - Object to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
const validateSchema = (obj, schema) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
        const value = obj[field];
        
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} is required`);
            continue;
        }
        
        if (value !== undefined && value !== null) {
            if (rules.type && typeof value !== rules.type) {
                errors.push(`${field} must be of type ${rules.type}`);
            }
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${field} must be at most ${rules.max}`);
            }
            if (rules.pattern && !rules.pattern.test(String(value))) {
                errors.push(`${field} has invalid format`);
            }
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    isValidEmail,
    isValidMobileNumber,
    isValidGST,
    isValidPAN,
    validatePasswordStrength,
    isValidTenderValue,
    isValidDateRange,
    isValidURL,
    sanitizeString,
    validateSchema
};