import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, getUser, getDeal, updateDeal, getPartner } from '@/lib/redis/operations';
import { sendDealRejectedEmail } from '@/lib/email/notifications';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

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

    // Parse and validate body
    const body = await request.json();
    const parsed = rejectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get deal
    const deal = await getDeal(dealId);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify deal is in rejectable state
    if (deal.status !== 'pending_approval' && deal.status !== 'more_info') {
      return NextResponse.json(
        { error: 'Deal cannot be rejected in current state' },
        { status: 400 }
      );
    }

    // Update deal status
    await updateDeal(dealId, {
      status: 'rejected',
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: user.id,
      rejectionReason: parsed.data.reason,
    });

    // Send email notification to partner
    const [partner, createdByUser] = await Promise.all([
      getPartner(deal.partnerId),
      getUser(deal.createdBy),
    ]);

    if (partner && createdByUser) {
      await sendDealRejectedEmail(deal, partner, createdByUser, parsed.data.reason);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
