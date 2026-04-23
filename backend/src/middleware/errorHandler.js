const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message });
    }
    
    if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Duplicate key error', field: Object.keys(err.keyPattern)[0] });
    }
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;