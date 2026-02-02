import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, getUser, getAllDeals, getDealsByStatus, getPartner } from '@/lib/redis/operations';
import type { DealStatus, Deal, Partner } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify Sovra admin session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('partner_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUser(session.userId);
    if (!user || user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    return NextResponse.json({ deals: dealsWithPartners });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
