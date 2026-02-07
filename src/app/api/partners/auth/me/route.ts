import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { UnauthorizedError } from '@/lib/errors';
import { getCurrentSession } from '@/lib/auth';

export const GET = withErrorHandling(async () => {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    throw new UnauthorizedError('Not authenticated');
  }

  logger.debug('Current session retrieved', { userId: sessionData.user.id });

  return NextResponse.json({
    user: {
      id: sessionData.user.id,
      email: sessionData.user.email,
      name: sessionData.user.name,
      role: sessionData.user.role,
    },
    partner: {
      id: sessionData.partner.id,
      name: sessionData.partner.name,
      companyName: sessionData.partner.companyName,
      tier: sessionData.partner.tier,
    },
  });
});
