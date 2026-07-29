import { redisClient } from '../config/redis';

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
        return JSON.parse(cachedData) as T;
      }
    }
  } catch (error) {
    console.error(`[Redis] Cache read error for key "${key}":`, error);
  }

  // 2. Cache Miss or Redis Offline -> Read from primary data source (MongoDB)
  const freshData = await fetchFn();

  // 3. Store fresh data in Redis if valid
  if (freshData !== null && freshData !== undefined) {
    try {
      if (redisClient.isReady) {
        await redisClient.setEx(key, ttlInSeconds, JSON.stringify(freshData));
      }
    } catch (error) {
      console.error(`[Redis] Cache write error for key "${key}":`, error);
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
      if (Array.isArray(keys)) {
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        await redisClient.del(keys);
      }
    }
  } catch (error) {
    console.error('[Redis] Cache invalidation error:', error);
  }
};
