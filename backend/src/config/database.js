// backend/src/config/database.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_tender_db';
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        logger.info(`MongoDB Connected: ${mongoose.connection.name}`);
        
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });
        
    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

module.exports = { connectDB };