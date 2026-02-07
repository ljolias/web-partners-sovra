import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { cookies } from 'next/headers';
import { getSession, getUser, getAllDeals, getDealsByStatus, getPartner } from '@/lib/redis/operations';
import type { DealStatus, Deal, Partner } from '@/types';

export const GET = withErrorHandling(async (request: NextRequest) => {
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
    throw new ForbiddenError('Only Sovra Admin can access deals');
  }

  // Get filter from query params
  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get('status');

  let deals: Deal[];

  if (statusFilter && statusFilter !== 'all') {
    deals = await getDealsByStatus(statusFilter as DealStatus);
  } else {
    deals = await getAllDeals();
  }

  // Enrich deals with partner info
  const dealsWithPartners = await Promise.all(
    deals.map(async (deal) => {
      const partner = await getPartner(deal.partnerId);
      return { ...deal, partner: partner || undefined } as Deal & { partner?: Partner };
    })
  );

  logger.debug('Deals retrieved', { count: deals.length, statusFilter });

  return NextResponse.json({ deals: dealsWithPartners });
});
