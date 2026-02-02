import { NextRequest, NextResponse } from 'next/server';
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
    const parsed = requestInfoSchema.safeParse(body);

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

    // Verify deal is in valid state
    if (deal.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Can only request info for pending deals' },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error requesting info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
