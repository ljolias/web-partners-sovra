import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { logout } from '@/lib/auth';

export const POST = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    await logout();
    logger.info('User logged out');
    return NextResponse.json({ success: true });
  }),
  RATE_LIMITS.READ
);
