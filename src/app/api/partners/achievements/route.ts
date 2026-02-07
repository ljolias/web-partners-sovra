import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getPartnerAchievements } from '@/lib/achievements';

export async function GET() {
  try {
    const { partner } = await requireSession();
    const achievements = await getPartnerAchievements(partner.id);

    // Calculate total points
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

    return NextResponse.json({
      achievements,
      totalPoints,
      count: achievements.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Get achievements error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
