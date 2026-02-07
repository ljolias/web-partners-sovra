import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { cookies } from 'next/headers';
import { getSession, getUser, getDeal, updateDeal, getPartner } from '@/lib/redis/operations';
import { sendDealApprovedEmail } from '@/lib/email/notifications';

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
    throw new ForbiddenError('Only Sovra Admin can approve deals');
  }

  // Get deal
  const deal = await getDeal(dealId);
  if (!deal) {
    throw new NotFoundError('Deal');
  }

  // Verify deal is in approvable state
  if (deal.status !== 'pending_approval' && deal.status !== 'more_info') {
    throw new ValidationError('Deal cannot be approved in current state');
  }

  // Update deal status
  await updateDeal(dealId, {
    status: 'approved',
    statusChangedAt: new Date().toISOString(),
    statusChangedBy: user.id,
  });

  // Send email notification to partner
  const [partner, createdByUser] = await Promise.all([
    getPartner(deal.partnerId),
    getUser(deal.createdBy),
  ]);

  if (partner && createdByUser) {
    await sendDealApprovedEmail(deal, partner, createdByUser);
  }

  logger.info('Deal approved', { dealId, partnerId: deal.partnerId });

  return NextResponse.json({ success: true });
});
