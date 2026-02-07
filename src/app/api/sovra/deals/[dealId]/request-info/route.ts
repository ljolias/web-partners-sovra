import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { cookies } from 'next/headers';
import { getSession, getUser, getDeal, updateDeal, getPartner } from '@/lib/redis/operations';
import { sendDealMoreInfoEmail } from '@/lib/email/notifications';
import { z } from 'zod';

const requestInfoSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

interface RouteParams {
  params: Promise<{ dealId: string }>;
}

export const POST = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { dealId } = await params;

  // Verify Sovra admin session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('partner_session')?.value;

  if (!sessionId) {
    throw new UnauthorizedError();
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new UnauthorizedError();
  }

  const user = await getUser(session.userId);
  if (!user || user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can request deal information');
  }

  // Parse and validate body
  const body = await request.json();
  const parsed = requestInfoSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message);
  }

  // Get deal
  const deal = await getDeal(dealId);
  if (!deal) {
    throw new NotFoundError('Deal');
  }

  // Verify deal is in valid state
  if (deal.status !== 'pending_approval') {
    throw new ValidationError('Can only request info for pending deals');
  }

  // Update deal status
  await updateDeal(dealId, {
    status: 'more_info',
    statusChangedAt: new Date().toISOString(),
    statusChangedBy: user.id,
    rejectionReason: parsed.data.message, // Reuse field for info request message
  });

  // Send email notification to partner
  const [partner, createdByUser] = await Promise.all([
    getPartner(deal.partnerId),
    getUser(deal.createdBy),
  ]);

  if (partner && createdByUser) {
    await sendDealMoreInfoEmail(deal, partner, createdByUser, parsed.data.message);
  }

  logger.info('More information requested for deal', { dealId, partnerId: deal.partnerId });

  return NextResponse.json({ success: true });
});
