import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { getSession, getUser, getPartner } from '@/lib/redis/operations';
import { getTierHistory } from '@/lib/redis/rewards';

async function verifySovraAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('partner_session')?.value;

  if (!sessionId) {
    throw new Error('Unauthorized');
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Unauthorized');
  }

  const user = await getUser(session.userId);
  if (!user || user.role !== 'sovra_admin') {
    throw new Error('Forbidden');
  }

  return user;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const user = await verifySovraAdmin();
    const { partnerId } = await params;

    // Verify partner exists
    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get tier history
    const history = await getTierHistory(partnerId, 50);

    return NextResponse.json({
      success: true,
      partner: {
        id: partnerId,
        companyName: partner.companyName,
        currentTier: partner.tier,
      },
      history,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    logger.error('Get tier history error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
