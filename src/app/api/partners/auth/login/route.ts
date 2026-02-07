import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { login } from '@/lib/auth';
import { updatePartnerLastLogin } from '@/lib/rating';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const sessionData = await login(email, password);

  if (!sessionData) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Track login for activity monitoring
  await updatePartnerLastLogin(sessionData.partner.id);

  logger.info('User logged in', { userId: sessionData.user.id, partnerId: sessionData.partner.id });

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
      rating: sessionData.partner.rating,
    },
  });
});
