import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, getUser, getDeal, updateDeal, getPartner } from '@/lib/redis/operations';
import { sendDealApprovedEmail } from '@/lib/email/notifications';

interface RouteParams {
  params: Promise<{ dealId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { dealId } = await params;

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

    // Get deal
    const deal = await getDeal(dealId);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify deal is in approvable state
    if (deal.status !== 'pending_approval' && deal.status !== 'more_info') {
      return NextResponse.json(
        { error: 'Deal cannot be approved in current state' },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
