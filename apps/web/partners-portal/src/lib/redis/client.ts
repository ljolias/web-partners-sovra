/**
 * Upstash Redis Client
 * Provides a singleton Redis client using Upstash REST API
 *
 * Environment variables required:
 * - UPSTASH_REDIS_REST_URL: The Upstash Redis REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: The Upstash Redis REST API token
 */

import { Redis } from '@upstash/redis';

// Singleton instance
let redisInstance: Redis | null = null;

/**
 * Get the Redis client instance
 * Creates a new instance if one doesn't exist
 * @returns Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
      );
    }

    redisInstance = new Redis({
      url,
      token,
    });
  }

  return redisInstance;
}

/**
 * Export a default redis instance for convenience
 * Note: This will throw if environment variables are not set
 */
export const redis = {
  get instance() {
    return getRedisClient();
  },
};

export default redis;
