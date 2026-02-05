import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getTierHistory } from '@/lib/redis';

export async function GET() {
  try {
    const { partner } = await requireSession();
    const history = await getTierHistory(partner.id);

    return NextResponse.json({
      history,
      currentTier: partner.tier,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get tier history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
