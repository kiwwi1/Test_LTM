import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis client configuration
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('ready', () => {
    console.log('✅ Redis is ready');
});

// Connect to Redis
await redisClient.connect();

// Helper functions for common operations

// Set with expiration
export const setWithExpiry = async (key, value, expirySeconds = 3600) => {
    try {
        await redisClient.set(key, JSON.stringify(value), {
            EX: expirySeconds
        });
    } catch (error) {
        console.error('Redis SET error:', error);
        throw error;
    }
};

// Get and parse JSON
export const getJSON = async (key) => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis GET error:', error);
        throw error;
    }
};

// Delete key
export const deleteKey = async (key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Redis DELETE error:', error);
        throw error;
    }
};

// Check if key exists
export const exists = async (key) => {
    try {
        return await redisClient.exists(key);
    } catch (error) {
        console.error('Redis EXISTS error:', error);
        throw error;
    }
};

// Set multiple values
export const mset = async (keyValuePairs) => {
    try {
        const args = [];
        for (const [key, value] of Object.entries(keyValuePairs)) {
            args.push(key, JSON.stringify(value));
        }
        await redisClient.mSet(args);
    } catch (error) {
        console.error('Redis MSET error:', error);
        throw error;
    }
};

// Pub/Sub helper
export const publish = async (channel, message) => {
    try {
        await redisClient.publish(channel, JSON.stringify(message));
    } catch (error) {
        console.error('Redis PUBLISH error:', error);
        throw error;
    }
};

export default redisClient;

