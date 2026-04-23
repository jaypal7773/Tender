const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            password: process.env.REDIS_PASSWORD,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger.error('Redis max reconnection attempts reached');
                        return new Error('Redis max reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });
        
        redisClient.on('error', (err) => {
            logger.error('Redis Client Error:', err);
        });
        
        redisClient.on('connect', () => {
            logger.info('Redis Client Connected');
        });
        
        redisClient.on('reconnecting', () => {
            logger.warn('Redis Client Reconnecting');
        });
        
        await redisClient.connect();
        
        return redisClient;
    } catch (error) {
        logger.error('Redis connection failed:', error);
        return null;
    }
};

const getRedisClient = () => redisClient;

const setCache = async (key, value, ttl = process.env.REDIS_TTL || 3600) => {
    try {
        if (!redisClient) return false;
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        return true;
    } catch (error) {
        logger.error('Redis set cache error:', error);
        return false;
    }
};

const getCache = async (key) => {
    try {
        if (!redisClient) return null;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error('Redis get cache error:', error);
        return null;
    }
};

const deleteCache = async (pattern) => {
    try {
        if (!redisClient) return false;
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        return true;
    } catch (error) {
        logger.error('Redis delete cache error:', error);
        return false;
    }
};

const flushCache = async () => {
    try {
        if (!redisClient) return false;
        await redisClient.flushAll();
        return true;
    } catch (error) {
        logger.error('Redis flush cache error:', error);
        return false;
    }
};

module.exports = {
    connectRedis,
    getRedisClient,
    setCache,
    getCache,
    deleteCache,
    flushCache
};