/**
 * CORS configuration and utilities
 */

import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://sovra.io',
  'https://www.sovra.io',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean) as string[];

/**
 * Checks if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Gets CORS headers for a given origin
 */
export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && isOriginAllowed(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handles CORS preflight requests
 */
export function handleCorsPreFlight(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  return null;
}

/**
 * Adds CORS headers to a response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin?: string | null
): NextResponse {
  const headers = getCorsHeaders(origin);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Wrapper for API handlers with CORS support
 */
export function withCors(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const origin = request.headers.get('origin');

    // Handle preflight
    const preflightResponse = handleCorsPreFlight(request);
    if (preflightResponse) {
      return preflightResponse;
    }

    // Execute handler
    const response = await handler(request);

    // Add CORS headers
    return addCorsHeaders(response, origin);
  };
}
