import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getNextTierRequirements } from '@/lib/achievements';

export async function GET() {
  try {
    const { partner } = await requireSession();
    const progress = await getNextTierRequirements(partner.id);

    if (!progress) {
      // Partner is already at platinum tier
      return NextResponse.json({
        currentTier: partner.tier,
        nextTier: null,
        progress: null,
        message: 'Already at highest tier',
      });
    }

    return NextResponse.json({
      currentTier: partner.tier,
      nextTier: progress.tier,
      progress,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get achievements progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
