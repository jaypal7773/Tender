const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("❌ MONGODB_URI is not defined in ENV");
        }

        await mongoose.connect(mongoURI);

        logger.info(`✅ MongoDB Atlas Connected: ${mongoose.connection.name}`);

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

    } catch (error) {
        logger.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB };