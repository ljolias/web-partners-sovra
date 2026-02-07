import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getDeal, createCopilotSession, getCopilotMessages } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { user, partner } = await requireSession();

    const { dealId } = await request.json();

    if (!dealId) {
      return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 });
    }

    const deal = await getDeal(dealId);

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deal.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const session = await createCopilotSession(dealId, user.id);
    const messages = await getCopilotMessages(session.id);

    return NextResponse.json({
      sessionId: session.id,
      messages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Create copilot session error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
