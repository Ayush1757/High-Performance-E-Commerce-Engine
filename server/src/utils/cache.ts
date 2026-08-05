import { redisClient } from '../config/redis';
import logger from './logger';

/** Cache performance metrics tracker */
const cacheMetrics = {
  hits: 0,
  misses: 0,
  errors: 0,
};

/** Get current cache metrics */
export const getCacheMetrics = () => ({
  ...cacheMetrics,
  hitRate: cacheMetrics.hits + cacheMetrics.misses > 0
    ? ((cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) * 100).toFixed(2) + '%'
    : '0%',
});

/**
 * Generic Cache-Aside helper function.
 * Flow:
 * 1. Read from Redis.
 * 2. If Cache Hit -> Return cached data.
 * 3. Else (Cache Miss) -> Read from MongoDB (via fetchFn).
 * 4. Write data to Redis with TTL (default 3600 seconds).
 * 5. Return response.
 */
export const getOrSetCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlInSeconds: number = 3600
): Promise<T> => {
  // 1. Try reading from Redis
  try {
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        cacheMetrics.hits++;
        logger.debug(`[Redis] Cache HIT for key "${key}"`);
        return JSON.parse(cachedData) as T;
      }
      cacheMetrics.misses++;
      logger.debug(`[Redis] Cache MISS for key "${key}"`);
    }
  } catch (error) {
    cacheMetrics.errors++;
    logger.error(`[Redis] Cache read error for key "${key}":`, error);
  }

  // 2. Cache Miss or Redis Offline -> Read from primary data source (MongoDB)
  const freshData = await fetchFn();

  // 3. Store fresh data in Redis if valid
  if (freshData !== null && freshData !== undefined) {
    try {
      if (redisClient.isReady) {
        await redisClient.setEx(key, ttlInSeconds, JSON.stringify(freshData));
        logger.debug(`[Redis] Cached key "${key}" with TTL ${ttlInSeconds}s`);
      }
    } catch (error) {
      cacheMetrics.errors++;
      logger.error(`[Redis] Cache write error for key "${key}":`, error);
    }
  }

  return freshData;
};

/**
 * Utility to invalidate one or multiple cache keys.
 */
export const invalidateCache = async (keys: string | string[]): Promise<void> => {
  try {
    if (redisClient.isReady) {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      if (keyArray.length > 0) {
        await redisClient.del(keyArray);
        logger.debug(`[Redis] Invalidated keys: ${keyArray.join(', ')}`);
      }
    }
  } catch (error) {
    logger.error('[Redis] Cache invalidation error:', error);
  }
};

/**
 * Utility to invalidate cache keys by glob pattern (e.g., "product:*").
 * Uses SCAN instead of KEYS to avoid blocking Redis in production.
 */
export const invalidateCachePattern = async (pattern: string): Promise<void> => {
  try {
    if (redisClient.isReady) {
      const allKeys: string[] = [];

      // Use scanIterator to iterate without blocking (type-safe for redis v6)
      const iterator = redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      }) as AsyncIterable<string>;

      for await (const key of iterator) {
        allKeys.push(key);
      }

      if (allKeys.length > 0) {
        await Promise.all(allKeys.map((k) => redisClient.del(k)));
        logger.debug(`[Redis] Pattern invalidation "${pattern}" removed ${allKeys.length} keys`);
      }
    }
  } catch (error) {
    logger.error(`[Redis] Pattern cache invalidation error for "${pattern}":`, error);
  }
};
