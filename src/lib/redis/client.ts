import { Redis } from '@upstash/redis';

function getRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // During build time, return a dummy client that will fail gracefully
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.error('Redis credentials not configured');
    }
    // Return a Redis instance that will fail on actual operations
    // This allows the build to succeed
    return new Redis({
      url: url || 'https://placeholder.upstash.io',
      token: token || 'placeholder',
    });
  }

  return new Redis({ url, token });
}

export const redis = getRedisClient();
export default redis;
