/**
 * Redis-based rate limiting with sliding window
 */

import { redis } from '@/lib/redis/client';
import { logger } from '@/lib/logger';
import { randomBytes } from 'crypto';

export interface RateLimitConfig {
  interval: number; // seconds
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // timestamp when window resets
  limit: number;
}

/**
 * Implements rate limiting using Redis sorted sets with sliding window
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60, maxRequests: 100 }
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.interval * 1000;

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove entries outside the current window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    pipeline.zcard(key);

    // Add current request with cryptographically secure random suffix
    const randomSuffix = randomBytes(4).toString('hex');
    pipeline.zadd(key, { score: now, member: `${now}-${randomSuffix}` });

    // Set expiration to avoid memory leaks
    pipeline.expire(key, config.interval * 2);

    const results = await pipeline.exec();

    // Extract count from pipeline results
    // results[1] is the ZCARD result [error, value]
    const count = Array.isArray(results) && results[1]
      ? ((results[1] as [Error | null, number])[1] || 0)
      : 0;

    if (count >= config.maxRequests) {
      logger.warn('Rate limit exceeded', {
        identifier,
        count,
        limit: config.maxRequests,
      });

      return {
        success: false,
        remaining: 0,
        reset: windowStart + config.interval * 1000,
        limit: config.maxRequests,
      };
    }

    return {
      success: true,
      remaining: config.maxRequests - count - 1,
      reset: windowStart + config.interval * 1000,
      limit: config.maxRequests,
    };
  } catch (error) {
    logger.error('Rate limit check failed', { error, identifier });

    // On error, allow the request but log it
    return {
      success: true,
      remaining: config.maxRequests,
      reset: now + config.interval * 1000,
      limit: config.maxRequests,
    };
  }
}

/**
 * Resets rate limit for a specific identifier
 * Useful for testing or manual overrides
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const key = `ratelimit:${identifier}`;
  try {
    await redis.del(key);
    logger.info('Rate limit reset', { identifier });
  } catch (error) {
    logger.error('Failed to reset rate limit', { error, identifier });
  }
}

/**
 * Gets current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): Promise<Omit<RateLimitResult, 'success'>> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.interval * 1000;

  try {
    // Clean old entries and count
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);

    return {
      remaining: Math.max(0, config.maxRequests - count),
      reset: windowStart + config.interval * 1000,
      limit: config.maxRequests,
    };
  } catch (error) {
    logger.error('Failed to get rate limit status', { error, identifier });
    return {
      remaining: config.maxRequests,
      reset: now + config.interval * 1000,
      limit: config.maxRequests,
    };
  }
}
