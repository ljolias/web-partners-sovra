import { NextResponse } from 'next/server';
import { withCors, getAllowedOrigins } from '@/lib/security/cors';

/**
 * Health check endpoint with CORS enabled
 *
 * Used for monitoring and CORS testing
 */
export const GET = withCors(async (request: Request) => {
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent');

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      origin: origin || 'none',
      allowed: getAllowedOrigins().length > 0,
      allowedOrigins: process.env.NODE_ENV === 'development' ? getAllowedOrigins() : undefined,
    },
    service: 'Sovra Partners API',
    version: '1.0.0',
  });
});

/**
 * OPTIONS preflight is automatically handled by withCors wrapper
 */
