/**
 * Middleware for applying rate limiting to API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitConfig } from '@/lib/security/rateLimit';
import { getClientIp } from '@/lib/security/ip';
import { logger } from '@/lib/logger';

/**
 * Wraps an API route handler with rate limiting (without context)
 */
export function withRateLimit<T extends Response = NextResponse>(
  handler: (request: NextRequest) => Promise<T>,
  config?: Partial<RateLimitConfig>
): (request: NextRequest) => Promise<T | NextResponse>;

/**
 * Wraps an API route handler with rate limiting (with context)
 */
export function withRateLimit<T extends Response = NextResponse, Context = any>(
  handler: (request: NextRequest, context: Context) => Promise<T>,
  config?: Partial<RateLimitConfig>
): (request: NextRequest, context: Context) => Promise<T | NextResponse>;

/**
 * Implementation
 */
export function withRateLimit<T extends Response = NextResponse, Context = any>(
  handler: (request: NextRequest, context?: Context) => Promise<T>,
  config?: Partial<RateLimitConfig>
) {
  return async (request: NextRequest, context?: Context): Promise<T | NextResponse> => {
    const identifier = getClientIp(request);

    const rateLimitConfig: RateLimitConfig = {
      interval: config?.interval || 60,
      maxRequests: config?.maxRequests || 100,
    };

    const result = await rateLimit(identifier, rateLimitConfig);

    if (!result.success) {
      logger.warn('Rate limit exceeded for request', {
        ip: identifier,
        path: request.nextUrl.pathname,
        limit: result.limit,
      });

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      ) as T | NextResponse;
    }

    // Execute the handler with optional context
    const response = await handler(request, context);

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());

    return response;
  };
}

/**
 * Rate limit presets for common use cases
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { interval: 60, maxRequests: 5 }, // 5 attempts per minute
  REGISTER: { interval: 60, maxRequests: 3 }, // 3 registrations per minute

  // Data modification
  CREATE: { interval: 60, maxRequests: 20 }, // 20 creates per minute
  UPDATE: { interval: 60, maxRequests: 30 }, // 30 updates per minute
  DELETE: { interval: 60, maxRequests: 10 }, // 10 deletes per minute

  // Data reading
  READ: { interval: 60, maxRequests: 100 }, // 100 reads per minute
  LIST: { interval: 60, maxRequests: 60 }, // 60 list queries per minute

  // File operations
  UPLOAD: { interval: 3600, maxRequests: 20 }, // 20 uploads per hour
  DOWNLOAD: { interval: 60, maxRequests: 50 }, // 50 downloads per minute

  // Quiz/Testing
  QUIZ_SUBMIT: { interval: 60, maxRequests: 10 }, // 10 quiz submissions per minute

  // Webhook/External
  WEBHOOK: { interval: 60, maxRequests: 100 }, // 100 webhook calls per minute

  // Search
  SEARCH: { interval: 60, maxRequests: 30 }, // 30 searches per minute
} as const;
