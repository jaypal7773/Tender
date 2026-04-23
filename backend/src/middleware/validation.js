const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
};

const tenderValidation = {
    getTenders: [
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('category').optional().isString().trim(),
        query('minScore').optional().isInt({ min: 0, max: 100 }).toInt(),
        query('deadlineFrom').optional().isISO8601().toDate(),
        query('deadlineTo').optional().isISO8601().toDate(),
        query('status').optional().isIn(['discovered', 'analyzed', 'in_progress', 'submitted', 'awarded', 'rejected', 'expired']),
        validate
    ]
};

const authValidation = {
    register: [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
        body('name').notEmpty().trim().withMessage('Name is required'),
        body('mobileNumber').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian mobile number required'),
        body('companyId').notEmpty().withMessage('Company ID is required'),
        validate
    ],
    login: [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
        validate
    ]
};

module.exports = { tenderValidation, authValidation };