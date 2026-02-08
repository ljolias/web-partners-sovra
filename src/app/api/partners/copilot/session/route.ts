import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import { getDeal, createCopilotSession, getCopilotMessages } from '@/lib/redis';

export const POST = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    const { user, partner } = await requireSession();

    const { dealId } = await request.json();

    if (!dealId) {
      throw new ValidationError('Deal ID is required');
    }

    const deal = await getDeal(dealId);

    if (!deal) {
      throw new NotFoundError('Deal');
    }

    if (deal.partnerId !== partner.id) {
      throw new ForbiddenError('Access denied to this deal');
    }

    const session = await createCopilotSession(dealId, user.id);
    const messages = await getCopilotMessages(session.id);

    logger.info('Copilot session created', { sessionId: session.id, dealId, userId: user.id });

    return NextResponse.json({
      sessionId: session.id,
      messages,
    });
  }),
  RATE_LIMITS.CREATE
);
