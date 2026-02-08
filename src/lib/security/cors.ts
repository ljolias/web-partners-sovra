/**
 * CORS configuration and utilities
 *
 * Configures Cross-Origin Resource Sharing for API endpoints to allow
 * controlled access from external domains and services.
 */

import { NextResponse } from 'next/server';

// Parse additional allowed origins from environment variable
const additionalOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://sovra.io',
  'https://www.sovra.io',
  'https://api.sovra.io',
  'https://id.sovra.io', // SovraID service
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
  process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:3000' : null,
  ...additionalOrigins,
].filter(Boolean) as string[];

/**
 * Webhooks and external services that should always be allowed
 * These are validated by other means (signatures, secrets)
 */
const WEBHOOK_USER_AGENTS = [
  'DocuSign', // DocuSign webhooks
  'SovraID', // SovraID webhooks
];

/**
 * Checks if an origin is allowed
 */
export function isOriginAllowed(origin: string | null, userAgent?: string | null): boolean {
  if (!origin) {
    // Allow requests without origin if from known webhook services
    if (userAgent && WEBHOOK_USER_AGENTS.some((agent) => userAgent.includes(agent))) {
      return true;
    }
    return false;
  }

  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Gets CORS headers for a given origin
 */
export function getCorsHeaders(
  origin?: string | null,
  userAgent?: string | null
): Record<string, string> {
  const isAllowed = isOriginAllowed(origin, userAgent);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : ALLOWED_ORIGINS[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin', // Important for caching
  };
}

/**
 * Handles CORS preflight requests
 */
export function handleCorsPreFlight(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin, userAgent),
    });
  }

  return null;
}

/**
 * Adds CORS headers to a response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin?: string | null,
  userAgent?: string | null
): NextResponse {
  const headers = getCorsHeaders(origin, userAgent);

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
    const userAgent = request.headers.get('user-agent');

    // Handle preflight
    const preflightResponse = handleCorsPreFlight(request);
    if (preflightResponse) {
      return preflightResponse;
    }

    // Execute handler
    const response = await handler(request);

    // Add CORS headers
    return addCorsHeaders(response, origin, userAgent);
  };
}

/**
 * Gets list of configured allowed origins (for debugging/monitoring)
 */
export function getAllowedOrigins(): string[] {
  return [...ALLOWED_ORIGINS];
}
