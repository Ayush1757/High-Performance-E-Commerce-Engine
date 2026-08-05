import { createClient } from 'redis';
import logger from '../utils/logger';

const REDIS_URI = process.env.REDIS_URI || 'redis://127.0.0.1:6379';

export const redisClient = createClient({
  url: REDIS_URI,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        logger.error('Redis: max reconnection attempts reached, giving up');
        return new Error('Redis max retries reached');
      }
      const delay = Math.min(retries * 200, 3000);
      logger.warn(`Redis: reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    },
    connectTimeout: 5000,
  },
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err.message);
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

/**
 * Connect to Redis with graceful degradation.
 * If Redis is unavailable, the app continues to function without caching.
 */
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.warn('Failed to connect to Redis, app will run without caching:', (error as Error).message);
    // App continues without cache — graceful degradation
  }
};

/**
 * Gracefully disconnect from Redis.
 * Used during application shutdown.
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isReady) {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};
